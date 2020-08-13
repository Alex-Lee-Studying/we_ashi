var app = getApp()
var hasClick = false
Page({
  data: {
    deliveryId: null,
    delivery: {},
    pay: 'wechat'
  },

  onLoad(option) {
    console.log(option)
    if (option.id) {
      this.setData({ deliveryId: option.id })
      this.getDelivery()
    } else {
      wx.redirectTo({
        url: '/pages/delivery/index'
      })
    }
  },

  radioChange(e) {
    this.setData({ pay: e.detail.value })
  },

  getDelivery: function () {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries/' + this.data.deliveryId,
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.departure = res.data.departure ? res.data.departure.replace('@', ',') : ''
          res.data.destination = res.data.destination ? res.data.destination.replace('@', ',') : ''
          self.setData({ delivery: res.data })
        } else {
          console.log(res)
          wx.showToast({ title: res.data.msg, icon: 'none' })
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        wx.hideLoading()
        hasClick = false
      }
    })
  },

  // 支付
  topay() {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/payments',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: { delivery_id: this.data.deliveryId, method: 'miniprogram' }, 
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.doPay(res.data.params)
        } else {
          console.log(res)
          if (res.errMsg && res.errMsg === 'request:ok') {
            if (res.data.msg && res.data.msg.indexOf('Token Expired') !== -1) {
              wx.navigateTo({
                url: '/pages/user/auth/auth',
              })
            } else {
              wx.showToast({ title: res.data.msg, icon: 'none' })
            }
          } else {
            wx.showToast({ title: res.errMsg || '请求出错', icon: 'none' })
          }
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        wx.hideLoading()
        hasClick = false
      }
    })
  },

  doPay(params) {
    var self = this
    wx.requestPayment({
      timeStamp: params.timestamp + '',
      nonceStr: params.nonce_str,
      package: 'prepay_id=' + params.prepay_id,
      signType: params.sign_type,
      paySign: params.sign,
      success (res) {

        wx.redirectTo({
          url: '/pages/delivery/result/result?id=' + self.data.deliveryId
        })
      },
      fail (res) {
        console.log(res)
      }
    })
  }
})
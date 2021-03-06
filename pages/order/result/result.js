var app = getApp()
var hasClick = false
var interval = null
Page({
  data: {
    deliveryId: null,
    delivery: {},
    payment: null,
    second: 3, // 3秒后调用支付查询接口
  },

  onLoad(option) {
    console.log(option)
    if (option.id) {
      this.setData({ deliveryId: option.id })
      this.getDelivery()
    } else {
      wx.redirectTo({
        url: '/pages/order/index'
      })
    }
  },
  
  onShow: function () {
    var that = this
    interval = setInterval(function () {
      if (that.data.payment && that.data.payment.delivery_id) {
        clearInterval(interval)
      } else {
        if (that.data.second <= 0) {
          that.getPayResult()
        }
        var second = that.data.second - 1
        that.setData({
          second: second
        })
      }
    }, 1000);
  },

  onHide: function () {
    clearInterval(interval)
  },

  onUnload: function () {
    clearInterval(interval)
  },

  getDelivery: function () {
    var self = this

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries/' + this.data.deliveryId,
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.departure = res.data.departure.indexOf('@') === 0 ? res.data.departure.slice(1) : res.data.departure
          res.data.destination = res.data.destination.indexOf('@') === 0 ? res.data.destination.slice(1) : res.data.destination
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
        // hasClick = false
      }
    })
  },

  getPayResult: function () {
    var self = this

    var params= {
      delivery_id: this.data.deliveryId
    }
    if (hasClick) return
    hasClick = true

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/payments' ,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({
            payment: res.data[0] || {}
          })
        } else {
          console.log(res)
          wx.showToast({ title: res.data.msg, icon: 'none' })
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        hasClick = false
      }
    })
  }

})
var app = getApp()
var hasClick = false
Page({
  data: {
    deliveryId: null,
    delivery: {},
    orderTotal: 0,
    discountId: '',
    orderDiscountTotal: 0
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
          res.data.departure = res.data.departure.indexOf('@') === 0 ? res.data.departure.slice(1) : res.data.departure
          res.data.destination = res.data.destination.indexOf('@') === 0 ? res.data.destination.slice(1) : res.data.destination
          res.data.departure = res.data.departure ? res.data.departure.replace('@', ',') : ''
          res.data.destination = res.data.destination ? res.data.destination.replace('@', ',') : ''

          var orderTotal = 0
          if (res.data.need_agent) {
            orderTotal = res.data.price + res.data.freight + res.data.freight * res.data.fee_rate
          } else {
            orderTotal = res.data.freight + res.data.freight * res.data.fee_rate
          }
          self.setData({ delivery: res.data, orderTotal: orderTotal })
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

  toOrder() {
    wx.navigateTo({
      url: '/pages/order/pay/pay?id=' + this.data.deliveryId + '&discountId=' + this.data.discountId,
    })    
  },

  discountCalculate: function() {
    if (this.data.discountId === '') return
    var self = this
    var params = {
      discount: this.data.discountId,
      price: this.data.orderTotal
    }

    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/discount-calculate',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({
            orderDiscountTotal: res.data.price
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
        wx.hideLoading()
      }
    })
  }
})
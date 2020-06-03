var app = getApp()
var hasClick = false
Page({
  data: {
    deliveryId: null,
    delivery: {},
    take: 1
  },
  onLoad(option) {
    console.log(option)
    // this.setData({ deliveryId: 'brbkbunbd4mh9oo39500' })
    // this.getDelivery()
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
    this.setData({ take: e.detail.value })
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
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
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

  toOrder() {
    wx.navigateTo({
      url: '/pages/delivery/confirm/confirm',
    })
  }
})
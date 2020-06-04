var app = getApp()
var hasClick = false
Page({
  data: {
    address: null,
    deliveryId: null,
    delivery: {},
    take: 1
  },

  onLoad(option) {
    console.log(option)

    // this.setData({ deliveryId: 'brc68qnbd4mh9oo3956g' })
    // this.getDelivery()
    // return

    if (option.id) {
      this.setData({ deliveryId: option.id })
      this.getDelivery()
    } else {
      wx.redirectTo({
        url: '/pages/delivery/index'
      })
    }
  },

  onShow: function () {
    var that = this
    let pages = getCurrentPages()
    let currPage = pages[pages.length - 1] //当前页
    if (currPage.data.address) {
      //调取接口操作
      console.log('有地址')
      console.log(currPage.data.address)
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
    wx.redirectTo({
      url: '/pages/delivery/confirm/confirm?id=' + this.data.deliveryId,
    })
  }
})
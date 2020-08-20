var app = getApp()
var hasClick = false

Page({
  data: {
    isIphoneX: app.globalData.isIphoneX,
    tabname: 'express',
    expressList: [],
    officalAddressList: []
  },
  onLoad: function () {
    this.getOfficalAddressList()
    this.getExpressList()
  },
  onShow: function () {
    // 设置tabbar选中
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },
  changeTab(e) {
    var tab = e.target.dataset.tab
    this.setData({ tabname: tab })
  },

  getOfficalAddressList: function () {
    var self = this

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/offical-addresses',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ officalAddressList: res.data })
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

  getExpressList: function () {
    var self = this

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/expresses',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          var copy = {}
          res.data.map((value, index, array) => {
            if (Object.keys(copy).includes(value.country_code)) {
              copy[value.country_code].sub.push(value)
            } else {
              copy[value.country_code] = {
                country_code: value.country_code,
                country_desc: value.country_desc,
                country_icon: value.country_icon,
                sub: [value]
              }
            }
          })
          self.setData({ expressList: copy })
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
  expressDetail (e) {
    var express = JSON.stringify(e.currentTarget.dataset.express);
    wx.navigateTo({
      url: '/pages/service/expressDetail/expressDetail?express=' + express,
    })
  }
})

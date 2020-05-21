// pages/delivery/confirm/confirm.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  toOrder() {
    wx.navigateTo({
      url: '/pages/delivery/pay/pay',
    })
  }
})
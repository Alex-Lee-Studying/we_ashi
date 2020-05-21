// pages/delivery/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    take: 1
  },

  radioChange(e) {
    this.setData({ take: e.detail.value })
  },

  toOrder() {
    wx.navigateTo({
      url: '/pages/delivery/confirm/confirm',
    })
  }
})
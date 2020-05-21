// pages/order/pay/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pay: 'wechat'
  },
  radioChange(e) {
    this.setData({ pay: e.detail.value })
  },
  topay() {
    wx.redirectTo({
      url: '/pages/order/result/result'
    })
  }
})
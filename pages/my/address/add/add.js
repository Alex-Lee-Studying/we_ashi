// pages/my/address/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recipient: '',
    mobile: '',
    details: '',
    setDefault: true
  },

  switchDefault(e) {
    console.log(e.detail.value)
  },
  addAddress() {
    wx.navigateBack({
      delta: 1
    })
  }
})
// pages/my/wallet/pickup/pickup.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    total: 679,
    pickupInput: ''
  },
  getall() {
    this.setData({ pickupInput: this.data.total })
  },
  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  }
})
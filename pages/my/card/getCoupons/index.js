// pages/my/card/getCoupons/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showSuccess: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  getCoupon: function () {
    this.setData({
      showSuccess: true
    });
  },
  hideSuccessDialog: function() {
    this.setData({
      showSuccess: false
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
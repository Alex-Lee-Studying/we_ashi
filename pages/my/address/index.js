// pages/my/address/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedAddressId: 123,
    addressList: [
      {
        "recipient": "王天霸",
        "mobile": "18678786787",
        "details": "北京市 北京市 朝阳区 花园路甲220号花园路甲25号写字楼230室",
        "default": true,
        "id": 123
      },
      {
        "recipient": "王天霸",
        "mobile": "186755523336",
        "details": "北京市 北京市 朝阳区 花园路甲220号花园路甲25号写字楼230室",
        "default": false,
        "id": 124
      }
    ]
  },
  use: function(e) {
    var addId = e.currentTarget.dataset.addressid
    this.setData({ selectedAddressId: addId })
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
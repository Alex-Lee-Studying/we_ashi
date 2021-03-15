var hasClick = false
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    user: {},
    openSettingBtnHidden: true, //是否授权
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.user.id) {
      this.setData({ userId: app.globalData.user.id, user: app.globalData.user })
      // this.getUser()
    } else {
      wx.switchTab({
        url: '/pages/my/my'
      })
    }
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
    this.makePhoto()
  },

  save: function () {
    let that = this
    //若二维码未加载完毕，加个动画提高用户体验
    wx.showToast({
      icon: 'loading',
      title: '正在保存图片',
      duration: 1000
    })
    //判断用户是否授权"保存到相册"
    wx.getSetting({
      success(res) {
        //没有权限，发起授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {//用户允许授权，保存图片到相册
              that.savePhoto()
            },
            fail() {//用户点击拒绝授权，跳转到设置页，引导用户授权
              that.setData({
                openSettingBtnHidden: false
              })
            }
          })
        } else {//用户已授权，保存到相册
          that.savePhoto()
        }
      }
    })
  },

  savePhoto: function () {
    wx.canvasToTempFilePath({
      canvasId: 'canvas',
      success(res) {
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '图片成功保存到相册了',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  },

  // 授权
  handleSetting: function (e) {
    let that = this;
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮

    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
        content: '若不打开授权，则无法将图片保存在相册中！',
        showCancel: false
      })
      that.setData({
        openSettingBtnHidden: false
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您已授权，赶紧将图片保存在相册中吧！',
        showCancel: false
      })
      that.setData({
        openSettingBtnHidden: true
      })
    }
  },

  makePhoto: function () {
    var ctx = wx.createCanvasContext('canvas')
    var w = this.getRatio()
    // 绘制背景
    ctx.setFillStyle("#fff");
    ctx.fillRect(0, 0, 750 / 2 * w, 1225 / 2 * w);

    ctx.drawImage('/images/coupon/canvas_shareBg.png', 0, 0, 750 / 2 * w, 787 / 2 * w)

    ctx.setFontSize(35 / 2 * w)
    ctx.setFillStyle('#fff')
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.fillText(this.data.user.nick_name, 750 / 2 * w / 2, 280 / 2 * w)

    ctx.drawImage('/images/coupon/miniProImg.jpg', (750 - 290) / 2 * w / 2, 835 / 2 * w, 290 / 2 * w, 290 / 2 * w)

    ctx.setFontSize(26 / 2 * w)
    ctx.setFillStyle('#333')
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.fillText('长按小程序码下单', 750 / 2 * w / 2, 1170 / 2 * w)

    ctx.draw()
  },

  getRatio() {
    let w = 414;
    wx.getSystemInfo({
      success: function (res) {
        w = res.windowWidth / 375; // 按照750的屏宽
      },
    })
    return w
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

  },

  // 分享到朋友圈
  onShareTimeline: function() {
    imageUrl = '/images/logo-login.png'
    return {
      title: this.data.user.nick_name + '邀请你领券 下单更优惠',
      // query: '',
      imageUrl: imageUrl
    }
  }

})
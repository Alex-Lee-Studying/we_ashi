var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: null
  },
  onLoad() {
    this.setData({ isLogin: app.globalData.isLogin })
    this.setData({ userInfo: app.globalData.userInfo })
  },
  logout() {
    wx.showModal({
      title: '',
      content: '确定要退出当前账号吗？',
      cancelText: '取消',
      confirmText: '退出',
      success(res) {
        if (res.confirm) {
          wx.clearStorage({
            success: function (res) {
              console.log('成功')
              app.globalData.isLogin = false
              wx.switchTab({
                url: '/pages/my/my',
              })
            },
            fail: function (res) {
              wx.showToast({ title: '失败！', icon: 'none' })
            },
            complete: function (res) {
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }

})
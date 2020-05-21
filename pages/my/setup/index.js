// pages/my/setup/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  logout() {
    wx.showModal({
      title: '',
      content: '确定要退出当前账号吗？',
      cancelText: '取消',
      confirmText: '退出',
      success(res) {
        if (res.confirm) {
          console.log('用户点击退出')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }

})
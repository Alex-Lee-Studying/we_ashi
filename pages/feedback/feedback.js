// pages/feedback/feedback.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refers: [
      { name: '社交媒体', value: '社交媒体' },
      { name: '网络搜索', value: '网络搜索' },
      { name: '朋友推荐', value: '朋友推荐' }
    ],
    refer: '社交媒体'
  },

  radioChange(e) {
    this.setData({ refer: e.detail.value })
  },

  submit() {
    wx.showModal({
      title: '',
      content: '您的宝贵意见我们已经收到',
      showCancel: false,
      confirmText: '谢谢反馈',
      confirmColor: '#033150',
      success(res) {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/my/my',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})
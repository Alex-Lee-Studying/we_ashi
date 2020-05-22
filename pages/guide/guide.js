var interval = null
Page({
  data: {
    second: 3,
    imgs: [
      "/images/guide1.jpg",
      "/images/guide2.jpg"
    ]
  },
  onShow: function() {
    var _this = this
    interval = setInterval(function () {
      if (_this.data.second === 0) {
        wx.switchTab({
          url: '/pages/index/index'
        })
        clearInterval(interval)
      } else {
        var second = _this.data.second - 1
        _this.setData({
          second: second
        })
      }      
    }, 1000);
  },
  onHide: function() {
    clearInterval(interval)
  },
  onUnload: function() {
    clearInterval(interval)
  },
  start() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})

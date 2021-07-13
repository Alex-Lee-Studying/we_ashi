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
  getBanners() {
    var self = this

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/banners',
      method: 'GET',
      header: { 'page': this.data.currPageTravel, 'page-size': this.data.pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      // data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length < self.data.pageSize) {
            var reqState = false
            self.setData({
              noMoreTravelsFlag: true
            })
          } else {
            var reqState = true
          }
          console.log(res.data)
          
          self.setData({
            banner_list: res.data
          })
        } else {

        }
      },
    })
  },
  start() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})

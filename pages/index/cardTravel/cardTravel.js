var app = getApp()
var hasClick = false
Page({
  data: {
    travelId: null,
    travel: {}
  },

  onLoad(option) {
    console.log(option)
    if (option.id) {
      this.setData({ travelId: option.id })
      this.getTravel()
    } else {
      wx.switchTab({
        url: '/pages/my/my'
      })
    }
  },

  getTravel: function () {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/travels/' + this.data.travelId,
      method: 'GET',
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.dt_departure = res.data.dt_departure ? app.globalData.moment.utc(res.data.dt_departure).format('YYYY-MM-DD') : ''
          self.setData({ travel: res.data })
        } else {
          console.log(res)
          wx.showToast({ title: res.data.msg, icon: 'none' })
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        wx.hideLoading()
        hasClick = false
      }
    })
  }
})
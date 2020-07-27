var hasClick = false
var app = getApp()
Page({
  data: {
    isIphoneX: app.globalData.isIphoneX,
    sessionList: []
  },
  onLoad: function () {
  },
  onShow: function () {
    // 设置tabbar选中
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    
    if (!app.globalData.isLogin || !app.globalData.user || !app.globalData.user.id) {
      wx.redirectTo({
        url: '/pages/user/auth/auth',
      })
    } else {
      this.getSessions()
    }
  },
  handleContact(e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  },
  getSessions() {
    var self = this
    var page = 0
    var pageSize = 20

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/sessions',
      method: 'GET',
      header: { 'page': page, 'page-size': pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length) {
            // 筛选目标用户
            var sessionArr = []
            var target = {}
            var session = {}
            for(var i = 0; i < res.data.length; i++) {
              session = res.data[i]
              session.created = session.created ? app.globalData.moment.utc(session.created).format('YYYY-MM-DD'): ''
              if (session.users && session.users.length) {
                target = {}
                session.users.forEach((item, index, arr) => {
                  if (item.id !== app.globalData.user.id) {
                    target = item
                    return
                  }
                })
                session.target = target
              }
              sessionArr.push(session)
            }
            self.setData({ sessionList: sessionArr })
          }

        } else {
          if (res.data.msg && res.data.msg.indexOf('Token Expired') !== -1) {
            wx.navigateTo({
              url: '/pages/user/auth/auth',
            })
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none' })
          }
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
  },
})

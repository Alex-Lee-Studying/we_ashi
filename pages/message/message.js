var hasClick = false
var app = getApp()
Page({
  data: {
    delBtnWidth: 160,
    isIphoneX: app.globalData.isIphoneX,
    sessionList: [],
    pageSize: 20,
    getSessionsFlag: true,
    currPageSession: 0,
    noMoreSessionsFlag: false
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

    if (!this.data.getSessionsFlag) return
    this.setData({ getSessionsFlag: false })
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/sessions',
      method: 'GET',
      header: { 'page': this.data.currPageSession, 'page-size': this.data.pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length < self.data.pageSize) {
            var reqState = false
            self.setData({
              noMoreSessionsFlag: true
            })
          } else {
            var reqState = true
          }

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
              session.right = 0
              sessionArr.push(session)
            }
            var list = self.data.sessionList.concat(sessionArr)
            self.setData({
              sessionList: list
            })
          }
          var nextPage = ++self.data.currPageSession
          self.setData({
            getSessionsFlag: reqState,
            currPageSession: nextPage
          })
        } else {
          self.setData({
            getSessionsFlag: true
          })
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
        self.setData({
          getSessionsFlag: true
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  },

  onReachBottom() {    
    this.getSessions()
  },

  drawStart: function (e) {
    // console.log("drawStart");  
    var touch = e.touches[0]

    for (var index in this.data.sessionList) {
      var item = this.data.sessionList[index]
      item.right = 0
    }
    this.setData({
      sessionList: this.data.sessionList,
      startX: touch.clientX,
    })

  },

  drawMove: function (e) {
    var touch = e.touches[0]
    var item = this.data.sessionList[e.currentTarget.dataset.index]
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        sessionList: this.data.sessionList
      })
    } else {
      item.right = 0
      this.setData({
        sessionList: this.data.sessionList
      })
    }
  },

  drawEnd: function (e) {
    var item = this.data.sessionList[e.currentTarget.dataset.index]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        sessionList: this.data.sessionList,
      })
    } else {
      item.right = 0
      this.setData({
        sessionList: this.data.sessionList,
      })
    }
  },

  delItem: function (e) {
    var sid = e.target.dataset.sid
    var idx = e.target.dataset.index
    var self = this

    wx.showModal({
      title: '',
      content: '您确定要删除该会话吗？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/message/v1/sessions-removal',
            method: 'PUT',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            data: [ sid ],
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '会话删除成功' })
                self.data.sessionList.splice(idx, 1)
                self.setData({ sessionList: self.data.sessionList })
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

        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
    })
  }
})

var hasClick = false
var app = getApp()
Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isLogin: false,
    user: null,
    tabname: 'delivery',
    travelList: [],
    deliveryList: []
  },
  onShow() {
    // 设置tabbar选中
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }

    if (app.globalData.user && app.globalData.user.id) {
      this.getDeliverys()
      this.setData({ user: app.globalData.user })
    }

    console.log('app.islogin: ' + app.globalData.isLogin)
    this.setData({ isLogin: app.globalData.isLogin })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getuserinfo(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  changeTab(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ tabname: tab })
    if (tab === 'delivery') {
      this.getDeliverys()
    } else if (tab === 'travel') {
      this.getTravels()
    }
  },
  getTravels() {
    var self = this
    var page = 0
    var pageSize = 20
    var params = {
      user_id: app.globalData.user.id
    }

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/travels',
      method: 'GET',
      header: { 'page': page, 'page-size': pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          self.setData({ travelList: res.data })
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
  getDeliverys() {
    var self = this
    var page = 0
    var pageSize = 20
    var params = {
      user_id: app.globalData.user.id
    }

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries',
      method: 'GET',
      header: { 'page': page, 'page-size': pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          self.setData({ deliveryList: res.data })
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

  onShareAppMessage(option) {
    if (option.from === 'button') {
      var path = ''
      var imageUrl = ''
      var type = option.target.dataset.type
      var item = option.target.dataset.item
      if (type === 'travel') {
        path = '/pages/my/travelDetail/travelDetail?id=' + item.id
        imageUrl = '/images/plane.png'
      } else if (type === 'delivery') {
        path = '/pages/my/deliveryDetail/deliveryDetail?id=' + item.id
        imageUrl = (item.resources[0] && item.resources[0].name) || '/images/travel.png'
      }
      return {
        title: '脚递',
        path: path,
        imageUrl: imageUrl,
        success: (res) => {
          // 分享成功
          wx.showToast({
            title: '分享成功',
            icon: 'success'
          })
        },
        fail: (res) => {
          // 分享失败
          wx.showToast({
            title: '分享失败',
            icon: 'none'
          })
        }
      }
    }
  }
})

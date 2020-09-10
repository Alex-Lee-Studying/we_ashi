var hasClick = false
var app = getApp()
Page({
  data: {
    isIphoneX: app.globalData.isIphoneX,
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isLogin: false,
    user: null,
    tabname: 'delivery',
    travelList: [],
    deliveryList: [],
    pageSize: 5,
    getTravelsFlag: true,
    getDeliverysFlag: true,
    currPageTravel: 0,
    currPageDelivery: 0,
    noMoreTravelsFlag: false,
    noMoreDeliverysFlag: false
  },

  onLoad() {
    if (app.globalData.user && app.globalData.user.id) {
      this.getDeliverys()
      this.setData({ user: app.globalData.user })
    }
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

  onReachBottom() {
    if (this.data.tabname === 'delivery') {
      this.getDeliverys()
    } else if (this.data.tabname === 'travel') {
      this.getTravels()
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
    var params = {
      user_id: app.globalData.user.id
    }

    if (!this.data.getTravelsFlag) return
    this.setData({ getTravelsFlag: false })
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/travels',
      method: 'GET',
      header: { 'page': this.data.currPageTravel, 'page-size': this.data.pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
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
          res.data.forEach((item, index, array) => {
            item.created = item.created ? app.globalData.moment.utc(item.created).format('YYYY-MM-DD') : ''
            item.dt_departure = item.dt_departure ? app.globalData.moment.utc(item.dt_departure).format('YYYY-MM-DD') : ''
            item.departure = item.departure.indexOf('@') === 0 ? item.departure.slice(1) : item.departure
            item.destination = item.destination.indexOf('@') === 0 ? item.destination.slice(1) : item.destination
            item.departure = item.departure ? item.departure.replace('@', ',') : ''
            item.destination = item.destination ? item.destination.replace('@', ',') : ''
          })

          var list = self.data.travelList.concat(res.data)
          var nextPage = ++self.data.currPageTravel
          self.setData({
            travelList: list,
            getTravelsFlag: reqState,
            currPageTravel: nextPage
          })
        } else {
          self.setData({
            getTravelsFlag: true
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
          getTravelsFlag: true
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  },

  getDeliverys() {
    var self = this
    var params = {
      user_id: app.globalData.user.id
    }

    if (!this.data.getDeliverysFlag) return
    this.setData({ getDeliverysFlag: false })
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries',
      method: 'GET',
      header: { 'page': this.data.currPageDelivery, 'page-size': this.data.pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length < self.data.pageSize) {
            var reqState = false
            self.setData({
              noMoreDeliverysFlag: true
            })
          } else {
            var reqState = true
          }
          res.data.forEach((item, index, array) => {
            item.created = item.created ? app.globalData.moment.utc(item.created).format('YYYY-MM-DD') : ''
            item.departure = item.departure.indexOf('@') === 0 ? item.departure.slice(1) : item.departure
            item.destination = item.destination.indexOf('@') === 0 ? item.destination.slice(1) : item.destination
            item.departure = item.departure ? item.departure.replace('@', ',') : ''
            item.destination = item.destination ? item.destination.replace('@', ',') : ''
          })

          var list = self.data.deliveryList.concat(res.data)
          var nextPage = ++self.data.currPageDelivery
          self.setData({
            deliveryList: list,
            getDeliverysFlag: reqState,
            currPageDelivery: nextPage
          })
        } else {
          self.setData({
            getDeliverysFlag: true
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
          getDeliverysFlag: true
        })
      },
      complete: function (res) {
        wx.hideLoading()
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

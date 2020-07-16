var hasClick = false
var app = getApp()
Page({
  data: {
    isIphoneX: app.globalData.isIphoneX,
    navbarInitTop: 0, //导航栏初始化距顶部的距离
    isFixedTop: false, //是否固定顶部
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tabname: 'delivery',
    departure: '',
    destination: '',
    travelSearch: {
      page: 0,
      pageSize: 20,
      user_id: app.globalData.user.id,
      start_time: '',
      end_time: ''
    },
    deliverySearch: {
      page: 0,
      pageSize: 20,
      user_id: app.globalData.user.id,
      travel_id: '',
    },
    deliveryList: [],
    travelList: []
  },

  onLoad: function () {
  },

  onShow: function () {
    var that = this

    if (this.data.tabname === 'delivery') {
      this.getDeliverys()
    } else if (this.data.tabname === 'travel') {
      this.getTravels()
    }
    
    // 设置tabbar选中
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }

    if (that.data.navbarInitTop == 0) {
      //获取节点距离顶部的距离
      wx.createSelectorQuery().select('#tabsIndex').boundingClientRect(function (rect) {
        if (rect && rect.top > 0) {
          var navbarInitTop = parseInt(rect.top)
          that.setData({
            navbarInitTop: navbarInitTop
          })
        }
      }).exec();
    }
  },

  onPageScroll: function (e) {
    var that = this
    var scrollTop = parseInt(e.scrollTop) //滚动条距离顶部高度

    //判断'滚动条'滚动的距离 和 '元素在初始时'距顶部的距离进行判断
    var isSatisfy = scrollTop >= that.data.navbarInitTop ? true : false
    //为了防止不停的setData, 这儿做了一个等式判断。 只有处于吸顶的临界值才会不相等
    if (that.data.isFixedTop === isSatisfy) {
      return false
    }
    that.setData({
      isFixedTop: isSatisfy
    })
  },

  changeTab(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ 
      tabname: tab,
      departure: '',
      destination: ''
    })
    if (tab === 'delivery') {
      this.getDeliverys()
    } else if (tab === 'travel') {
      this.getTravels()
    }
  },

  getTravels() {
    var self = this
    var params = {
      // user_id: this.data.travelSearch.user_id,
      departure: this.data.departure,
      destination: this.data.destination,
      // start_time: this.data.travelSearch.start_time,
      // end_time: this.data.travelSearch.end_time
    }

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/travels',
      method: 'GET',
      header: { 'page': this.data.travelSearch.page, 'page-size': this.data.travelSearch.pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.forEach((item,index,array) => {
            item.created = item.created ? app.globalData.moment.utc(item.created).format('YYYY-MM-DD') : ''
          })
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
        wx.showToast({ title: res.errMsg, icon: 'none' })
      },
      complete: function (res) {
        wx.hideLoading()
        hasClick = false
      }
    })
  },

  getDeliverys() {
    var self = this
    var params = {
      // user_id: this.data.deliverySearch.user_id,
      // travel_id: this.data.deliverySearch.travel_id,
      departure: this.data.departure,
      destination: this.data.destination,
    }

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries',
      method: 'GET',
      header: { 'page': this.data.deliverySearch.page, 'page-size': this.data.deliverySearch.pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
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
        wx.showToast({ title: res.errMsg, icon: 'none' })
      },
      complete: function (res) {
        wx.hideLoading()
        hasClick = false
      }
    })
  }
})
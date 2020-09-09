var hasClick = false
var app = getApp()
Page({
  data: {
    user: {},
    isIphoneX: app.globalData.isIphoneX,
    navbarInitTop: 0, //导航栏初始化距顶部的距离
    isFixedTop: false, //是否固定顶部
    tabname: 'delivery',
    departure: '',
    destination: '',
    travelSearch: {
      start_time: '',
      end_time: ''
    },
    deliverySearch: {
      travel_id: '',
    },
    deliveryList: [],
    travelList: [],
    pageSize: 20,
    getTravelsFlag: true,
    getDeliverysFlag: true,
    currPageTravel: 0,
    currPageDelivery: 0,
    noMoreTravelsFlag: false,
    noMoreDeliverysFlag: false
  },

  onLoad: function () {
  },

  onShow: function () {
    var that = this

    if (app.globalData.user && app.globalData.user.id) {
      this.setData({ user: app.globalData.user })
    }

    this.setData({
      deliveryList: [],
      travelList: [],
      getTravelsFlag: true,
      getDeliverysFlag: true,
      currPageTravel: 0,
      currPageDelivery: 0,
      noMoreTravelsFlag: false,
      noMoreDeliverysFlag: false
    })
  
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

  onReachBottom() {
    if (this.data.tabname === 'delivery') {
      this.getDeliverys()
    } else if (this.data.tabname === 'travel') {
      this.getTravels()
    }
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
      departure: this.data.departure,
      destination: this.data.destination,
      // start_time: this.data.travelSearch.start_time,
      // end_time: this.data.travelSearch.end_time
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
          res.data.forEach((item,index,array) => {
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
        wx.showToast({ title: res.errMsg, icon: 'none' })
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
      departure: this.data.departure,
      destination: this.data.destination,
      type: 'normal'
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
        wx.showToast({ title: res.errMsg, icon: 'none' })
        self.setData({
          getDeliverysFlag: true
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  }
})
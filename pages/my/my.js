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
    tabname: 'offical',
    travelList: [],
    deliveryList: [],
    officalList: [],
    pageSize: 5,
    getTravelsFlag: true,
    getDeliverysFlag: true,
    getOfficalsFlag: true,
    currPageTravel: 0,
    currPageDelivery: 0,
    currPageOffical: 0,
    noMoreTravelsFlag: false,
    noMoreDeliverysFlag: false,
    noMoreOfficalsFlag: false
  },

  onLoad() {
    // if (app.globalData.user && app.globalData.user.id) {
    //   this.getDeliverys()
    //   this.setData({ user: app.globalData.user })
    // }
  },

  onShow() {
    // 设置tabbar选中 | 【消息】当有未读消息时，显示红点通知
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4,
        msgUnread: app.globalData.msgUnread
      })
    }

    if (!app.globalData.isLogin || !app.globalData.user || !app.globalData.user.id) {
      wx.redirectTo({
        url: '/pages/user/auth/auth',
      })
    }

    if (app.globalData.user && app.globalData.user.id) {
      this.setData({ user: app.globalData.user })
    }

    this.setData({
      deliveryList: [],
      travelList: [],
      officalList: [],
      getTravelsFlag: true,
      getDeliverysFlag: true,
      getOfficalsFlag: true,
      currPageTravel: 0,
      currPageDelivery: 0,
      currPageOffical: 0,
      noMoreTravelsFlag: false,
      noMoreDeliverysFlag: false,
      noMoreOfficalsFlag: false
    })
    if (this.data.tabname === 'delivery') {
      this.getDeliverys()
    } else if (this.data.tabname === 'travel') {
      this.getTravels()
    } else if (this.data.tabname === 'offical') {
      this.getOfficals()
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
    } else if (this.data.tabname === 'offical') {
      this.getOfficals()
    }    
  },

  changeTab(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ tabname: tab })
    if (tab === 'delivery') {
      this.getDeliverys()
    } else if (tab === 'travel') {
      this.getTravels()
    } else if (tab === 'offical') {
      this.getOfficals()
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
      user_id: app.globalData.user.id,
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

  getOfficals() {
    var self = this
    var params = {
      user_id: app.globalData.user.id,
      type: 'offical'
    }

    if (!this.data.getOfficalsFlag) return
    this.setData({ getOfficalsFlag: false })
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries',
      method: 'GET',
      header: { 'page': this.data.currPageOffical, 'page-size': this.data.pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length < self.data.pageSize) {
            var reqState = false
            self.setData({
              noMoreOfficalsFlag: true
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

          var list = self.data.officalList.concat(res.data)
          var nextPage = ++self.data.currPageOffical
          self.setData({
            officalList: list,
            getOfficalsFlag: reqState,
            currPageOffical: nextPage
          })
        } else {
          self.setData({
            getOfficalsFlag: true
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
          getOfficalsFlag: true
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
      } else if (type === 'delivery' || type === 'offical') {
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
  },

  drawStart_delivery: function (e) {
    var touch = e.touches[0]

    for (var index in this.data.deliveryList) {
      var item = this.data.deliveryList[index]
      item.right = 0
    }
    this.setData({
      deliveryList: this.data.deliveryList,
      startX: touch.clientX,
    })

  },

  drawMove_delivery: function (e) {
    var touch = e.touches[0]
    var item = e.currentTarget.dataset.item
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        deliveryList: this.data.deliveryList
      })
    } else {
      item.right = 0
      this.setData({
        deliveryList: this.data.deliveryList
      })
    }
  },

  drawEnd_delivery: function (e) {
    var item = e.currentTarget.dataset.item
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        deliveryList: this.data.deliveryList,
      })
    } else {
      item.right = 0
      this.setData({
        deliveryList: this.data.deliveryList,
      })
    }
  },

  drawStart_travel: function (e) {
    var touch = e.touches[0]

    for (var index in this.data.travelList) {
      var item = this.data.travelList[index]
      item.right = 0
    }
    this.setData({
      travelList: this.data.travelList,
      startX: touch.clientX,
    })

  },

  drawMove_travel: function (e) {
    var touch = e.touches[0]
    var item = e.currentTarget.dataset.item
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        travelList: this.data.travelList
      })
    } else {
      item.right = 0
      this.setData({
        travelList: this.data.travelList
      })
    }
  },

  drawEnd_travel: function (e) {
    var item = e.currentTarget.dataset.item
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        travelList: this.data.travelList,
      })
    } else {
      item.right = 0
      this.setData({
        travelList: this.data.travelList,
      })
    }
  },

  drawStart_offical: function (e) {
    var touch = e.touches[0]

    for (var index in this.data.officalList) {
      var item = this.data.officalList[index]
      item.right = 0
    }
    this.setData({
      officalList: this.data.officalList,
      startX: touch.clientX,
    })

  },

  drawMove_offical: function (e) {
    var touch = e.touches[0]
    var item = e.currentTarget.dataset.item
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        officalList: this.data.officalList
      })
    } else {
      item.right = 0
      this.setData({
        officalList: this.data.officalList
      })
    }
  },

  drawEnd_offical: function (e) {
    var item = e.currentTarget.dataset.item
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        officalList: this.data.officalList,
      })
    } else {
      item.right = 0
      this.setData({
        officalList: this.data.officalList,
      })
    }
  },

  delDelivery(e) {
    var deliveryId = e.target.dataset.id
    var idx = e.target.dataset.index
    var self = this
    wx.showModal({
      title: '',
      content: '您确定要删除此求带？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/app/v1/deliveries-removal',
            method: 'PUT',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            data: [deliveryId],
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '删除成功' })

                self.setData({ tabname: 'delivery', currPageDelivery: 0, getDeliverysFlag: true, noMoreDeliverysFlag: false, deliveryList: [] })
                self.getDeliverys()
              } else {
                console.log(res)
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

        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
    })
  },

  delTravel(e) {
    var travelId = e.target.dataset.id
    var idx = e.target.dataset.index
    var self = this
    wx.showModal({
      title: '',
      content: '您确定要删除此出行？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/app/v1/travels-removal',
            method: 'PUT',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            data: [travelId],
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '删除成功' })

                self.setData({ tabname: 'travel', currPageTravel: 0, getTravelsFlag: true, noMoreTravelsFlag: false, travelList: [] })
                self.getTravels()
              } else {
                console.log(res)
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

        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
    })
  },

  delOffical(e) {
    var deliveryId = e.target.dataset.id
    var idx = e.target.dataset.index
    var self = this
    wx.showModal({
      title: '',
      content: '您确定要删除此官方订单吗？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/app/v1/deliveries-removal',
            method: 'PUT',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            data: [deliveryId],
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '删除成功' })

                self.setData({ tabname: 'offical', currPageOffical: 0, getOfficalsFlag: true, noMoreOfficalsFlag: false, officalList: [] })
                self.getOfficals()
              } else {
                console.log(res)
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

        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
    })
  }
})

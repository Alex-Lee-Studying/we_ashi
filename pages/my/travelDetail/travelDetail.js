var app = getApp()
var hasClick = false
Page({
  data: {
    user: {},
    travelId: null,
    travel: {},
    askforList: [],
    acceptedList: [],
    tabname: 'askfor'
  },

  onLoad(option) {
    console.log(option)
    if (option.id) {
      this.setData({ travelId: option.id })
      this.getTravel()
      this.getAskFor() // 获取向我申请列表
    } else {
      wx.switchTab({
        url: '/pages/my/my'
      })
    }
  },

  onShow: function () {
    if (app.globalData.user && app.globalData.user.id) {
      this.setData({ user: app.globalData.user })
    }
  },

  changeTab(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ tabname: tab })
    if (tab === 'askfor') {
      this.getAskFor()
    } else if (tab === 'accepted') {
      this.getAccepted()
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.dt_departure = res.data.dt_departure ? app.globalData.moment.utc(res.data.dt_departure).format('YYYY-MM-DD') : ''
          res.data.departure = res.data.departure ? res.data.departure.replace('@', ',') : ''
          res.data.destination = res.data.destination ? res.data.destination.replace('@', ',') : ''
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
  }, 

  getAskFor() {
    var self = this
    var page = 0
    var pageSize = 20
    var params = {
      travel_id: this.data.travelId,
      status: 'normal'
    }

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries',
      method: 'GET',
      header: { 'page': page, 'page-size': pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.forEach((item, index, array) => {
            item.created = item.created ? app.globalData.moment.utc(item.created).format('YYYY-MM-DD') : ''
            item.departure = item.departure ? item.departure.replace('@', ',') : ''
            item.destination = item.destination ? item.destination.replace('@', ',') : ''
          })
          self.setData({ askforList: res.data })
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

  getAccepted() {
    var self = this
    var page = 0
    var pageSize = 20
    var params = {
      travel_id: this.data.travelId
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.forEach((item, index, array) => {
            item.created = item.created ? app.globalData.moment.utc(item.created).format('YYYY-MM-DD') : ''
            item.departure = item.departure ? item.departure.replace('@', ',') : ''
            item.destination = item.destination ? item.destination.replace('@', ',') : ''
          })
          self.setData({ acceptedList: res.data })
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

  // 停止接单
  cancel: function () {
    var self = this

    wx.showModal({
      title: '',
      content: '您确定要停止接单吗？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/app/v1/travels/' + self.data.travelId + '/status',
            method: 'PUT',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            data: { status: "suspend" },
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '操作成功' })
                var travel = self.data.travel
                travel.status = 'suspend'
                self.setData({ travel: travel })
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
  },

  onShareAppMessage(option) {
    return {
      title: '脚递出行',
      path: '/pages/my/travelDetail/travelDetail?id=' + this.data.travelId,
      imageUrl: '/images/plane.png',
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
})
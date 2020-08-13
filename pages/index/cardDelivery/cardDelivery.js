var app = getApp()
var hasClick = false
Page({
  data: {
    user: {},
    fromMessage: false,
    deliveryId: null,
    delivery: {},
    showTravels: false,
    getTravelsFlag: true,
    currPageTravel: 0,
    travelList: [],
    checkedTravelId: '',
    travelId: null,
    travel: {}
  },

  onLoad(option) {
    console.log(option)
    if (option.from && option.from === 'message') {
      this.setData({
        fromMessage: true
      })
      this.getTravels()
    }
    if (option.id) {
      this.setData({ deliveryId: option.id })
      this.getDelivery()
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
    if (option.travelId) {
      this.setData({ travelId: option.travelId })
      this.getTravel()
    }
  },

  onShow() {
    if (app.globalData.user && app.globalData.user.id) {
      this.setData({ user: app.globalData.user })
    }
  },

  getDelivery: function () {
    var self = this

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries/' + this.data.deliveryId,
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.departure = res.data.departure ? res.data.departure.replace('@', ',') : ''
          res.data.destination = res.data.destination ? res.data.destination.replace('@', ',') : ''
          self.setData({ delivery: res.data })
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
        // hasClick = false
      }
    })
  },

  getTravel: function () {
    var self = this

    // if (hasClick) return
    // hasClick = true
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
        // hasClick = false
      }
    })
  },

  showTravel() {
    this.setData({ showTravels: true })
  },

  close() {
    this.setData({ showTravels: false })
  },

  checkedTravelChange(e) {
    var tid = e.detail.value
    this.setData({ checkedTravelId: tid })
  },

  sendTravel() {
    if (!this.data.checkedTravelId) return
    this.setData({ showTravels: false })
    const params = {
      type: 'travel',
      travel_id: this.data.checkedTravelId
    }
    // this.addMessage(params)
  },

  loadMoreTravel() {
    if (this.data.getTravelsFlag) {
      this.getTravels()
    }
  },

  // 获取出行列表
  getTravels() {
    var self = this
    var pageSize = 5
    var params = {
      user_id: app.globalData.user.id
    }

    this.setData({ getTravelsFlag: false })
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/travels',
      method: 'GET',
      header: { 'page': this.data.currPageTravel, 'page-size': pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length < pageSize) {
            var reqState = false
          } else {
            var reqState = true
          }
          res.data.forEach((item, index, array) => {
            item.created = item.created ? app.globalData.moment.utc(item.created).format('YYYY-MM-DD') : ''
            item.dt_departure = item.dt_departure ? app.globalData.moment.utc(item.dt_departure).format('YYYY-MM-DD') : ''
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
        self.setData({
          getTravelsFlag: true
        })
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  },
  // 出行人 同意帮带 绑定出行和求带
  accept() {
    var self = this

    if (!this.data.travelId && !this.data.checkedTravelId) {
      wx.showToast({ title: '无效travel_id', icon: 'none' })
      return
    }
    var travelId = this.data.travelId || this.data.checkedTravelId
    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries/' + this.data.deliveryId,
      method: 'PUT',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: { travel_id: travelId },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.departure = res.data.departure ? res.data.departure.replace('@', ',') : ''
          res.data.destination = res.data.destination ? res.data.destination.replace('@', ',') : ''
          self.setData({ delivery: res.data })
          
          const params = {
            type: 'help_delivery',
            delivery_id: self.data.deliveryId,
            travel_id: travelId
          }
          self.addMessage(params)
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
        // hasClick = false
      }
    })
  },

  // 出行人创建 帮带 申请
  // addHelp() {
  //   if (!this.data.checkedTravelId) return
  //   this.setData({ showDeliverys: false })

  //   const params = {
  //     type: 'help_delivery',
  //     delivery_id: this.data.deliveryId,
  //     travel_id: this.data.checkedTravelId
  //   }
  //   this.addMessage(params)
  // },

  // 发布消息
  addMessage(opts) {
    var self = this

    var params = opts
    params.target_user_id = this.data.delivery.user.id

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/messages',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization'),
        'IM-Host': app.globalData.msgContext.host,
        'Content-Type': 'multipart/form-data; boundary=XXX'
      },
      data: formdata(params),
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          var pages = getCurrentPages()
          var prevPage = pages[pages.length - 2]   //上一页
          prevPage.getUserSessions()
          wx.navigateBack({
            delta: 1
          })
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
        // hasClick = false
      }
    })
  }
})

var formdata = function (obj = {}) {
  let result = ''
  for (let name of Object.keys(obj)) {
    let value = obj[name];
    result +=
      '\r\n--XXX' +
      '\r\nContent-Disposition: form-data; name=\"' + name + '\"' +
      '\r\n' +
      '\r\n' + value
  }
  return result + '\r\n--XXX--'
}

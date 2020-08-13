var app = getApp()
var hasClick = false
Page({
  data: {
    user: {},
    fromMessage: false,
    travelId: null,
    travel: {},
    showDeliverys: false,
    getDeliverysFlag: true,
    currPageDelivery: 0,
    deliveryList: [],
    checkedDeliveryId: ''
  },

  onLoad(option) {
    console.log(option)
    if (option.from && option.from === 'message') {
      this.setData({
        fromMessage: true
      })
      this.getDeliverys()
    }
    if (option.id) {
      this.setData({ travelId: option.id })
      this.getTravel()
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  onShow() {
    if (app.globalData.user && app.globalData.user.id) {
      this.setData({ user: app.globalData.user })
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

  showDelivery() {
    this.setData({ showDeliverys: true })
  },

  close() {
    this.setData({ showDeliverys: false })
  },

  checkedDeliveryChange(e) {
    var did = e.detail.value
    this.setData({ checkedDeliveryId: did })
  },

  loadMoreDelivery() {
    if (this.data.getDeliverysFlag) {
      this.getDeliverys()
    }
  },

  // 获取求带列表
  getDeliverys() {
    var self = this
    var pageSize = 5
    var params = {
      user_id: app.globalData.user.id,
      type: 'normal'
    }

    this.setData({ getDeliverysFlag: false })
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries',
      method: 'GET',
      header: { 'page': this.data.currPageDelivery, 'page-size': pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
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
        self.setData({
          getDeliverysFlag: true
        })
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  },

  //求带人 创建 求带 申请
  addRequest() {
    if (!this.data.checkedDeliveryId) return
    this.setData({ showDeliverys: false })

    const params = {
      type: 'req_delivery',
      delivery_id: this.data.checkedDeliveryId,
      travel_id: this.data.travelId
    }
    this.addMessage(params)
  },

  // 发布消息
  addMessage(opts) {
    var self = this

    var params = opts
    params.target_user_id = this.data.travel.user.id

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
var app = getApp()
var hasClick = false
Page({
  data: {
    user: {},
    fromMessage: false,
    deliveryId: null,
    delivery: {},
  },

  onLoad(option) {
    console.log(option)
    if (option.from && option.from === 'message') {
      this.setData({
        fromMessage: true,
        acceptTravelId: option.travelid || ''
      })
    }
    if (option.id) {
      this.setData({ deliveryId: option.id })
      this.getDelivery()
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

  getDelivery: function () {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries/' + this.data.deliveryId,
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
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
        hasClick = false
      }
    })
  },

  // 出行人接受帮带
  accept: function (e) {
    var deliveryId = this.data.deliveryId
    var travelId = this.data.acceptTravelId
    if (!travelId) {
      wx.showToast({ title: '无效travel_id', icon: 'none' })
      return
    }
    var self = this

    wx.showModal({
      title: '',
      content: '您确定接受帮带？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/app/v1/deliveries/' + deliveryId + '/actions',
            method: 'PUT',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            data: { action: 'accept', travel_id: travelId },
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '接受帮带成功' })
                var delivery = self.data.delivery
                self.setData({ delivery: delivery })
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

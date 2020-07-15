var app = getApp()
var hasClick = false
Page({
  data: {
    deliveryId: null,
    delivery: {}
  },
  
  onLoad(option) {
    console.log(option)
    if (option.id) {
      this.setData({ deliveryId: option.id })
      this.getDelivery()
    } else {
      wx.switchTab({
        url: '/pages/my/my'
      })
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

  // 确认收货
  finish: function(e) {
    var deliveryId = e.currentTarget.dataset.deliveryId
    var self = this

    wx.showModal({
      title: '',
      content: '您确定货已收到？',
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
            data: { action: 'finish' },
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '确认收货成功' })
                var delivery = self.data.delivery
                delivery.status = 'eol'
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
  },

  // 取消
  cancel: function (e) {
    var deliveryId = e.currentTarget.dataset.deliveryId
    var self = this

    wx.showModal({
      title: '',
      content: '您确定要取消此求带？',
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
            data: { action: 'cancel' },
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '取消成功' })
                var delivery = self.data.delivery
                delivery.status = 'canceled'
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
  },

  topay: function(e) {
    var deliveryId = e.currentTarget.dataset.deliveryId
    wx.navigateTo({
      url: '/pages/delivery/pay/pay?id=' + deliveryId
    })
  },

  onShareAppMessage(option) {
    return {
      title: '脚递求带',
      path: '/pages/my/deliveryDetail/deliveryDetail?id=' + this.data.deliveryId,
      imageUrl: (this.data.delivery.resources[0] && this.data.delivery.resources[0].name) || '/images/travel.png',
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
var app = getApp()
var hasClick = false
Page({
  data: {
    offical: false,
    selectedAddressId: '',
    addressList: [],
    showUse: true
  },
  
  onLoad: function(option) {
    if (option.type === 'offical') {
      this.setData({ offical: true })
      this.getOfficalAddressList()
    } else {
      this.getAddressList()
    }

    // var pages = getCurrentPages()
    // var prevPage = pages[pages.length - 2]   //上一页
    // if (prevPage && prevPage.route === 'pages/my/setup/index') {
    //   this.setData({ showUse: false })
    // }
  },

  onShow: function() {
    // 目前没有 offical 的情况
    this.getAddressList()
  },

  use: function(e) {
    var address = e.currentTarget.dataset.address
    this.setData({ selectedAddressId: address.id })

    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]   //上一页
    if (this.data.offical) {
      prevPage.setData({
        officalAddress: address
      })
    } else {
      prevPage.setData({
        address: address
      })
    }

    wx.navigateBack({
      delta: 1
    })
  },

  getAddressList: function () {
    var self = this

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/addresses',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ addressList: res.data })
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
        // hasClick = false
      }
    })
  },

  delAddress: function (e) {
    if (!e.currentTarget.dataset.id) return
    var id = e.currentTarget.dataset.id
    var idx = e.currentTarget.dataset.index
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/addresses-removal',
      method: 'PUT',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: [id],
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          wx.showToast({ title: '删除成功' })
          self.data.addressList.splice(idx, 1)
          self.setData({ addressList: self.data.addressList })
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
  },

  defaultAddress(e) {
    if (!e.currentTarget.dataset.id) return
    var id = e.currentTarget.dataset.id
    var default_ = !e.currentTarget.dataset.currDefault
    var params = {
      default: default_
    }
    console.log(params)

    var self = this
    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/addresses/' + id,
      method: 'PUT',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          wx.showToast({ title: '设置成功！' })
          self.getAddressList()
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
  },

  getOfficalAddressList: function () {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/offical-addresses',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ addressList: res.data })
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
  }
})
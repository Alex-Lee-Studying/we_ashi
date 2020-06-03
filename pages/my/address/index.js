var app = getApp()
var hasClick = false
Page({
  data: {
    selectedAddressId: 123,
    addressList: []
  },
  
  onLoad: function() {
    this.getAddressList()
  },

  use: function(e) {
    var addId = e.currentTarget.dataset.addressid
    this.setData({ selectedAddressId: addId })
  },

  getAddressList: function () {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/addresses',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
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
        hasClick = false
      }
    })
  },

  delAddress: function (e) {
    if (!e.currentTarget.dataset.id) return
    var id = e.currentTarget.dataset.id
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
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          wx.showToast({ title: '删除成功' })
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
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
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
  }
})
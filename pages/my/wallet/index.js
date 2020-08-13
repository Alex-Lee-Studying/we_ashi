var hasClick = false
var app = getApp()
Page({
  data: {
    account: {},
    showSubmenu: false,
    currMenu: '',
    records: [],
    pageSize: 5,
    getRecordsFlag: true,
    currPage: 0,
    noMoreRecordsFlag: false
  },

  onLoad: function (options) {
    this.getAccount()
    this.getRecords()
  },

  toggleShowSubmenu () {
    this.setData({
      showSubmenu: !this.data.showSubmenu
    })
  },

  toggleSubmenu(e) {
    this.setData({
      currMenu: e.target.dataset.menu,
      showSubmenu: false,
      getRecordsFlag: true,
      currPage: 0,
      noMoreRecordsFlag: false
    })
    this.getRecords()
  },

  getAccount () {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/account',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({
            account: res.data
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
        hasClick = false
        wx.hideLoading()
      }
    })
  },

  getRecords() {
    var self = this
    var params = {}
    if (this.data.currMenu) {
      params.type = this.data.currMenu
    }

    if (!this.data.getRecordsFlag) return
    this.setData({ getRecordsFlag: false })
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/records',
      method: 'GET',
      header: { 'page': this.data.currPage, 'page-size': this.data.pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length < self.data.pageSize) {
            var reqState = false
            self.setData({
              noMoreRecordsFlag: true
            })
          } else {
            var reqState = true
          }
          res.data.forEach((item, index, array) => {
            item.created = item.created ? app.globalData.moment.utc(item.created).format('YYYY-MM-DD hh:mm:ss') : ''
            var idxOfFlag = item.content.indexOf('+') || item.content.indexOf('-') || 0
            item.value = item.content.substring(idxOfFlag)
          })

          var list = self.data.records.concat(res.data)
          var nextPage = ++self.data.currPage
          self.setData({
            records: list,
            getRecordsFlag: reqState,
            currPage: nextPage
          })
        } else {
          self.setData({
            getRecordsFlag: true
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
          getRecordsFlag: true
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  },

  onReachBottom() {
    this.getRecords()
  }
})
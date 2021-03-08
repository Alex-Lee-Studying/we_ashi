var hasClick = false
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    user: {},
    availableCoupons: [],
    pageSize: 5,
    getCouponsFlag: true,
    currPageCoupon: 0,
    noMoreCouponsFlag: false,
    canReceiveNum: 0,
    showSuccess: false,
    checkedCoupon: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.user.id) {
      this.setData({ userId: app.globalData.user.id, user: app.globalData.user })
      // this.getUser()

      this.setData({
        availableCoupons: [],
        getCouponsFlag: true,
        currPageCoupon: 0,
        noMoreCouponsFlag: false,
        canReceiveNum: 0
      })
      this.getAvailable()
    } else {
      wx.switchTab({
        url: '/pages/my/my'
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  getAvailable: function () {
    var self = this

    if (!this.data.getCouponsFlag) return
    this.setData({ getCouponsFlag: false })
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/available-discount-coupons',
      method: 'GET',
      header: { 'page': this.data.currPageCoupon, 'page-size': this.data.pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length < self.data.pageSize) {
            var reqState = false
            self.setData({
              noMoreCouponsFlag: true
            })
          } else {
            var reqState = true
          }
          var canReceiveNum = self.data.canReceiveNum
          res.data.forEach((item, index, array) => {
            item.expiry = item.expiry ? app.globalData.moment.utc(item.expiry).format('YYYY-MM-DD') : ''
            if (item.status === 'normal') {
              canReceiveNum++
            }
          })
          var list = self.data.availableCoupons.concat(res.data)
          var nextPage = ++self.data.currPageCoupon
          self.setData({
            availableCoupons: list,
            getCouponsFlag: reqState,
            currPageCoupon: nextPage,
            canReceiveNum: canReceiveNum
          })
        } else {
          self.setData({
            getCouponsFlag: true
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
          getCouponsFlag: true
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  },
  getCoupon: function (e) {
    var checkedCoupon = e.target.dataset.item
    var couponId = e.target.dataset.id
    var idx = e.target.dataset.index
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/discount-coupons/' + couponId + '/reception',
      method: 'PUT',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({
            checkedCoupon: checkedCoupon,
            showSuccess: true
          })
          self.setData({
            availableCoupons: [],
            getCouponsFlag: true,
            currPageCoupon: 0,
            noMoreCouponsFlag: false,
            canReceiveNum: 0
          })
          self.getAvailable()
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

  hideSuccessDialog: function() {
    this.setData({
      showSuccess: false
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getAvailable()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
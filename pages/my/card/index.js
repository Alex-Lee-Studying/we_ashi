var hasClick = false
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    user: {},
    myCoupons: [],
    pageSize: 5,
    getCouponsFlag: true,
    currPageCoupon: 0,
    noMoreCouponsFlag: false,
    codeInput: '',
    from: '',
    orderTotal: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.user.id) {
      this.setData({ userId: app.globalData.user.id, user: app.globalData.user })
      // this.getUser()

      if (options.from) {
        this.setData({
          from: options.from
        })
      }
      if (options.orderTotal) {
        this.setData({
          orderTotal: options.orderTotal
        })
      }
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
    this.setData({
      myCoupons: [],
      getCouponsFlag: true,
      currPageCoupon: 0,
      noMoreCouponsFlag: false
    })
    this.getMyCoupons()
  },

  getMyCoupons: function () {
    var self = this

    if (!this.data.getCouponsFlag) return
    this.setData({ getCouponsFlag: false })
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/users/' + this.data.userId + '/discount-coupons',
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
          res.data.forEach((item, index, array) => {
            item.expiry = item.expiry ? app.globalData.moment.utc(item.expiry).format('YYYY-MM-DD') : ''
          })
          var list = self.data.myCoupons.concat(res.data)
          var nextPage = ++self.data.currPageCoupon
          self.setData({
            myCoupons: list,
            getCouponsFlag: reqState,
            currPageCoupon: nextPage
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

  useCoupon: function(e) {
    var checkedCoupon = e.target.dataset.item
    var couponId = e.target.dataset.id
    var idx = e.target.dataset.index

    if (couponId) {
      var pages = getCurrentPages()
      var prevPage = pages[pages.length - 2]   //上一页
      prevPage.setData({
        discountId: couponId
      })
      prevPage.discountCalculate()

      wx.navigateBack({
        delta: 1
      })
    }
  },

  //input表单数据绑定
  inputInfo: function (e) {
    let value = e.detail.value;
    this.setData({
      codeInput: value
    })
  },

  checkDiscountCode: function() {
    if (!this.data.codeInput) return
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/discount-codes/' + this.data.codeInput,
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.id) {
            // 状态 normal:正常可使用/可领取 expired:已过期 eol:已使用 invalid:已无效 received:已领取(针对可领优惠券)
            if (res.data.status === 'normal') {
              var pages = getCurrentPages()
              var prevPage = pages[pages.length - 2]   //上一页
              prevPage.setData({
                discountId: res.data.id
              })
              prevPage.discountCalculate()

              wx.showToast({
                title: '优惠码兑换成功！',
                icon: 'success',
                success: function() {
                  setTimeout(function(){
                    wx.navigateBack({
                      delta: 1
                    })
                  },2000)
                }
              })
              
            } else if (res.data.status === 'expired') {
              wx.showToast({ title: '优惠码已过期！', icon: 'none' })
            } else if (res.data.status === 'eol') {
              wx.showToast({ title: '优惠码已使用！', icon: 'none' })
            } else if (res.data.status === 'invalid') {
              wx.showToast({ title: '优惠码已无效！', icon: 'none' })
            } else if (res.data.status === 'received') {
              wx.showToast({ title: '优惠码已领取！', icon: 'none' })
            }
          }
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getMyCoupons()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
var app = getApp()
var hasClick = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: null,
    formdata: {
      total_fee: null
    }
  },

  onLoad(opt) {
    this.setData({
      balance: opt.balance
    })
  },

  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },

  //input表单数据绑定
  inputInfo: function (e) {
    let dataset = e.currentTarget.dataset;
    let value = e.detail.value;
    this.data[dataset.obj][dataset.item] = value;
    this.setData({
      formdata: this.data[dataset.obj]
    })
  },

  getall() {
    var form = this.data.formdata
    form.total_fee = this.data.balance
    this.setData({ formdata: form })
  },

  // 提现
  toWithdrawals() {
    var self = this

    if (!parseFloat(this.data.formdata.total_fee)) {
      wx.showToast({ title: '请填写提现金额', icon: 'none' })
      return
    } else if (parseFloat(this.data.formdata.total_fee) > parseFloat(this.data.balance)) {
      wx.showToast({ title: '余额不足', icon: 'none' })
      return
    }

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/withdrawals',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: { total_fee: parseFloat(this.data.formdata.total_fee), method: 'miniprogram' }, 
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.status === 'success') {
            wx.showToast({ title: '提现成功', icon: 'success' })
            wx.navigateBack({
              delta: 1
            })
          }
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
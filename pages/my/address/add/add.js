var app = getApp()
var hasClick = false
Page({
  data: {
    formdata: {
      recipient: '',
      mobile: '',
      details: '',
      default: true
    },
    responseObj: {},
  },

  onLoad(option) {
    console.log(option)
    if(option.id) {
      this.getAddress(option.id)
    }
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
  addAddress() {
    if (this.data.formdata.id) {
      this.updateAddress()
      return
    }
    var self = this
    if (this.data.formdata.recipient === '' || this.data.formdata.recipient === null) {
      wx.showToast({ title: '请填写收件人', icon: 'none' })
      return
    }
    if (this.data.formdata.mobile === '' || this.data.formdata.mobile === null) {
      wx.showToast({ title: '请填写手机号', icon: 'none' })
      return
    }
    if (this.data.formdata.details === '' || this.data.formdata.details === null) {
      wx.showToast({ title: '请填写详细地址', icon: 'none' })
      return
    }

    var params = {
      recipient: this.data.formdata.recipient,
      mobile: this.data.formdata.mobile,
      details: this.data.formdata.details,
      default: this.data.formdata.default
    }
    console.log(params)

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/addresses',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          self.setData({ responseObj: res.data })
          wx.navigateTo({
            url: '/pages/my/address/index',
          })
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

  getAddress: function (id) {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    // var temp = {
    //   "recipient": "xxx",
    //   "mobile": "2234234234",
    //   "details": "aewlfijwaef",
    //   "default": true,
    //   "id": "aewlfijwaef"
    // }
    // self.setData({ formdata: temp })

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/addresses/' + id,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          self.setData({ formdata: res.data })
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

  updateAddress() {
    var id = this.data.formdata.id
    var params = {
      recipient: this.data.formdata.recipient,
      mobile: this.data.formdata.mobile,
      details: this.data.formdata.details,
      default: this.data.formdata.default
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
          wx.navigateTo({
            url: '/pages/my/address/index',
          })
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
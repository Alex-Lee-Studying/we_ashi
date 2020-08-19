// 引入SDK核心类
var QQMapWX = require('../../../../utils/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'E7ZBZ-ABKHD-GG44A-HCY25-MHQZS-RBBQI' // 必填
})
var app = getApp()
var hasClick = false
Page({
  data: {
    formdata: {
      recipient: '',
      mobile: '',
      zipcode: '',
      details: '',
      default: true
    },
    responseObj: {},
    country: '',
    countryStr: '',
    countryArray: [],
    countryIndex: [0, 0],
  },

  onLoad(option) {
    console.log(option)
    if(option.id) {
      this.getAddress(option.id)
    }
  },

  onShow() {
    var arr = []
    arr[0] = app.globalData.countries
    arr[1] = app.globalData.countries[0] ? app.globalData.countries[0].cities : []
    this.setData({
      countryArray: arr,
      countryIndex: [0, 0]
    })
  },

  bindMultiPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      countryIndex: e.detail.value
    })
    var countryStr = this.data.countryArray[0][this.data.countryIndex[0]].desc + ' ' + this.data.countryArray[1][this.data.countryIndex[1]].desc
    var countryCode = this.data.countryArray[0][this.data.countryIndex[0]].code + ' ' + this.data.countryArray[1][this.data.countryIndex[1]].code
    this.setData({
      country: countryCode,
      countryStr: countryStr
    })
  },

  bindMultiPickerColumnChange: function (e) {
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value)
    var data = {
      countryArray: this.data.countryArray,
      countryIndex: this.data.countryIndex
    }
    data.countryIndex[e.detail.column] = e.detail.value

    switch (e.detail.column) {
      case 0:
        data.countryArray[1] = data.countryArray[0][e.detail.value].cities
        data.countryIndex[1] = 0
        break;
    }

    this.setData(data);
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
    if (this.data.formdata.zipcode === '' || this.data.formdata.zipcode === null) {
      wx.showToast({ title: '请填写邮编', icon: 'none' })
      return
    }
    if (this.data.formdata.details === '' || this.data.formdata.details === null) {
      wx.showToast({ title: '请填写详细地址', icon: 'none' })
      return
    }

    var params = {
      recipient: this.data.formdata.recipient,
      mobile: this.data.formdata.mobile,
      zipcode: this.data.formdata.zipcode,
      details: this.data.formdata.details,
      default: this.data.formdata.default,
      name: this.data.countryStr
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ responseObj: res.data })
          wx.redirectTo({
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
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
      zipcode: this.data.formdata.zipcode,
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
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

  getlocation() {
    var self = this
    wx.showModal({
      title: '',
      content: '您确定要定位到当前位置吗？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {
          wx.getSetting({
            success(res) {
              var result = res.authSetting
              if (result['scope.userLocation']) {
                wx.getLocation({
                  type: 'gcj02', //返回可以用于wx.openLocation的经纬度
                  success(res) {
                    self.getLocationInfo(res)
                  }
                })
              } else {
                wx.openSetting({
                  success(res) { }
                })
              }

            }
          })
        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
    })
  },

  getLocationInfo(res) {
    var self = this
    var latitude = res.latitude
    var longitude = res.longitude
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {//成功后的回调
        if (res.status === 0) {
          console.log(res.result)
          var address = res.result.address
          self.data.formdata.details = address
          self.setData({
            formdata: self.data.formdata
          })
        } else {
          wx.showToast({ title: res.message, icon: 'none' })
        }
      }
    })
  }

})
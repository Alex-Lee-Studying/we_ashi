var hasClick = false
var app = getApp()
Page({
  data: {
    type: '',
    departure: '',
    destination: '',
    picker: '', // departure destination
    departureStr: '',
    destinationStr: '',
    multiArray: [],
    multiIndex: [0, 0],
  },

  onLoad(options) {
    this.setData({
      type: options.type
    })
  },

  onShow() {
    if (!app.globalData.countries.length) {
      this.getCountriesCities()
    } else {
      var arr = []
      arr[0] = app.globalData.countries
      arr[1] = app.globalData.countries[0] ? app.globalData.countries[0].cities : []
      this.setData({
        multiArray: arr,
        multiIndex: [0, 0]
      })
    }
  },

  pickerCountry(e) {
    this.setData({
      picker: e.currentTarget.dataset.picker
    })
  },

  bindMultiPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })

    var countryStr = this.data.multiArray[0][this.data.multiIndex[0]].desc
    if (this.data.multiArray[1][this.data.multiIndex[1]].desc !== '不限') {
      countryStr = this.data.multiArray[1][this.data.multiIndex[1]].desc + ',' + countryStr
    }
    var countryCode = this.data.multiArray[1][this.data.multiIndex[1]].code + '@' + this.data.multiArray[0][this.data.multiIndex[0]].code
    if (this.data.picker === 'departure') {
      this.setData({
        departure: countryCode,
        departureStr: countryStr,
        picker: ''
      })
    } else if (this.data.picker === 'destination') {
      this.setData({
        destination: countryCode,
        destinationStr: countryStr,
        picker: ''
      })
    } 
  },

  bindMultiPickerColumnChange: function (e) {
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value)
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    data.multiIndex[e.detail.column] = e.detail.value

    switch (e.detail.column) {
      case 0:
        data.multiArray[1] = data.multiArray[0][e.detail.value].cities
        data.multiIndex[1] = 0
        break;
    }

    this.setData(data);
  },

  clear() {
    this.setData({
      departure: '',
      departureStr: '',
      destination: '',
      destinationStr: ''
    })
  },

  toFilter() {
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]   //上一页

    if (this.data.type === 'delivery') {
      prevPage.setData({
        tabname: 'delivery',
        departure: this.data.departure,
        destination: this.data.destination,
      })
    } else if (this.data.type === 'travel') {
      prevPage.setData({
        tabname: 'travel',
        departure: this.data.departure,
        destination: this.data.destination,
      })
    }
    

    wx.navigateBack()
  },

  // 国家城市列表
  getCountriesCities() {
    var self = this
    // wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/countries-cities',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length) {
            res.data.forEach((item, idx, array) => {
              item.cities.unshift({ code: "", desc: "不限" })
            })
          }
          app.globalData.countries = res.data
          var countries = res.data
          var arr = []
          arr[0] = countries
          arr[1] = countries[0] ? countries[0].cities : []
          self.setData({
            multiArray: arr,
            multiIndex: [0, 0]
          })
        } else {
          console.log(res)
          if (res.errMsg && res.errMsg === 'request:ok') {
            if (res.data.msg && res.data.msg.indexOf('Token Expired') !== -1) {
              wx.navigateTo({
                url: '/pages/user/auth/auth',
              })
            } else {
              wx.showToast({ title: res.data.msg, icon: 'none' })
            }
          } else {
            wx.showToast({ title: res.errMsg || '请求出错', icon: 'none' })
          }
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        // wx.hideLoading()
      }
    })
  }
})
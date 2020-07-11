var app = getApp()
var hasClick = false
Page({
  data: {
    picker: '', // departure destination
    departureStr: '',
    destinationStr: '',
    departure: '',
    destination: '',
    formdata: {
      dt_departure: '',
      weight: null,
      unit_price: null,
      details: '',
    },
    responseObj: {},
    complete: false,
    multiArray: [],
    multiIndex: [0, 0],
  },
  onLoad: function () {
  },
  onShow: function () {
    if (!app.globalData.isLogin || !app.globalData.user || !app.globalData.user.id) {
      wx.redirectTo({
        url: '/pages/user/auth/auth',
      })
    }

    var arr = []
    arr[0] = app.globalData.countries
    arr[1] = app.globalData.countries[0] ? app.globalData.countries[0].cities : []
    this.setData({
      multiArray: arr,
      multiIndex: [0, 0]
    })
  },
  onHide: function () {
    this.setData({
      complete: false
    })
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
    var countryStr = this.data.multiArray[1][this.data.multiIndex[1]].desc + '@' + this.data.multiArray[0][this.data.multiIndex[0]].desc
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

  //input表单数据绑定
  inputInfo: function (e) {
    let dataset = e.currentTarget.dataset;
    let value = e.detail.value;
    this.data[dataset.obj][dataset.item] = value;
    this.setData({
      formdata: this.data[dataset.obj]
    })
  },
  submitTravel: function() {
    var self = this
    if (this.data.departure === '' || this.data.departure === null) {
      wx.showToast({ title: '请选择出发地', icon: 'none' })
      return
    }
    if (this.data.destination === '' || this.data.destination === null) {
      wx.showToast({ title: '请选择目的地', icon: 'none' })
      return
    }
    if (this.data.formdata.dt_departure === '' || this.data.formdata.dt_departure === null) {
      wx.showToast({ title: '请选择出发日期', icon: 'none' })
      return
    }
    if (this.data.formdata.weight === '' || this.data.formdata.weight === null) {
      wx.showToast({ title: '请填写可带行李重量', icon: 'none' })
      return
    }
    if (this.data.formdata.unit_price === '' || this.data.formdata.unit_price === null) {
      wx.showToast({ title: '请填写价格', icon: 'none' })
      return
    }
    var params = {
      departure: this.data.departure,
      destination: this.data.destination,
      dt_departure: app.globalData.moment.utc(this.data.formdata.dt_departure).format(),
      details: this.data.formdata.details,
      weight: parseInt(this.data.formdata.weight),
      unit_price: parseInt(this.data.formdata.unit_price)
    }
    console.log(params)

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/travels',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容    
          self.setData({ complete: true })
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.dt_departure = res.data.dt_departure ? app.globalData.moment.utc(res.data.dt_departure).format('YYYY-MM-DD') : ''
          self.setData({ responseObj: res.data })
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
  completeTravel: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})

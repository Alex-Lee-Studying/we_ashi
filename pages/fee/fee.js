var app = getApp()
var hasClick = false
Page({
  data: {
    isIphoneX: app.globalData.isIphoneX,
    picker: '', // departure destination
    departureStr: '',
    destinationStr: '',
    departure: "",
    destination: "",
    formdata: {
      item_type: {},
      price: null,
      weight: null,
      express: '',
      channel: 'air'
    },
    typearray: [],
    expressFee: 0,
    total: 0,
    responseObj: {},
    multiArray: [],
    multiIndex: [0, 0],
    showChannels: false,
    channels: [{ name: '空运', value: 'air', disabled: false }, { name: '陆运', value: 'land', disabled: false }], // { name: '海运', value: 'sea', disabled: true }
    fee_rate: 0
  },
  onLoad: function () {
  },
  onShow: function () {
    // 设置tabbar选中 | 【消息】当有未读消息时，显示红点通知
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
        msgUnread: app.globalData.msgUnread
      })
    }

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
    this.getFeerate()
    this.getItemTypes()
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
    // var countryCode = this.data.multiArray[1][this.data.multiIndex[1]].code + '@' + this.data.multiArray[0][this.data.multiIndex[0]].code
    var countryCode = this.data.multiArray[0][this.data.multiIndex[0]].code
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
      // 目的地为俄罗斯时 显示“运输方式”
      if (this.data.destination.substr(this.data.destination.indexOf('@') + 1) === 'RU') {
        this.setData({
          showChannels: true
        })
      } else {
        this.data.formdata.channel = 'air'
        this.setData({
          showChannels: false,
          formdata: this.data.formdata
        })
      }
    }

    this.doCalculate()
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

  bindTypeChange(e) {
    let dataset = e.currentTarget.dataset;
    let idx = e.detail.value;
    this.data[dataset.obj][dataset.item] = this.data.typearray[idx];
    this.setData({
      formdata: this.data[dataset.obj]
    })
    this.doCalculate()
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

  weightBlur(e) {
    this.data.formdata.weight = (this.data.formdata.weight || '') + 'kg'
    this.setData({
      formdata: this.data.formdata
    })
    this.doCalculate()
  },

  weightFocus(e) {
    this.data.formdata.weight = parseInt(this.data.formdata.weight)
    this.setData({
      formdata: this.data.formdata
    })
  },

  priceBlur(e) {
    this.data.formdata.price = (this.data.formdata.price || '') + 'RMB'
    this.setData({
      formdata: this.data.formdata
    })
    this.doCalculate()
  },

  priceFocus(e) {
    this.data.formdata.price = parseInt(this.data.formdata.price)
    this.setData({
      formdata: this.data.formdata
    })
  },

  channelChange(e) {
    let dataset = e.currentTarget.dataset;
    let channel = e.detail.value;
    this.data[dataset.obj][dataset.item] = channel;
    this.setData({
      formdata: this.data[dataset.obj]
    })
    this.doCalculate()
  },

  doCalculate: function() {
    var self = this
    if (this.data.departure === '' || this.data.departure === null) {
      wx.showToast({ title: '请选择出发地', icon: 'none' })
      return
    }
    if (this.data.destination === '' || this.data.destination === null) {
      wx.showToast({ title: '请选择目的地', icon: 'none' })
      return
    }
    if (!this.data.formdata.item_type || !this.data.formdata.item_type.name) {
      wx.showToast({ title: '请选择物品类型', icon: 'none' })
      return
    }
    if (this.data.formdata.price === 'RMB' || this.data.formdata.price === '' || this.data.formdata.price === null) {
      wx.showToast({ title: '请填写物品价格', icon: 'none' })
      return
    }
    if (this.data.formdata.weight === 'kg' || this.data.formdata.weight === '' || this.data.formdata.weight === null) {
      wx.showToast({ title: '请填写物品重量', icon: 'none' })
      return
    }
    // if (this.data.formdata.express === '' || this.data.formdata.express === null) {
    //   wx.showToast({ title: '请填写快递类型', icon: 'none' })
    //   return
    // }
    if (this.data.departure.substr(this.data.departure.indexOf('@') + 1) !== 'CN' && this.data.destination.substr(this.data.destination.indexOf('@') + 1) !== 'CN') {
      wx.showToast({ title: '出发地和目的地至少有一个为中国', icon: 'none' })
      return
    }
    var params = {
      departure: this.data.departure,
      destination: this.data.destination,
      item_id: this.data.formdata.item_type.id,
      price: parseInt(this.data.formdata.price),
      weight: parseInt(this.data.formdata.weight),
      channel: this.data.formdata.channel
      // express: this.data.formdata.express,
    }
    console.log(params)

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/price-calculate',
      method: 'GET',
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ responseObj: res.data, expressFee: res.data.price })
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
  },

  // 获取平台费率
  getFeerate() {
    var self = this

    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/feerate',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ fee_rate: res.data.fee_rate })
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
      }
    })
  },

  // 获取物品类型列表
  getItemTypes() {
    var self = this

    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/items',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ typearray: res.data })
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
      }
    })
  }
})

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
      item_type: '',
      price: null,
      weight: null,
      need_agent: true,
      details: '',
      freight: '',
      channel: 'air'
    },
    responseObj: {},
    typearray: ['文件', '化妆品', '衣物鞋子', '电子产品', '液体', '其他'],
    images: [],
    address: null,
    multiArray: [],
    multiIndex: [0, 0],
    showChannels: false,
    channels: [{ name: '空运', value: 'air', disabled: false }, { name: '陆运', value: 'land', disabled: false }] // { name: '海运', value: 'sea', disabled: true }
  },

  onLoad: function () {
  },

  onShow: function () {
    if (!app.globalData.isLogin || !app.globalData.user || !app.globalData.user.id) {
      wx.redirectTo({
        url: '/pages/user/auth/auth',
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
  },

  //input表单数据绑定
  inputInfo: function (e) {
    let dataset = e.currentTarget.dataset;
    let value = e.detail.value;
    this.data[dataset.obj][dataset.item] = value;
    this.setData({
      formdata: this.data[dataset.obj]
    })
    if (dataset.item === 'weight') {
      this.doCalculate()
    }
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

  weightBlur(e) {
    this.data.formdata.weight = (this.data.formdata.weight || '') + 'kg'
    this.setData({
      formdata: this.data.formdata
    })
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
  },

  priceFocus(e) {
    this.data.formdata.price = parseInt(this.data.formdata.price)
    this.setData({
      formdata: this.data.formdata
    })
  },

  switchAgent: function (e) {
    var formdata = this.data.formdata
    formdata.need_agent = e.detail.value
    this.setData({ formdata })
  },

  chooseImage(e) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths)
        // 限制最多只能留下3张照片
        const imgs = images.length <= 3 ? images : images.slice(0, 3)
        this.setData({ images: imgs })
      }
    })
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.idx
    const copyImages = this.data.images
    copyImages.splice(idx, 1)
    this.setData({ images: copyImages })
  },

  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = this.data.images
    wx.previewImage({
      current: images[idx],  //当前预览的图片
      urls: images,  //所有要预览的图片
    })
  },

  submitOrder() {
    var self = this
    if (this.data.departure === '' || this.data.departure === null) {
      wx.showToast({ title: '请选择出发地', icon: 'none' })
      return
    } 
    if (this.data.departure.substr(this.data.departure.indexOf('@') + 1) !== 'CN') {
      wx.showToast({ title: '出发地只能选择中国', icon: 'none' })
      return
    }
    if (this.data.destination === '' || this.data.destination === null) {
      wx.showToast({ title: '请选择目的地', icon: 'none' })
      return
    }
    if (this.data.destination.substr(this.data.destination.indexOf('@') + 1) === 'CN') {
      wx.showToast({ title: '目的地不能选择中国', icon: 'none' })
      return
    }
    if (this.data.formdata.price === 'RMB' || this.data.formdata.price === null) {
      wx.showToast({ title: '请填写物品价格', icon: 'none' })
      return
    }
    if (this.data.formdata.weight === 'kg' || this.data.formdata.weight === null) {
      wx.showToast({ title: '请填写物品重量', icon: 'none' })
      return
    }
    if (!this.data.address || !this.data.address.id) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }

    var params = {
      type: 'offical',
      departure: this.data.departure,
      destination: this.data.destination,
      item_type: this.data.formdata.item_type,
      price: parseInt(this.data.formdata.price),
      weight: parseInt(this.data.formdata.weight),
      address_id: this.data.address.id,
      need_agent: this.data.formdata.need_agent,
      details: this.data.formdata.details,
      freight: this.data.formdata.freight,
      channel: this.data.formdata.channel
    }
    console.log(params)

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ responseObj: res.data })
          self.submitImages()
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

  submitImages() {
    var that = this
    if (!this.data.images.length) {
      wx.navigateTo({
        url: '/pages/order/confirm/confirm?id=' + that.data.responseObj.id,
      })
    }

    wx.showLoading({
      title: '正在上传...',
      mask: true
    })

    // 将选择的图片组成一个Promise数组，准备进行并行上传
    const arr = this.data.images.map(path => {
      return wx.uploadFile({
        url: app.globalData.baseUrl + '/app/v1/deliveries/' + that.data.responseObj.id + '/resources',
        filePath: path,
        name: 'file',
        header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization'), 'Content-Type': 'multipart/form-data' },
      })
    })

    Promise.all(arr).then(res => {
      console.log(res)
      wx.navigateTo({
        url: '/pages/order/confirm/confirm?id=' + that.data.responseObj.id,
      })
    }).catch(err => {
      console.log(err)
      wx.showToast({ title: err, icon: 'none' })
    }).then(() => {
      wx.hideLoading()
    })
  },

  doCalculate: function() {
    var self = this
    if (this.data.departure === '' || this.data.departure === null) {
      return
    }
    if (this.data.destination === '' || this.data.destination === null) {
      return
    }
    if (this.data.formdata.weight === '' || this.data.formdata.weight === null) {
      return
    }

    var params = {
      departure: this.data.departure.substr(this.data.departure.indexOf('@') + 1),
      destination: this.data.destination.substr(this.data.destination.indexOf('@') + 1),
      weight: parseInt(this.data.formdata.weight),
      channel: this.data.formdata.channel
    }
    console.log(params)

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/price-calculate',
      method: 'GET',
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.data.formdata.freight = res.data.price
          self.setData({ formdata: self.data.formdata })
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
        // hasClick = false
      }
    })
  },

  notice() {
    wx.showModal({
      title: '温馨提示',
      content: '脚递官方暂时只提供从中国寄到其他国家的服务，下单后请先将物品物品寄到北京总部，我们会派专员送到您的地址，此服务会收取运费的5%作为我们的服务费，请您谅解！',
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#033150',
      success: function (res) {
        if (res.confirm) {
        }
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
  }
})
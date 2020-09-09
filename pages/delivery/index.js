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
      reward: null,
      weight: null,
      details: '',
      need_agent: true
    },
    address: null,
    responseObj: {},
    typearray: [ '文件', '化妆品', '衣物鞋子', '电子产品', '液体', '其他' ],
    images: [],
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
  },

  weightBlur (e) {
    this.data.formdata.weight = (this.data.formdata.weight || '') + 'kg'
    this.setData({
      formdata: this.data.formdata
    })
  },

  weightFocus (e) {
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

  rewardBlur(e) {
    this.data.formdata.reward = (this.data.formdata.reward || '') + 'RMB'
    this.setData({
      formdata: this.data.formdata
    })
  },

  rewardFocus(e) {
    this.data.formdata.reward = parseInt(this.data.formdata.reward)
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

  submitDelivery: function () {
    var self = this
    if (this.data.departure === '' || this.data.departure === null) {
      wx.showToast({ title: '请选择出发地', icon: 'none' })
      return
    }
    if (this.data.destination === '' || this.data.destination === null) {
      wx.showToast({ title: '请选择目的地', icon: 'none' })
      return
    }
    if (this.data.formdata.price === 'RMB' || this.data.formdata.price === null) {
      wx.showToast({ title: '请填写物品价格', icon: 'none' })
      return
    }
    if (this.data.formdata.reward === 'RMB' || this.data.formdata.reward === null) {
      wx.showToast({ title: '请填写帮带报酬', icon: 'none' })
      return
    }
    if (this.data.formdata.weight === 'kg' || this.data.formdata.weight === null) {
      wx.showToast({ title: '请填写物品重量', icon: 'none' })
      return
    }
    // if (this.data.formdata.details === '' || this.data.formdata.details === null) {
    //   wx.showToast({ title: '请填写备注', icon: 'none' })
    //   return
    // }
    if (!this.data.address || !this.data.address.id) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }

    var params = {
      type: 'normal',
      departure: this.data.departure,
      destination: this.data.destination,
      item_type: this.data.formdata.item_type,
      price: parseInt(this.data.formdata.price),
      reward: parseInt(this.data.formdata.reward),
      weight: parseInt(this.data.formdata.weight),
      details: this.data.formdata.details,
      address_id: this.data.address.id,
      need_agent: this.data.formdata.need_agent
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

  submitImages: function () {
    var that = this
    if (!this.data.images.length) {
      // wx.redirectTo({
      //   url: '/pages/delivery/order/order?id=' + that.data.responseObj.id
      // })
      wx.redirectTo({
        url: '/pages/delivery/result/result?id=' + that.data.responseObj.id,
      })
    }
    
    wx.showLoading({
      title: '正在上传...',
      mask: true
    })

    // 将选择的图片组成一个Promise数组，准备进行并行上传
    const arr = this.data.images.map(path => {
      return wx.uploadFile({
        url: app.globalData.baseUrl + '/app/v1/deliveries/' + that.data.responseObj.id  + '/resources',
        filePath: path,
        name: 'file',
        header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization'), 'Content-Type': 'multipart/form-data' },
        success: function(res) {
          return res
        },
        fail: function(res) {
          return res
        }
      })
    })

    Promise.all(arr).then(res => {
      console.log(res)
      // wx.redirectTo({
      //   url: '/pages/delivery/order/order?id=' + that.data.responseObj.id
      // })

      // wx.hideLoading()
      // var check = res.every((item, index, array) => {
      //   return item.statusCode && item.statusCode >= 200 && item.statusCode < 300
      // })
      // if (check) {
      //   console.log('图片全部上传成功')
      // wx.redirectTo({
      //   url: '/pages/delivery/result/result?id=' + that.data.responseObj.id,
      // })
      // } else {
      //   wx.showToast({ title: '图片上传失败', icon: 'none' })
      // }

      wx.redirectTo({
        url: '/pages/delivery/result/result?id=' + that.data.responseObj.id,
      })
      
    }).catch(err => {
      console.log('image err')
      console.log(err)
      wx.showToast({ title: err, icon: 'none' })
    }).then(() => {
      wx.hideLoading()
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

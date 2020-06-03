var tools = require('../../utils/util.js')
var app = getApp()
var hasClick = false
Page({
  data: {
    formdata: {
      departure: "BJR@CN",
      destination: "BJR@CN",
      dt_departure: '',
      weight: null,
      unit_price: null,
      details: '',
    },
    responseObj: {},
    complete: false
  },
  onLoad: function () {
  },
  onHide: function () {
    this.setData({
      complete: false
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
  submitTravel: function() {
    var self = this
    if (this.data.formdata.departure === '' || this.data.formdata.departure === null) {
      wx.showToast({ title: '请选择出发地', icon: 'none' })
      return
    }
    if (this.data.formdata.destination === '' || this.data.formdata.destination === null) {
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
      departure: this.data.formdata.departure,
      destination: this.data.formdata.destination,
      dt_departure: tools.dateToUTC(this.data.formdata.dt_departure),
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

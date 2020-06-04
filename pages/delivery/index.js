var app = getApp()
var hasClick = false
Page({
  data: {
    formdata: {
      departure: "BJR@CN",
      destination: "BJR@CN",
      item_type: '',
      price: null,
      reward: null,
      weight: null,
      details: '',
    },
    responseObj: {},
    typearray: [ '文件', '化妆品', '衣物鞋子', '电子产品', '液体', '其他' ]
  },
  onLoad: function () {
  },
  onShow: function () {
    if (!app.globalData.isLogin || !app.globalData.user || !app.globalData.user.id) {
      wx.redirectTo({
        url: '/pages/user/auth/auth',
      })
    }
  },
  submit() {
    wx.navigateTo({
      url: '/pages/delivery/order/order'
    })
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
  submitDelivery: function () {
    var self = this
    if (this.data.formdata.departure === '' || this.data.formdata.departure === null) {
      wx.showToast({ title: '请选择出发地', icon: 'none' })
      return
    }
    if (this.data.formdata.destination === '' || this.data.formdata.destination === null) {
      wx.showToast({ title: '请选择目的地', icon: 'none' })
      return
    }
    if (this.data.formdata.price === '' || this.data.formdata.price === null) {
      wx.showToast({ title: '请填写物品价格', icon: 'none' })
      return
    }
    if (this.data.formdata.reward === '' || this.data.formdata.reward === null) {
      wx.showToast({ title: '请填写帮带报酬', icon: 'none' })
      return
    }
    if (this.data.formdata.weight === '' || this.data.formdata.weight === null) {
      wx.showToast({ title: '请填写物品重量', icon: 'none' })
      return
    }
    if (this.data.formdata.details === '' || this.data.formdata.details === null) {
      wx.showToast({ title: '请填写备注', icon: 'none' })
      return
    }
    var params = {
      departure: this.data.formdata.departure,
      destination: this.data.formdata.destination,
      item_type: this.data.formdata.item_type,
      price: parseInt(this.data.formdata.price),
      reward: parseInt(this.data.formdata.reward),
      weight: parseInt(this.data.formdata.weight),
      details: this.data.formdata.details,
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
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          self.setData({ responseObj: res.data })
          wx.redirectTo({
            url: '/pages/delivery/order/order?id=' + res.data.id
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
})

var app = getApp()
var hasClick = false
Page({
  data: {
    formdata: {
      departure: "CN",
      destination: "CN",
      item_type: '',
      price: null,
      weight: null,
      express: ''
    },
    typearray: ['文件', '化妆品', '衣物鞋子', '电子产品', '液体', '其他'],
    expressFee: 0,
    serviceFee: 0,
    total: 0,
    responseObj: {}
  },
  onLoad: function () {
  },
  onShow: function () {
    // 设置tabbar选中
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
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
  doCalculate: function() {
    var self = this
    if (this.data.formdata.departure === '' || this.data.formdata.departure === null) {
      wx.showToast({ title: '请选择出发地', icon: 'none' })
      return
    }
    if (this.data.formdata.destination === '' || this.data.formdata.destination === null) {
      wx.showToast({ title: '请选择目的地', icon: 'none' })
      return
    }
    if (this.data.formdata.item_type === '' || this.data.formdata.item_type === null) {
      wx.showToast({ title: '请选择物品类型', icon: 'none' })
      return
    }
    if (this.data.formdata.price === '' || this.data.formdata.price === null) {
      wx.showToast({ title: '请填写物品价格', icon: 'none' })
      return
    }
    if (this.data.formdata.weight === '' || this.data.formdata.weight === null) {
      wx.showToast({ title: '请填写物品重量', icon: 'none' })
      return
    }
    if (this.data.formdata.express === '' || this.data.formdata.express === null) {
      wx.showToast({ title: '请填写快递类型', icon: 'none' })
      return
    }
    var params = {
      departure: this.data.formdata.departure,
      destination: this.data.formdata.destination,
      item_type: this.data.formdata.item_type,
      price: parseInt(this.data.formdata.price),
      weight: parseInt(this.data.formdata.weight),
      express: this.data.formdata.express,
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
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          self.setData({ responseObj: res.data })
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
  }
})

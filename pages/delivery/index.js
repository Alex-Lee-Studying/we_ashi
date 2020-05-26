Page({
  data: {
    item_type: '电子产品',
    price: '1000',
    reward: '¥150',
    weight: '2',
    remark: '',
    typearray: [ '文件', '化妆品', '衣物鞋子', '电子产品', '液体', '其他' ]
  },
  onLoad: function () {
  },
  submit() {
    wx.navigateTo({
      url: '/pages/delivery/order/order'
    })
  },
  bindTypeChange(e) {
    var idx = e.detail.value
    this.setData({ 'item_type': this.data.typearray[idx] })
  }
})

Page({
  data: {
    item_type: 'kindle（电子产品）',
    price: '1000',
    reward: '¥150',
    weight: '2',
    remark: ''
  },
  onLoad: function () {
  },
  submit() {
    wx.navigateTo({
      url: '/pages/delivery/order/order'
    })
  }
})

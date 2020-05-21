Page({
  data: {
    item_type: 'kindle（电子产品）',
    price: '1000RMB',
    reward: '¥150',
    weight: '2kg',
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

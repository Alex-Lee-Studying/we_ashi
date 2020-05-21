// pages/order/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  submit() {
    wx.showModal({
      title: '温馨提示',
      content: '脚递官方暂时只提供从中国寄到其他国家的服务，下单后请先将物品物品寄到北京总部，我们会派专员送到您的地址，此服务会收取运费的5%作为我们的服务费，请您谅解！',
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#033150',
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/order/pay/pay',
          })
        }
      }
    })
  }
})
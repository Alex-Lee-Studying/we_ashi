Page({
  data: {
    traveler: '王天霸',
    flight_no: 'G1236',
    dt_departure: '2020-05-18',
    weight: '10',
    unit_price: '70',
    remark: '可代买，不接液体',
    complete: false
  },
  onLoad: function () {
  },
  onHide: function () {
    this.setData({
      complete: false
    })
  },
  bindDateChange: function(e) {
    this.setData({
      dt_departure: e.detail.value
    })
  },
  submitTravel: function() {
    this.setData({
      complete: true
    })
  },
  completeTravel: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})

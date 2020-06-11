var hasClick = false
var app = getApp()
Page({
  data: {
    type: '',
    departure: '',
    destination: ''
  },

  onLoad(options) {
    this.setData({
      type: options.type
    })
  },

  clear() {
    this.setData({
      departure: '',
      destination: ''
    })
  },

  toFilter() {
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]   //上一页

    if (this.data.type === 'delivery') {
      prevPage.setData({
        tabname: 'delivery',
        departure: this.data.departure,
        destination: this.data.destination,
      })
    } else if (this.data.type === 'travel') {
      prevPage.setData({
        tabname: 'travel',
        departure: this.data.departure,
        destination: this.data.destination,
      })
    }
    

    wx.navigateBack()
  }
})
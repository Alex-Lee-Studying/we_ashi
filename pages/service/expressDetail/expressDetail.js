var app = getApp()
var hasClick = false
Page({
  data: {
    express: {}
  },

  onLoad(option) {
    if (option.express) {
      this.setData({ express: JSON.parse(option.express) })
    }
  }
})
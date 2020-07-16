var app = getApp()
Page({
  data: {
    isIphoneX: app.globalData.isIphoneX,
    tabname: 'express'
  },
  onLoad: function () {
  },
  onShow: function () {
    // 设置tabbar选中
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },
  changeTab(e) {
    var tab = e.target.dataset.tab
    this.setData({ tabname: tab })
  }
})

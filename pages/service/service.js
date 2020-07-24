import { networks } from '../../utils/network'
import { expresses } from '../../utils/express'
var app = getApp()

Page({
  data: {
    isIphoneX: app.globalData.isIphoneX,
    tabname: 'express',
    networkList: networks,
    expressList: expresses
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

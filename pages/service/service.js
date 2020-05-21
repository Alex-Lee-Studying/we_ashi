Page({
  data: {
    tabname: 'express'
  },
  onLoad: function () {
  },
  changeTab(e) {
    var tab = e.target.dataset.tab
    this.setData({ tabname: tab })
  }
})

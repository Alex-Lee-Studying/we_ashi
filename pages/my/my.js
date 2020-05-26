Page({
  data: {
    tabname: 'delivery'
  },
  onLoad: function () {
  },
  changeTab(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ tabname: tab })
  }
})

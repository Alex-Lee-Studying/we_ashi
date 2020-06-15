Page({
  data: {
  },
  onLoad: function () {
  },
  onShow: function () {
    // 设置tabbar选中
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },
  handleContact(e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  }
})

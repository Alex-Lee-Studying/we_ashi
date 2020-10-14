Component({
  data: {
    msgUnread: 0,
    selected: 0,
    color: "#333333",
    selectedColor: "#fff",
    backgroundColor: "#fff",
    selectedBackgroundColor: "#033150",
    list: [
      {
        "pagePath": "/pages/index/index",
        "iconPath": "/images/icon_home.png",
        "selectedIconPath": "/images/icon_home_selected.png",
        "text": "首页"
      },
      {
        "pagePath": "/pages/service/service",
        "iconPath": "/images/icon_service.png",
        "selectedIconPath": "/images/icon_service_selected.png",
        "text": "服务"
      },
      {
        "pagePath": "/pages/fee/fee",
        "iconPath": "/images/icon_fee.png",
        "selectedIconPath": "/images/icon_fee_selected.png",
        "text": "运费"
      },
      {
        "pagePath": "/pages/message/message",
        "iconPath": "/images/icon_message.png",
        "selectedIconPath": "/images/icon_message_selected.png",
        "text": "消息"
      },
      {
        "pagePath": "/pages/my/my",
        "iconPath": "/images/icon_my.png",
        "selectedIconPath": "/images/icon_my_selected.png",
        "text": "我的"
      }
    ]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    }
  }
})
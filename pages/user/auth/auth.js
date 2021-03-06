//获取应用实例
const app = getApp()
var hasClick = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    agree: false
  },

  onLoad() {
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]   //上一页
    this.setData({ prevPage: prevPage })
    console.log(prevPage)
  },

  changeAgree(e) {
    var ag = this.data.agree
    this.setData({ agree: !ag })
  },

  doLogin(e) {
    if (e.detail.userInfo) {
      // 用户按了允许授权按钮
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })

      const self = this
      wx.login({
        success: function (res) {
          if (res.code) {
            console.log('code:' + res.code)
            //发起网络请求
            if (hasClick) return
            hasClick = true
            wx.showLoading()

            wx.request({
              url: app.globalData.baseUrl + '/user/v1/auth',
              method: 'POST',
              data: {
                provider: "wechat_miniprogram",   // 固定wechat_miniprogram
                code: res.code,                  // 小程序 auth_code
                nick_name: self.data.userInfo.nickName,           // 用户昵称，拉起授权后获得
                gender: self.data.userInfo.gender,                        // 用户性别 0:未知 1:男 2:女 ,拉起授权后获得
                avatar: self.data.userInfo.avatarUrl              // 头像url ,拉起授权后获得
              },
              success: function (res) {
                if (res.data.token) {
                  //获取到用户凭证 存儲 3rd_session 
                  wx.setStorage({
                    key: "ashibro_Authorization",
                    data: res.data.token
                  })
                  wx.setStorage({
                    key: "ashibro_User",
                    data: res.data
                  })
                  app.globalData.isLogin = true
                  app.globalData.user = res.data

                  if (self.data.prevPage && self.data.prevPage.route) {
                    if (self.data.prevPage.route !== 'pages/index/index' && self.data.prevPage.route !== 'pages/service/service' && self.data.prevPage.route !== 'pages/fee/fee' && self.data.prevPage.route !== 'pages/message/message' && self.data.prevPage.route !== 'pages/my/my') {
                      wx.navigateBack({
                        delta: 1
                      })
                    } else {
                      wx.switchTab({
                        url: '/' + self.data.prevPage.route,
                      })
                    }                    
                  } else {
                    wx.switchTab({
                      url: '/pages/my/my',
                    })
                  }
                } else {
                  app.globalData.isLogin = false
                  wx.showToast({ title: '登录失败！', icon: 'none' })
                }
              },
              fail: function (res) {
                wx.showToast({ title: '系统错误', icon: 'none' })
              },
              complete: function (res) {
                wx.hideLoading()
                hasClick = false
              }
            })
          }
        },
        fail: function (res) {
          console.log('wx.login 失败')
        }
      })
    } else {
      // 用户按了拒绝按钮
    }
  }
})
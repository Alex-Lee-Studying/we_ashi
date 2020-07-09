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
  },

  changeAgree(e) {
    var ag = this.data.agree
    this.setData({ agree: !ag })
  },

  doLogin(e) {
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

                if (app.globalData.user && app.globalData.user.id) {
                  app.globalData.goEasy.subscribe({
                    channel: app.globalData.user.id, //替换为您自己的channel
                    onMessage: function (message) {
                      console.log("Channel:" + message.channel + " content:" + message.content);
                    }
                  });
                }

                wx.switchTab({
                  url: '/pages/my/my',
                })
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
  }
})
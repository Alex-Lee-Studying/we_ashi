//app.js
App({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  globalData: {
    baseUrl: 'https://api.ashibro.com',
    isLogin: false,
    userInfo: null, // 微信用户信息
    user: null // 登录之后服务器返回的用户信息
  },  
  onLaunch: function () {
    var self = this
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    this.globalData.user = wx.getStorageSync('ashibro_User') || {}

    wx.checkSession({
      success(res) {
        //session_key 未过期，并且在本生命周期一直有效        
        self.globalData.isLogin = true
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        //重新登录
        self.globalData.isLogin = false
      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              console.log(this.globalData)
            }
          })
        }
      }
    })
  }
})
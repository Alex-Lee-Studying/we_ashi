//app.js
import GoEasy from 'utils/goeasy-1.0.17';
import moment from 'utils/moment.min.js';
App({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  globalData: {
    // baseUrl: 'https://api.ashibro.com',
    baseUrl: 'https://dev.api.ashibro.com',
    moment: moment,
    countries: [],
    isLogin: false,
    userInfo: null, // 微信用户信息
    user: null, // 登录之后服务器返回的用户信息
    msgContext: {}, // 消息上下文
    msgUnread: 0 //消息未读数
  },  
  onLaunch: function () {
    var self = this
    self.globalData.user = wx.getStorageSync('ashibro_User') || {}

    // wx.checkSession({
    //   success() {
    //     //session_key 未过期，并且在本生命周期一直有效
    //     self.globalData.isLogin = true
    //   },
    //   fail() {
    //     // session_key 已经失效，需要重新执行登录流程
    //     wx.setStorage({
    //       key: "ashibro_Authorization",
    //       data: ''
    //     })
    //     wx.setStorage({
    //       key: "ashibro_User",
    //       data: {}
    //     })
    //     self.globalData.isLogin = false
    //   }
    // })

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
    if (wx.getStorageSync('ashibro_Authorization')) {
      this.tokenRefresh()
    }
    this.getMessageContext()
    this.getCountriesCities()

    this.globalData.isIphoneX = this.isIphoneX()

    this.getSessions()
    this.getSessionsOfsys()
  },

  isIphoneX() {
    let info = wx.getSystemInfoSync()
    if (/iPhone X/i.test(info.model)) {
      return true;
    } else {
      return false;
    }
  },

  // 消息服务上下文
  getMessageContext() {
    var self = this
    // wx.showLoading()

    wx.request({
      url: this.globalData.baseUrl + '/message/v1/message-context',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 服务器回包内容
          self.globalData.msgContext = res.data

          // self.globalData.msgContext.host = 'https://rest-hangzhou.goeasy.io/publish'
          // 在onLaunch方法里初始化全局GoEasy对象
          self.globalData.goEasy = new GoEasy({
            host: "hangzhou.goeasy.io", //应用所在的区域地址: 【hangzhou.goeasy.io | singapore.goeasy.io】
            appkey: self.globalData.msgContext.app_key, //替换为您的应用appkey
            onConnected: function () {
              console.log('连接成功！')
            },
            onDisconnected: function () {
              console.log('连接断开！')
            },
            onConnectFailed: function (error) {
              console.log('连接失败或错误！')
            }
          })

        } else {
          console.log(res)
          if (res.errMsg && res.errMsg === 'request:ok') {
            if (res.data.msg && res.data.msg.indexOf('Token Expired') !== -1) {
              wx.navigateTo({
                url: '/pages/user/auth/auth',
              })
            } else {
              wx.showToast({ title: res.data.msg, icon: 'none' })
            }
          } else {
            wx.showToast({ title: res.errMsg || '请求出错', icon: 'none' })
          }
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        // wx.hideLoading()
      }
    })
  },

  // 国家城市列表
  getCountriesCities() {
    var self = this
    // wx.showLoading()

    wx.request({
      url: this.globalData.baseUrl + '/app/v1/countries-cities',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length) {
            res.data.forEach((item, idx, array) => {
              item.cities.unshift({ code: "", desc: "不限" })
            })
          }
          self.globalData.countries = res.data
        } else {
          console.log(res)
          if (res.errMsg && res.errMsg === 'request:ok') {
            if (res.data.msg && res.data.msg.indexOf('Token Expired') !== -1) {
              wx.navigateTo({
                url: '/pages/user/auth/auth',
              })
            } else {
              wx.showToast({ title: res.data.msg, icon: 'none' })
            }
          } else {
            wx.showToast({ title: res.errMsg || '请求出错', icon: 'none' })
          }
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        // wx.hideLoading()
      }
    })
  },

  // 刷新token
  tokenRefresh() {
    var self = this

    wx.request({
      url: this.globalData.baseUrl + '/user/v1/token-refresh',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        console.log(res)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.globalData.isLogin = true
          wx.setStorage({
            key: "ashibro_Authorization",
            data: res.data.token
          })
        } else {
          if (res.data.msg && res.data.msg.indexOf('Token Expired') !== -1) {
            // wx.navigateTo({
            //   url: '/pages/user/auth/auth',
            // })
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none' })
          }
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
      }
    })
  },

  // 获取对话列表
  getSessions() {
    var self = this

    wx.request({
      url: this.globalData.baseUrl + '/message/v1/sessions',
      method: 'GET',
      header: { 'page': 0, 'page-size': 9999, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length) {
            res.data.forEach((item, index, arr) => {
              self.globalData.msgUnread += item.unread
            })
          }
        } else {
          if (res.data.msg && res.data.msg.indexOf('Token Expired') !== -1) {
            wx.navigateTo({
              url: '/pages/user/auth/auth',
            })
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none' })
          }
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
      }
    })
  },

  // 获取系统消息客户消息对话列表
  getSessionsOfsys() {
    var self = this
    wx.request({
      url: this.globalData.baseUrl + '/message/v1/sessions',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: { internal: true },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length) {
            res.data.forEach((item, index, arr) => {
              self.globalData.msgUnread += item.unread
            })
          }
        } else {
          if (res.data.msg && res.data.msg.indexOf('Token Expired') !== -1) {
            wx.navigateTo({
              url: '/pages/user/auth/auth',
            })
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none' })
          }
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
      }
    })
  }
})
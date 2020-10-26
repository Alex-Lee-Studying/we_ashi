var app = getApp()
var hasClick = false
Page({
  data: {
    deliveryId: null,
    delivery: {},
    payment: null,
    target_user_id: ''
  },

  onLoad(option) {
    console.log(option)
    if (option.id) {
      this.setData({ deliveryId: option.id })
      this.getDelivery()
      this.getPayResult()
    } else {
      wx.redirectTo({
        url: '/pages/delivery/index'
      })
    }
  },

  onShow() {
    if (!app.globalData.msgContext || !app.globalData.msgContext.host) {
      this.getMessageContext()
    } else {
      app.globalData.goEasy.subscribe({
        channel: app.globalData.user.id, //替换为您自己的channel
        onMessage: function (message) {
          console.log(message)
        }
      })
    }
  },

  getDelivery: function () {
    var self = this

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries/' + this.data.deliveryId,
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.departure = res.data.departure.indexOf('@') === 0 ? res.data.departure.slice(1) : res.data.departure
          res.data.destination = res.data.destination.indexOf('@') === 0 ? res.data.destination.slice(1) : res.data.destination
          res.data.departure = res.data.departure ? res.data.departure.replace('@', ',') : ''
          res.data.destination = res.data.destination ? res.data.destination.replace('@', ',') : ''
          self.setData({ 
            delivery: res.data,
            target_user_id: res.data.travel !== null ? res.data.travel.user.id : ''
          })
        } else {
          console.log(res)
          wx.showToast({ title: res.data.msg, icon: 'none' })
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: 'none' })
      },
      complete: function (res) {
        wx.hideLoading()
        // hasClick = false
      }
    })
  },

  getPayResult: function () {
    var self = this

    var params = {
      delivery_id: this.data.deliveryId
    }
    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/transaction/v1/payments',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({
            payment: res.data[0] || {}
          })
          if (self.data.payment.status === 'success') {
            const params = {
              type: 'text',
              content: '我已经完成支付啦！'
            }
            self.addMessage(params)
          }
        } else {
          console.log(res)
          wx.showToast({ title: res.data.msg, icon: 'none' })
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
  },

  // 发布消息
  addMessage(opts) {
    var self = this
    var params = opts
    if (app.globalData.msgContext.host === '' || app.globalData.msgContext.host === null) {
      return
    }
    if (params.type === '' || params.type === null) {
      return
    }
    if (this.data.target_user_id === '' || this.data.target_user_id === null) {
      wx.showToast({ title: '无效用户ID', icon: 'none' })
      return
    }
    params.target_user_id = this.data.target_user_id

    console.log(params)

    // if (hasClick) return
    // hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/messages',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization'),
        'IM-Host': app.globalData.msgContext.host,
        'Content-Type': 'multipart/form-data; boundary=XXX'
      },
      data: formdata(params),
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
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
        wx.hideLoading()
        // hasClick = false
      }
    })
  },

  // 消息服务上下文
  getMessageContext() {
    var self = this
    // wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/message-context',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 服务器回包内容
          app.globalData.msgContext = res.data

          // app.globalData.msgContext.host = 'https://rest-hangzhou.goeasy.io/publish'
          // 在onLaunch方法里初始化全局GoEasy对象
          app.globalData.goEasy = new GoEasy({
            host: "hangzhou.goeasy.io", //应用所在的区域地址: 【hangzhou.goeasy.io | singapore.goeasy.io】
            appkey: app.globalData.msgContext.app_key, //替换为您的应用appkey
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

          if (app.globalData.user && app.globalData.user.id) {
            app.globalData.goEasy.subscribe({
              channel: app.globalData.user.id, //替换为您自己的channel
              onMessage: function (message) {
                console.log(message)
                self.getMessage(message.content)
              }
            })
          }

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
  }

})
var hasClick = false
var app = getApp()

var windowWidth = wx.getSystemInfoSync().windowWidth
var windowHeight = wx.getSystemInfoSync().windowHeight
var keyHeight = 0
var msgList = [
  {
    speaker: 'server',
    contentType: 'text',
    content: [
      {
        type: 1,
        content: '欢迎来到英雄联盟，敌军还有30秒到达战场，请做好准备！'
      }
    ]
  },
  {
    speaker: 'customer',
    contentType: 'text',
    content: [
      {
        type: 1,
        content: '我怕是走错片场了...'
      }
    ]
  }
]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    session_id: '',
    target_user_id: '',
    delivery_id: '',
    travel_id: '',
    session: {},
    messageList: [],
    currBtn: '', // voice emoji plus
    scrollHeight: '100vh',
    inputBottom: 0,
    cursor: 0,
    parsedComment: [],
    msgList: [],
    inputVal: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.targetUid) {
      this.setData({ target_user_id: options.targetUid })
      this.getUserSessions(options.targetUid)
    }
    if (options.deliveryId) {
      this.setData({ delivery_id: options.deliveryId })
    }
    if (options.travelId) {
      this.setData({ travel_id: options.travelId })
    }

    if (options.sessionId) {
      this.setData({ session_id: options.sessionId })
      this.getSession(options.sessionId)
      this.getMessages(options.sessionId)
    }

    this.setData({
      msgList: msgList
    })

    const emojiInstance = this.selectComponent('.mp-emoji')
    console.log(emojiInstance)
    this.emojiNames = emojiInstance.getEmojiNames()
    this.parseEmoji = emojiInstance.parseEmoji
  },

  onShow: function(options) {
    var self = this
    if (app.globalData.user && app.globalData.user.id) {
      this.setData({ user: app.globalData.user })

      app.globalData.goEasy.subscribe({
        channel: app.globalData.user.id, //替换为您自己的channel
        onMessage: function (message) {
          console.log(message)
          self.getMessage(message.content)
        }
      });

    }
  },

  changeInput: function(e) {
    this.setData({ currBtn: e.currentTarget.dataset.btn })
    if (this.data.currBtn === 'plus') {
      this.setData({
        scrollHeight: (windowHeight - 136) + 'px',
        toView: 'msg-' + (this.data.messageList.length - 1),
        inputBottom: 0
      })
    }
  },

  /**
   * 获取聚焦
   */
  focus: function (e) {
    keyHeight = e.detail.height
    this.setData({
      currBtn: '',
      scrollHeight: (windowHeight - keyHeight) + 'px',
      toView: 'msg-' + (this.data.messageList.length - 1),
      inputBottom: keyHeight + 'px'
    })
    //计算msg高度
    // calScrollHeight(this, keyHeight);

  },

  //失去聚焦(软键盘消失)
  blur: function (e) {
    this.setData({
      scrollHeight: '100vh',
      inputBottom: 0,
      cursor: e.detail.cursor || 0
    })
  },

  onInput(e) {
    const value = e.detail.value
    this.setData({
      inputVal: value
    })
  },

  /**
   * 发送点击监听
   */
  sendClick: function (e) {
    // const parsedComment = this.parseEmoji(e.detail.value)
    const params = {
      type: 'text',
      content: e.detail.value
    }
    this.addMessage(params)
    this.setData({ inputVal: '' })
  },

  // insertEmoji(evt) {
  //   const emotionName = evt.detail.emotionName
  //   const { cursor, inputVal } = this.data
  //   const newComment =
  //     inputVal.slice(0, cursor) + emotionName + inputVal.slice(cursor)
  //   this.setData({
  //     inputVal: newComment,
  //     cursor: cursor + emotionName.length
  //   })
  // },
  // sendEmoji() {
  //   const parsedComment = this.parseEmoji(this.data.inputVal)
  //   msgList.push({
  //     speaker: 'customer',
  //     contentType: 'text',
  //     content: parsedComment
  //   })
  //   inputVal = '';
  //   this.setData({
  //     msgList,
  //     inputVal
  //   })
  // },
  // deleteEmoji: function () {
  //   const pos = this.data.cursor
  //   const comment = this.data.inputVal
  //   let result = '',
  //     cursor = 0

  //   let emojiLen = 6
  //   let startPos = pos - emojiLen
  //   if (startPos < 0) {
  //     startPos = 0
  //     emojiLen = pos
  //   }
  //   const str = comment.slice(startPos, pos)
  //   const matchs = str.match(/\[([\u4e00-\u9fa5\w]+)\]$/g)
  //   // 删除表情
  //   if (matchs) {
  //     const rawName = matchs[0]
  //     const left = emojiLen - rawName.length
  //     if (this.emojiNames.indexOf(rawName) >= 0) {
  //       const replace = str.replace(rawName, '')
  //       result = comment.slice(0, startPos) + replace + comment.slice(pos)
  //       cursor = startPos + left
  //     }
  //     // 删除字符
  //   } else {
  //     let endPos = pos - 1
  //     if (endPos < 0) endPos = 0
  //     const prefix = comment.slice(0, endPos)
  //     const suffix = comment.slice(pos)
  //     result = prefix + suffix
  //     cursor = endPos
  //   }
  //   this.setData({
  //     comment: result,
  //     cursor: cursor
  //   })
  // },

  getlocation() {
    var that = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        msgList.push({
          speaker: 'customer',
          contentType: 'map',
          content: {
            latitude: latitude,
            longitude: longitude
          }
        })
        that.setData({
          msgList
        })
      }
    })
  },

  openlocation(e) {
    wx.openLocation({
      latitude: e.detail.latitude,
      longitude: e.detail.longitude,
      scale: 18
    })
  },

  chooseImage(e) {
    var that = this
    wx.chooseImage({
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        const params = {
          type: 'media',
          tempFilePaths: res.tempFilePaths
        }
        this.submitImages(params)
      }
    })
  },
  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = (e.target.dataset.images instanceof Array) ? e.target.dataset.images : [e.target.dataset.images]
    wx.previewImage({
      current: images[idx],  //当前预览的图片
      urls: images,  //所有要预览的图片
    })
  },

  sendTravel() {

  },

  sendDelivery() {

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

    if (params.type === 'text') {
    } else if (params.type === 'media') {
    } else if (params.type === 'travel') {
    } else if (params.type === 'delivery') {
    }
    console.log(params)

    if (hasClick) return
    hasClick = true
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
          const messageList = self.data.messageList
          messageList.push(res.data)
          self.setData({
            messageList: messageList,
            toView: 'msg-' + (messageList.length - 1)
          })
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
        hasClick = false
      }
    })
  },

  // 会话列表
  getUserSessions(target_user_id) {
    var self = this
    var page = 0
    var pageSize = 20

    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/sessions',
      method: 'GET',
      header: { 'page': page, 'page-size': pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: {
        user_id: target_user_id
      },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length) {
            self.getMessages(res.data[0].id)
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
        wx.hideLoading()
      }
    })
  },

  // 会话详情
  getSession(session_id) {
    var self = this

    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/sessions/' + session_id,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ session: res.data })
          // 筛选目标用户id
          if (res.data.users && res.data.users.length) {
            res.data.users.forEach((item, index, arr) => {
              if (item.id !== app.globalData.user.id) {
                self.setData({ target_user_id: item.id })
                return
              }
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
        wx.hideLoading()
      }
    })
  },

  // 会话消息列表
  getMessages(session_id) {
    var self = this
    var page = 0
    var pageSize = 20

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/sessions/' + session_id + '/messages',
      method: 'GET',
      header: { 'page': page, 'page-size': pageSize, 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          self.setData({ messageList: res.data.reverse() })
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
        hasClick = false
      }
    })
  },

  // 消息详情
  getMessage(mid) {
    var self = this

    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/messages/' + mid,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.author.id === self.data.target_user_id) {
            const messageList = self.data.messageList
            messageList.push(res.data)
            self.setData({
              messageList: messageList,
              toView: 'msg-' + (messageList.length - 1)
            })
            this.setData({
              toView: 'msg-' + (this.data.messageList.length - 1)
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
        wx.hideLoading()
      }
    })
  },

  submitImages: function (opts) {
    var that = this
    if (!opts.tempFilePaths.length) {
      return
    }

    wx.showLoading({
      title: '正在上传...',
      mask: true
    })

    opts.tempFilePaths.map(path => {
      wx.uploadFile({
        url: app.globalData.baseUrl + '/message/v1/messages',
        filePath: path,
        name: 'file',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization'),
          'IM-Host': app.globalData.msgContext.host,
          'Content-Type': 'multipart/form-data'
        },
        formData: {
          type: 'media',
          target_user_id: that.data.target_user_id
        },
        success(res) {
          var data = JSON.parse(res.data)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const messageList = that.data.messageList
            messageList.push(data)
            that.setData({
              messageList: messageList,
              toView: 'msg-' + (messageList.length - 1)
            })
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
        fail(res) {
          console.log(res)
          wx.showToast({ title: '系统错误', icon: 'none' })
        },
        complete(res) {
          wx.hideLoading()
        }
      })
    })
  }
})

var formdata=function(obj = {}) {
  let result = ''
  for (let name of Object.keys(obj)) {
    let value = obj[name];
    result +=
      '\r\n--XXX' +
      '\r\nContent-Disposition: form-data; name=\"' + name + '\"' +
      '\r\n' +
      '\r\n' + value
  }
  return result + '\r\n--XXX--'
}

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
var inputVal = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    session_id: '',
    target_user_id: '',
    session: {},
    msgContext: {},
    addform: {
      type: 'text',
      content: '测试测试你好啊'
    },
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
    }
    if (options.sessionId) {
      this.setData({ session_id: options.sessionId })
      this.getSession()
    }

    this.setData({
      msgList: msgList,
      cusHeadIcon: app.globalData.user.avatar,
    })

    const emojiInstance = this.selectComponent('.mp-emoji')
    console.log(emojiInstance)
    this.emojiNames = emojiInstance.getEmojiNames()
    this.parseEmoji = emojiInstance.parseEmoji
  },

  onShow: function(options) {
    this.getMessageContext()
  },

  changeInput: function(e) {
    this.setData({ currBtn: e.currentTarget.dataset.btn })
  },

  /**
   * 获取聚焦
   */
  focus: function (e) {
    keyHeight = e.detail.height
    this.setData({
      scrollHeight: (windowHeight - keyHeight) + 'px'
    })
    this.setData({
      toView: 'msg-' + (msgList.length - 1),
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
    this.setData({
      toView: 'msg-' + (msgList.length - 1)
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
    const parsedComment = this.parseEmoji(e.detail.value)
    msgList.push({
      speaker: 'customer',
      contentType: 'text',
      content: parsedComment
    })
    inputVal = '';
    this.setData({
      msgList,
      inputVal
    })
    this.addMessage()
  },

  insertEmoji(evt) {
    const emotionName = evt.detail.emotionName
    const { cursor, inputVal } = this.data
    const newComment =
      inputVal.slice(0, cursor) + emotionName + inputVal.slice(cursor)
    this.setData({
      inputVal: newComment,
      cursor: cursor + emotionName.length
    })
  },
  sendEmoji() {
    const parsedComment = this.parseEmoji(this.data.inputVal)
    msgList.push({
      speaker: 'customer',
      contentType: 'text',
      content: parsedComment
    })
    inputVal = '';
    this.setData({
      msgList,
      inputVal
    })
  },
  deleteEmoji: function () {
    const pos = this.data.cursor
    const comment = this.data.inputVal
    let result = '',
      cursor = 0

    let emojiLen = 6
    let startPos = pos - emojiLen
    if (startPos < 0) {
      startPos = 0
      emojiLen = pos
    }
    const str = comment.slice(startPos, pos)
    const matchs = str.match(/\[([\u4e00-\u9fa5\w]+)\]$/g)
    // 删除表情
    if (matchs) {
      const rawName = matchs[0]
      const left = emojiLen - rawName.length
      if (this.emojiNames.indexOf(rawName) >= 0) {
        const replace = str.replace(rawName, '')
        result = comment.slice(0, startPos) + replace + comment.slice(pos)
        cursor = startPos + left
      }
      // 删除字符
    } else {
      let endPos = pos - 1
      if (endPos < 0) endPos = 0
      const prefix = comment.slice(0, endPos)
      const suffix = comment.slice(pos)
      result = prefix + suffix
      cursor = endPos
    }
    this.setData({
      comment: result,
      cursor: cursor
    })
  },
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
        msgList.push({
          speaker: 'customer',
          contentType: 'image',
          content: res.tempFilePaths
        })
        that.setData({
          msgList
        })
      }
    })
  },
  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = e.target.dataset.images
    wx.previewImage({
      current: images[idx],  //当前预览的图片
      urls: images,  //所有要预览的图片
    })
  },

  // 消息服务上下文
  getMessageContext() {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/message-context',
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 服务器回包内容
          self.setData({ msgContext: res.data })
        } else {
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
  addMessage() {
    var self = this
    if (this.data.msgContext.host === '' || this.data.msgContext.host === null) {
      return
    }
    if (this.data.addform.type === '' || this.data.addform.type === null) {
      return
    }
    if (this.data.target_user_id === '' || this.data.target_user_id === null) {
      wx.showToast({ title: '无效用户ID', icon: 'none' })
      return
    }

    var params = {
      type: this.data.addform.type,
      target_user_id: this.data.target_user_id
    }
    if (this.data.addform.type === 'text') {
      params.content = this.data.addform.content
    } else if (this.data.addform.type === 'media') {

    } else if (this.data.addform.type === 'travel') {
      params.travel_id = this.data.addform.travel_id
    } else if (this.data.addform.type === 'delivery') {
      params.delivery_id = this.data.addform.delivery_id
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
        'IM-Host': this.data.msgContext.host,
        'Content-Type': 'multipart/form-data; boundary=XXX'
        },
      data: formdata(params),
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(res.data)// 服务器回包内容
          self.setData({ responseObj: res.data })
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

  // 会话详情
  getSession() {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/message/v1/sessions/' + this.data.session_id,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(res.data)// 服务器回包内容
          self.setData({ session: res.data })
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

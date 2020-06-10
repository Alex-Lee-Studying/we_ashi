var app = getApp()
var hasClick = false
Page({
  data: {
    refers: [
      { name: '社交媒体', value: '社交媒体' },
      { name: '网络搜索', value: '网络搜索' },
      { name: '朋友推荐', value: '朋友推荐' }
    ],
    refer: '社交媒体',
    images: [],
    content: '',
    file: ''
  },

  radioChange(e) {
    this.setData({ refer: e.detail.value })
  },

  inputInfo: function (e) {
    let value = e.detail.value;
    this.setData({
      content: value,
      contentCount: value.length
    })
  },

  chooseImage(e) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        console.log(res)
        const images = this.data.images.concat(res.tempFilePaths)
        // 限制最多只能留下3张照片
        const imgs = images.length <= 3 ? images : images.slice(0, 3)
        this.setData({ images: imgs })
      }
    })
  },

  removeImage(e) {
    const idx = e.target.dataset.idx
    const images = this.data.images.splice(idx, 1)
    this.setData({ images: images })
  },

  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = this.data.images
    wx.previewImage({
      current: images[idx],  //当前预览的图片
      urls: images,  //所有要预览的图片
    })
  },

  submit: function() {
    var that = this
    if (this.data.content === '' || this.data.content === null) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }
    wx.showLoading({
      title: '正在上传...',
      mask: true
    })
    // 将选择的图片组成一个Promise数组，准备进行并行上传
    const arr = this.data.images.map(path => {
      return wx.uploadFile({
        url: app.globalData.baseUrl + '/app/v1/accusations',
        filePath: path,
        name: 'file',
        header: { 'Content-Type': 'multipart/form-data' },
        formData: {
          'content': that.data.content
        }
      })
    })

    Promise.all(arr).then(res => {
      // 上传成功，获取这些图片在服务器上的地址，组成一个数组
      return res.map(item => JSON.parse(item.data).url)
    }).catch(err => {
      console.log(">>>> upload images error:", err)
    }).then(urls => {
      // 调用保存反馈的后端接口
      // wx.request({
      //   url: app.globalData.baseUrl + '/app/v1/accusations',
      //   method: 'POST',
      //   header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization'), 'Content-Type': 'multipart/form-data' },
      //   data: {content: this.data.content, file: urls},
      //   success: function (res) {
      //     if (res.statusCode === 200) {
      //       console.log(res.data)// 服务器回包内容
      //       self.finish()
      //     } else {
      //       console.log(res)
      //       if (res.data.msg && res.data.msg.indexOf('Token Expired') !== -1) {
      //         wx.navigateTo({
      //           url: '/pages/user/auth/auth',
      //         })
      //       } else {
      //         wx.showToast({ title: res.data.msg, icon: 'none' })
      //       }
      //     }
      //   }
      // })
    }).catch(err => {
      console.log(">>>> create question error:", err)
    }).then(() => {
      wx.hideLoading()
    })
  },

  submitAccusations: function (e) {
    var formdata = e.detail.value
    var self = this
    if (formdata.content === '' || formdata.content === null) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }

    console.log(formdata)

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/accusations',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization'), 'Content-Type': 'multipart/form-data' },
      data: formdata,
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          self.finish()
        } else {
          console.log(res)
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

  finish() {
    wx.showModal({
      title: '',
      content: '您的宝贵意见我们已经收到',
      showCancel: false,
      confirmText: '谢谢反馈',
      confirmColor: '#033150',
      success(res) {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/my/my',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})
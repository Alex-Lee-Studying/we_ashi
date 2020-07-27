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

  onShow: function () {
    if (!app.globalData.isLogin || !app.globalData.user || !app.globalData.user.id) {
      wx.redirectTo({
        url: '/pages/user/auth/auth',
      })
    }
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
        const images = this.data.images.concat(res.tempFilePaths)
        // 限制最多只能留下3张照片
        const imgs = images.length <= 3 ? images : images.slice(0, 3)
        this.setData({ images: imgs })
      }
    })
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.idx
    const copyImages = this.data.images
    copyImages.splice(idx, 1)
    this.setData({ images: copyImages })
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
    if (!this.data.images.length) {
      wx.showToast({ title: '请选择图片', icon: 'none' })
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
        header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization'), 'Content-Type': 'multipart/form-data' },
        formData: {
          'content': that.data.content
        }
      })
    })

    Promise.all(arr).then(res => {
      console.log(res)
      that.finish()
    }).catch(err => {
      console.log(err)
      wx.showToast({ title: err, icon: 'none' })
    }).then(() => {
      wx.hideLoading()
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
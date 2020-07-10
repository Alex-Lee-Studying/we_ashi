var app = getApp()
var hasClick = false
Page({
  data: {
    userId: null,
    user: {},
    genderarray: [
      { value: 0, name: '未知' }, { value: 1, name: '男' }, { value: 2, name: '女' }
    ],
    avatarImg: ''
  },

  onLoad() {
    console.log(app.globalData.user)
    if (app.globalData.user.id) {
      this.setData({ userId: app.globalData.user.id, user: app.globalData.user })

      // this.getUser()
    } else {
      wx.switchTab({
        url: '/pages/my/my'
      })
    }
  },

  bindGenderChange(e) {
    let dataset = e.currentTarget.dataset;
    let idx = e.detail.value;
    this.data[dataset.obj][dataset.item] = this.data.genderarray[idx].value;
    this.setData({
      user: this.data[dataset.obj]
    })
  },

  //input表单数据绑定
  inputInfo: function (e) {
    let dataset = e.currentTarget.dataset;
    let value = e.detail.value;
    this.data[dataset.obj][dataset.item] = value;
    this.setData({
      user: this.data[dataset.obj]
    })
  },

  getUser: function () {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/user/v1/users/' + this.data.userId,
      method: 'GET',
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          res.data.birthday = res.data.birthday ? app.globalData.moment.utc(res.data.birthday).format('YYYY-MM-DD') : ''
          self.setData({ user: res.data })
          app.globalData.user = res.data
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

  updateUser: function () {
    var self = this

    var params = {
      avatar: this.data.user.avatar,
      nick_name: this.data.user.nick_name,
      gender: this.data.user.gender,
      email: this.data.user.email,
      birthday: app.globalData.moment.utc(this.data.user.birthday).format(),
      story: this.data.user.story
    }
    console.log(params)

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/user/v1/users/' + this.data.userId,
      method: 'PUT',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
          wx.showToast({ title: '编辑成功！', success: function() {
            self.getUser()
          } })
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

  chooseImage(e) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      count: 1,
      success: res => {
        this.setData({ avatarImg: res.tempFilePaths[0] })
        this.updateAvatar()
      }
    })
  },

  handleImagePreview(e) {
    var imgurl = this.data.avatarImg || this.data.user.avatar
    wx.previewImage({
      current: imgurl,  //当前预览的图片
      urls: [imgurl],  //所有要预览的图片
    })
  },

  updateAvatar() {
    var self = this
    if (this.data.avatarImg === this.data.user.avatar) return

    wx.showLoading({
      title: '正在上传...',
      mask: true
    })

    wx.uploadFile({
      url: app.globalData.baseUrl + '/user/v1/users/' + this.data.userId + '/avatar',
      filePath: this.data.avatarImg,
      name: 'avatar',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization'), 'Content-Type': 'multipart/form-data' },
      success(res) {
        const data = JSON.parse(res.data)
        if (data.avatar) {
          wx.showToast({
            title: '头像上传成功！', 
            success: function () {
              self.avatarImg = ''
              self.getUser()
            } 
          })
        } else {
          wx.showToast({ title: '头像上传失败！', icon: 'none' })
        }
      },
      fail(err) {
        console.log(err)
        wx.showToast({ title: '头像上传失败！', icon: 'none' })
      }
    })
  }
})
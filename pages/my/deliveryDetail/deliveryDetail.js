var app = getApp()
var hasClick = false
Page({
  data: {
    user: {},
    deliveryId: null,
    delivery: {},
    showExpressForm: false,
    exnames: [], //快递公司列表
    exDetail: {},
    formdata: {
      expressName: {},
      expressNum: ''
    }
  },
  
  onLoad(option) {
    console.log(option)
    if (option.id) {
      this.setData({ deliveryId: option.id })
      this.getDelivery()
    } else {
      wx.switchTab({
        url: '/pages/my/my'
      })
    }
  },

  onShow: function () {
    if (app.globalData.user && app.globalData.user.id) {
      this.setData({ user: app.globalData.user })
    }
  },

  //input表单数据绑定
  inputInfo: function (e) {
    let dataset = e.currentTarget.dataset;
    let value = e.detail.value;
    this.data[dataset.obj][dataset.item] = value;
    this.setData({
      formdata: this.data[dataset.obj]
    })
  },

  bindPickerChange(e) {
    let dataset = e.currentTarget.dataset;
    let idx = e.detail.value;
    this.data[dataset.obj][dataset.item] = this.data.exnames[idx];
    this.setData({
      formdata: this.data[dataset.obj]
    })
  },

  getDelivery: function () {
    var self = this

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries/' + this.data.deliveryId,
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.departure = res.data.departure ? res.data.departure.replace('@', ',') : ''
          res.data.destination = res.data.destination ? res.data.destination.replace('@', ',') : ''
          self.setData({ delivery: res.data })
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

  // 确认收货
  finish: function() {
    var self = this

    wx.showModal({
      title: '',
      content: '您确定货已收到？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/transaction/v1/transaction-eol',
            method: 'POST',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            data: { delivery_id: self.data.deliveryId },
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '确认收货成功' })
                var delivery = self.data.delivery
                delivery.status = 'eol'
                self.setData({ delivery: delivery })
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

        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
    })
  },

  // 取消
  cancel: function () {
    var self = this

    wx.showModal({
      title: '',
      content: '您确定要取消此求带？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/app/v1/deliveries/' + self.data.deliveryId + '/cancelation',
            method: 'PUT',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '取消成功' })
                var delivery = self.data.delivery
                delivery.status = 'canceled'
                self.setData({ delivery: delivery })
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

        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
    })
  },

  toUpdateDeliver() {
    this.setData({
      showExpressForm: true
    })
  },

  closeExpressForm() {
    this.setData({
      showExpressForm: false
    })
  },

  updateDeliver() {
    var self = this

    // if (this.data.formdata.expressNum === '' || this.data.formdata.expressName.exname === '') {
    //   wx.showToast({ title: '请填写快递单号和快递公司', icon: 'none' })
    //   return
    // }
    if (!this.data.exDetail) {
      wx.showToast({ title: '快递详情为空', icon: 'none' })
      return
    }

          
          // var params = {
          //   code: self.data.formdata.expressNum,
          //   exname: self.data.formdata.expressName.exname
          // }
          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/app/v1/deliveries/' + self.data.deliveryId,
            method: 'PUT',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            data: { expresses: self.data.exDetail },
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
                res.data.departure = res.data.departure ? res.data.departure.replace('@', ',') : ''
                res.data.destination = res.data.destination ? res.data.destination.replace('@', ',') : ''
                var formD = {
                  expressName: {},
                  expressNum: ''
                }
                self.setData({ 
                  delivery: res.data,
                  formdata: formD
                })
                self.closeExpressForm()
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

  getExnames () {
    var self = this

    if (!this.data.formdata.expressNum.length) {
      wx.showToast({ title: '请填写快递单号', icon: 'none' })
      return
    }
    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/expresses-preview',
      method: 'GET',
      data: { code: this.data.formdata.expressNum },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.length) {
            var formD = self.data.formdata
            formD.expressName = res.data[0]
            self.setData({ 
              exnames: res.data,
              formdata: formD
            })
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

  getExDetail(code, exname) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.baseUrl + '/app/v1/expresses-detail',
        method: 'GET',
        data: { code: code, exname: exname },
        success: function (res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(res)
          }
        },
        fail: function (res) {
          reject(res)
        }
      })
    })
  },

  // getExDetail(code, exname) {
  //   var self = this

  //   if (hasClick) return
  //   hasClick = true
  //   wx.showLoading()

  //   wx.request({
  //     url: app.globalData.baseUrl + '/app/v1/expresses-detail',
  //     method: 'GET',
  //     data: { code: code, exname: exname },
  //     success: function (res) {
  //       if (res.statusCode >= 200 && res.statusCode < 300) {
  //         self.setData({
  //           exDetail: res.data
  //         })
  //       } else {
  //         console.log(res)
  //         wx.showToast({ title: res.data.msg, icon: 'none' })
  //       }
  //     },
  //     fail: function (res) {
  //       wx.showToast({ title: '系统错误', icon: 'none' })
  //     },
  //     complete: function (res) {
  //       wx.hideLoading()
  //       hasClick = false
  //     }
  //   })
  // },
  commitExpress() {
    var self = this
    if (this.data.formdata.expressNum === '' || this.data.formdata.expressName.exname === '') {
      wx.showToast({ title: '请填写快递单号和快递公司', icon: 'none' })
      return
    }
    wx.showModal({
      title: '',
      content: '您输入的信息是否无误？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          self.getExDetail(self.data.formdata.expressNum, self.data.formdata.expressName.exname).then(function (res) {
            console.log('返回的数据:', res)
            self.setData({
              exDetail: res
            })
            self.updateDeliver()
          }).catch(function (error) {
            console.log('sorry, 请求失败了, 这是失败信息:', error)
          })

        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
    })
  },

  onShareAppMessage(option) {
    return {
      title: '脚递求带',
      path: '/pages/my/deliveryDetail/deliveryDetail?id=' + this.data.deliveryId,
      imageUrl: (this.data.delivery.resources[0] && this.data.delivery.resources[0].name) || '/images/travel.png',
      success: (res) => {
        // 分享成功
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        })
      },
      fail: (res) => {
        // 分享失败
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    }
  }
})
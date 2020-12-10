var app = getApp()
var hasClick = false
Page({
  data: {
    user: {},
    deliveryId: null,
    delivery: {},
    payment: {},
    showExpressForm: false,
    exnames: [], //快递公司列表
    exDetail: {},
    formdata: {
      expressName: {},
      expressNum: ''
    },
    lefttime: '',
    statusObj: {
      normal: '正常',
      waiting_for_pay: '待支付',
      waiting_for_logistics: '支付成功', // 等待用户上传物流信息
      waiting_for_collect: '等待揽件', // 待揽收
      delivering: '订单派送', // 送货中
      eol: '已完成',
      canceled: '已取消'
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
    // 编辑快递单号时 清空快递公司
    if (dataset.item === 'expressNum') {
      this.data.formdata.expressName = {}
      this.setData({
        exnames: [],
        formdata: this.data.formdata
      })
    }
  },

  bindPickerChange(e) {
    let dataset = e.currentTarget.dataset;
    let idx = e.detail.value;
    this.data[dataset.obj][dataset.item] = this.data.exnames[idx];
    this.setData({
      formdata: this.data[dataset.obj]
    })
  },

  toggleExShow(e) {
    let dataset = e.currentTarget.dataset
    let code = dataset.code
    this.data.exDetail[code].ifShow = !this.data.exDetail[code].ifShow
    this.setData({
      exDetail: this.data.exDetail
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
          res.data.departure = res.data.departure.indexOf('@') === 0 ? res.data.departure.slice(1) : res.data.departure
          res.data.destination = res.data.destination.indexOf('@') === 0 ? res.data.destination.slice(1) : res.data.destination
          res.data.departure = res.data.departure ? res.data.departure.replace('@', ',') : ''
          res.data.destination = res.data.destination ? res.data.destination.replace('@', ',') : ''

          self.setData({ delivery: res.data })
          if (res.data.expresses && res.data.expresses.length) {
            self.getExDetails(res.data.expresses)            
          }
          if (res.data.status === 'waiting_for_pay') {
            self.getPayResult()
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
                if (delivery.expresses && delivery.expresses.length) {
                  self.getExDetails(delivery.expresses)
                }
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
                if (delivery.expresses && delivery.expresses.length) {
                  self.getExDetails(delivery.expresses)
                }
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

        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
    })
  },

  // 删除
  delDelivery () {
    var self = this

    wx.showModal({
      title: '',
      content: '您确定要删除此求带？',
      // confirmText: '主操作',
      // cancelText: '次要操作',
      success: function (res) {
        if (res.confirm) {

          if (hasClick) return
          hasClick = true
          wx.showLoading()

          wx.request({
            url: app.globalData.baseUrl + '/app/v1/deliveries-removal',
            method: 'PUT',
            header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
            data: [self.data.deliveryId],
            success: function (res) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                wx.showToast({ title: '删除成功' })

                wx.switchTab({
                  url: '/pages/my/my',
                  success: function (e) {
                    var page = getCurrentPages().pop()
                    if (page == undefined || page == null) return
                    page.setData({ tabname: 'delivery', currPageDelivery: 0, getDeliverysFlag: true, noMoreDeliverysFlag: false, deliveryList: [] })
                    page.onShow()
                  }
                })
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

    var params = {
      code: self.data.formdata.expressNum,
      name: self.data.formdata.expressName.name,
      exname: self.data.formdata.expressName.exname
    }
    var oldEx = this.data.delivery.expresses || []
    oldEx.push(params)

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/deliveries/' + self.data.deliveryId,
      method: 'PUT',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('ashibro_Authorization') },
      data: { expresses: oldEx },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.data.created = res.data.created ? app.globalData.moment.utc(res.data.created).format('YYYY-MM-DD') : ''
          res.data.departure = res.data.departure.indexOf('@') === 0 ? res.data.departure.slice(1) : res.data.departure
          res.data.destination = res.data.destination.indexOf('@') === 0 ? res.data.destination.slice(1) : res.data.destination
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
          if (res.data.expresses && res.data.expresses.length) {
            self.getExDetails(res.data.expresses)
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

  getExDetails(oldEx) {
    var self = this
    oldEx.map((item, idx, arr) => {
      self.getExDetail(item.code, item.exname).then(function (res) {
        self.data.exDetail[item.code] = res
        self.data.exDetail[item.code].ifShow = false
        self.setData({
          exDetail: self.data.exDetail
        })
      }).catch(function (error) {
        console.log('sorry, 请求失败了, 这是失败信息:', error)
      })
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
          self.updateDeliver()
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
  },

  getPayResult() {
    var self = this

    var params = {
      delivery_id: this.data.deliveryId
    }
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
          if (self.data.payment.expiry) {
            var expirySeconds = app.globalData.moment.utc(self.data.payment.expiry).valueOf()
            // var expirySeconds = app.globalData.moment.utc('2020-11-11T10:15:05Z').valueOf()
            var nowSeconds = app.globalData.moment().valueOf()
            if (expirySeconds > nowSeconds) {
              var diff = app.globalData.moment(expirySeconds).diff(app.globalData.moment(nowSeconds), 'seconds')
              console.log(diff)
              countdown(diff, self)
            }
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
      }
    })
  }
})

// 倒计时
function countdown(diff,that) {
  var dura = app.globalData.moment.duration(diff, 'seconds')
  var duraStr = `剩${dura._data.hours}时${dura._data.minutes}分${dura._data.seconds}秒自动关闭`
  // 渲染倒计时时钟
  that.setData({
    lefttime: duraStr
  })

  if (diff <= 0) {
    that.setData({
      lefttime: "支付超时"
    })
    // timeout则跳出递归
    return
  }
  // settimeout实现倒计时效果
  setTimeout(function () {
    diff -= 1
    countdown(diff, that)
  }, 1000)
}

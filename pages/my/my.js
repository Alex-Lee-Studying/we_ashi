var hasClick = false
var app = getApp()
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isLogin: false,
    tabname: 'delivery',
    travelList: [
      {
        "departure": "BJR@CN",
        "destination": "BJR@CN",
        "via": "BJR@CN",
        "traveler": "mike",
        "dt_departure": "2020-01-02T15:04:05Z",
        "flight_no": "CA1234",
        "details": "wefawef",
        "weight": 1,
        "unit_price": 1,
        "agent": true,
        "status": "normal",
        "id": "awefawef",
        "no": "2342342",
        "created": "2020-01-02T15:04:05Z",
        "user": {
          "first_name": "first_name",
          "last_name": "last_name",
          "nick_name": "nick_name",
          "gender": 0,
          "language": "en",
          "avatar": "http://url",
          "id": "23rlj23r",
          "mobile": "1238573847",
          "idc": "310227.....",
          "email": "awefwe@wef.com",
          "status": "normal",
          "token": "3l4ijl4ij34r",
          "token_expiry": "24h"
        }
      }
    ],
    deliveryList: [
      {
        "travel_id": "id",
        "item_type": "foo",
        "price": 1,
        "freight": 1,
        "reward": 1,
        "departure": "BJR@CN",
        "destination": "BJR@CN",
        "cover_index": 0,
        "details": "wefawef",
        "weight": 1,
        "status": "normal",
        "id": "awefawef",
        "created": "2020-01-02T15:04:05Z",
        "user": {
          "first_name": "first_name",
          "last_name": "last_name",
          "nick_name": "nick_name",
          "gender": 0,
          "language": "en",
          "avatar": "http://url",
          "id": "23rlj23r",
          "mobile": "1238573847",
          "idc": "310227.....",
          "email": "awefwe@wef.com",
          "status": "normal",
          "token": "3l4ijl4ij34r",
          "token_expiry": "24h"
        },
        "travel": {
          "departure": "BJR@CN",
          "destination": "BJR@CN",
          "via": "BJR@CN",
          "traveler": "mike",
          "dt_departure": "2020-01-02T15:04:05Z",
          "flight_no": "CA1234",
          "details": "wefawef",
          "weight": 1,
          "unit_price": 1,
          "agent": true,
          "status": "normal",
          "id": "awefawef",
          "no": "2342342",
          "created": "2020-01-02T15:04:05Z",
          "user": {
            "first_name": "first_name",
            "last_name": "last_name",
            "nick_name": "nick_name",
            "gender": 0,
            "language": "en",
            "avatar": "http://url",
            "id": "23rlj23r",
            "mobile": "1238573847",
            "idc": "310227.....",
            "email": "awefwe@wef.com",
            "status": "normal",
            "token": "3l4ijl4ij34r",
            "token_expiry": "24h"
          }
        },
        "resources": [
          {
            "name": "http://sefwef.com/waef.png",
            "mime": "image/png"
          }
        ]
      }
    ]
  },
  onShow() {
    if (app.globalData.user && app.globalData.user.id) {
      this.getTravels()
    }
    
    console.log('app.islogin: ' + app.globalData.isLogin)
    this.setData({ isLogin: app.globalData.isLogin })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getuserinfo(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  changeTab(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ tabname: tab })
  },
  getTravels() {
    var page = 0
    var pageSize = 20
    var params = {
      user_id: app.globalData.user.id,
      departure: '',
      destination: '',
      start_time: '',
      end_time: ''
    }

    if (hasClick) return
    hasClick = true
    wx.showLoading()

    wx.request({
      url: app.globalData.baseUrl + '/app/v1/travels',
      method: 'GET',
      header: { 'page': page, 'page-size': pageSize, 'Authorization': wx.getStorageInfoSync('ashibro_Authorization') },
      data: params,
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误' })
      },
      complete: function (res) {
        wx.hideLoading()
        hasClick = false
      }
    })
  }
})

// 引入SDK核心类
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'E7ZBZ-ABKHD-GG44A-HCY25-MHQZS-RBBQI' // 必填
})
var app = getApp()
var hasClick = false
Page({
  data: {
    curr: [],
    pageSize: 10,
    pageIndex: 1,
    getMoreFlag: true,
    searchList: [],
    latitude: '', // 纬度,
    longitude: '', // 经度
    searchStr: ''
  },
  onLoad: function (options) {
    var self = this
    wx.getSetting({
      success(res) {
        var result = res.authSetting
        if (result['scope.userLocation']) {
          wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success(res) {
              var loc = {
                latitude: res.latitude,
                longitude: res.longitude
              }
              self.setData({ 
                curr: loc,
                latitude: res.latitude,
                longitude: res.longitude
              })
            }
          })
        } else {
          wx.openSetting({
            success(res) { }
          })
        }

      }
    })
  },

  onShow: function () {

  },

  searchChange (e) {
    this.setData({ 
      searchStr: e.detail.value,
      pageIndex: 1,
      getMoreFlag: true,
      searchList: []
    })
    this.location_search()
  },

  // 事件触发，调用接口
  location_search: function () {
    if (!this.data.getMoreFlag) return
    if (hasClick) return
    hasClick = true

    var self = this
    // 调用接口
    qqmapsdk.search({
      keyword: self.data.searchStr,  //搜索关键词
      page_size: self.data.pageSize,
      page_index: self.data.pageIndex,
      success: function (res) { //搜索成功后的回调
        if (res.data.length < self.data.pageSize) {
          self.setData({ getMoreFlag: false })
        }
        var mks = self.data.searchList
        for (var i = 0; i < res.data.length; i++) {
          mks.push({ // 获取返回结果，放到mks数组中
            title: res.data[i].title,
            id: res.data[i].id,
            address: res.data[i].address,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng
          })
        }
        self.setData({
          searchList: mks,
          pageIndex: self.data.pageIndex + 1
        })
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
        hasClick = false
      }
    });
  },

  loadMore () {
    this.location_search()
  },

  toLocation (e) {
    console.log(e)
    var item = e.currentTarget.dataset.item
    this.setData({
      curr: [item],
      latitude: item.latitude,
      longitude: item.longitude
    })
  },

  cancel () {
    this.setData({
      searchStr: '',
      pageIndex: 1,
      getMoreFlag: true,
      searchList: []
    })
  },

  send () {
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]   //上一页
    // prevPage.setData({
    //   officalAddress: address
    // })

    const params = {
      type: 'location',
      longitude: this.data.longitude,             //经度
      latitude: this.data.latitude               //纬度
    }
    prevPage.addMessage(params)

    wx.navigateBack({
      delta: 1
    })
  }

})
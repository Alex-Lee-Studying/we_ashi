const app = getApp()
const QQMapWX = require('./lib/qqmap-wx-jssdk.min.js')
const QQMapKey = 'E7ZBZ-ABKHD-GG44A-HCY25-MHQZS-RBBQI'
const qqmapsdk = new QQMapWX({ key: QQMapKey })

Page({
  onLoad(options) {
    this.setData({
      cityType: options.cityType
    })

    if (app.globalData.cityList.length) {
      this.setData({ list: app.globalData.cityList })
    } else {
      this.getCitys()
    }
  },

  onChoose(e) {
    console.log('onChoose', e)
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]   //上一页
    var city = e.detail.item.name

    if (this.data.cityType == 'departure') {
      prevPage.setData({
        departure: city
      })
    }

    if (this.data.cityType == 'destination') {
      prevPage.setData({
        destination: city
      })
    }

    wx.navigateBack()
  },

  getCitys() {
    const _this = this
    qqmapsdk.getCityList({
      success(res) {
        const cities = res.result[1]
        // 按拼音排序
        cities.sort((c1, c2) => {
          let pinyin1 = c1.pinyin.join('')
          let pinyin2 = c2.pinyin.join('')
          return pinyin1.localeCompare(pinyin2)
        })
        // 添加首字母
        const map = new Map()
        for (const city of cities) {
          const alpha = city.pinyin[0].charAt(0).toUpperCase()
          if (!map.has(alpha)) map.set(alpha, [])
          map.get(alpha).push({ name: city.fullname })
        }

        const keys = []
        for (const key of map.keys()) {
          keys.push(key)
        }
        keys.sort()

        const list = []
        for (const key of keys) {
          list.push({
            alpha: key,
            subItems: map.get(key)
          })
        }

        _this.setData({ list })
        app.globalData.cityList = list 
      }
    })
  }
})

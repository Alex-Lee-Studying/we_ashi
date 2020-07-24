var expressList = [
  {
    country: '中国',
    img: '/images/china.png',
    sub: [
      {
        name: '顺丰速运',
        logo: '/images/sf.png',
        contact: '',
        website: 'www.sf-express.com',
        tel: '95338'
      },
      {
        name: '圆通速递',
        logo: '/images/yt.png',
        contact: '',
        website: 'www.yto.net.cn',
        tel: '95554'
      }
    ]
  },
  {
    country: '美国',
    img: '/images/usa.png',
    sub: [
      {
        name: 'UPS',
        logo: '/images/ups.png',
        contact: '',
        website: 'www.ups.com',
        tel: '400-820-8388'
      }
    ]
  },
  {
    country: '日本',
    img: '/images/china.png',
    sub: [
      {
        name: 'Japan Post',
        logo: '/images/ups.png',
        contact: '',
        website: 'www.post.japanpost.jp',
        tel: ''
      },
      {
        name: 'Yamato Transport',
        logo: '/images/ups.png',
        contact: '',
        website: 'www.kuronekoyamato.co.jp',
        tel: '0120-17-9625'
      }
    ]
  }
]

module.exports = {
  expresses: expressList
}
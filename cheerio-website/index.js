const axios = require('axios');
const cheerio = require('cheerio')
let request = require('request')
const fs = require('fs')

//  这个地方是一些旧网站的路由 涉及隐私使用其他.
const arr = ['www.baidu.com']

// fetch(url).then(v=>v.json).then(console.log)

const list = [];

let p = Promise.resolve();

arr.forEach(item => {
  p = p.then(() => {
    return axios(item).then((res) => {
      handle(res)
    })
  })
})

p = p.then(() => {
  fs.writeFile('./test.js', JSON.stringify(list), function () {

  })
})

function handle(res) {
  const $ = cheerio.load(res.data)
  // 获取一些文本的html 
  const title = $('title').text();
  const right = $('.standard.p').prop('outerHTML') + $('.goodsinfo_server_box').prop('outerHTML');
  const smallUrl = $('.goodsinfo_server_img img').prop('src').match(/[^\/]+\.jpg/)[0]
  const bigImageHTML = $('.detail-img-b22').html()
  const bigImageArr = bigImageHTML.match(/http[^"]+/g)

  const bigImgUrl = bigImageArr.map(item => {
    return item.match(/[^\/]+\.jpg/)[0]
  })

  //  下载图片
  bigImageArr.forEach((item, index) => {
    request({
      url: item
    }).pipe(
      fs.createWriteStream(bigImgUrl[index])
    )
  })


  //  替换一些不要的信息
  let left = $('.goodsinfo_store_info').html()
  left = left.replace(/<div class="goodsinfo_store_box[\s\S]+/gm, function (a, b) {
    return ''
  })

  //  
  list.push({
    title,
    left,
    right,
    smallUrl,
    bigImgUrl
  })

}
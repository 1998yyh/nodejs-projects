const fs = require('fs')
const path = require('path')
const {
  promisify
} = require('util')
const Packer = require('./packer')
const sizeOf = promisify(require('image-size'))
const sharp = require('sharp')

const MySpritePackTool = function (opt) {
  this.options = {
    // 一个文件夹图片过多或者过长， 递归最大次数
    maxCount: opt.maxCount || 2,
    assetsPath: opt.assetsPath,
    outPutPath: opt.outPutPath,
    maxSize: {
      width: 2048,
      height: 2048
    }
  }
}

MySpritePackTool.prototype.finAllFiles = function (obj, rootPath, promises = []) {
  let nodeFiles = [];
  // 路径存在
  if (fs.existsSync(rootPath)) {
    nodeFiles = fs.readdirSync(rootPath)

    let nameArr = rootPath.split('/')
    obj['assets'] = [];
    obj['name'] = nameArr[nameArr.length - 1]
    obj['keys'] = '';

    nodeFiles.forEach(async (item) => {
      if (!/(.png)|(.jpe?g)|(.webp)$/.test(item)) {
        let newPath = path.join(rootPath, item);
        // 如果 <fs.Stats> 对象描述文件系统目录，则返回 true。
        // 如果 <fs.Stats> 对象是从 fs.lstat() 获得的，则此方法将始终返回 false。 这是因为 fs.lstat() 返回有关符号链接本身的信息，而不是它解析到的路径。
        if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
          obj[item] = {};
          this.finAllFiles(obj[item], newPath, promises);
        } else {
          console.log(`文件路径 ${newPath}不存在`)
        }
      } else {
        const promise = new Promise((resolve, reject) => {
          obj['keys'] += 'item' + ',';
          let params = {};
          const _curPath = path.resolve(rootPath, `./${item}`);
          params['id'] = _curPath
          sizeOf(_curPath).then((img) => {
            params['width'] = img.width;
            params['height'] = img.height;
            obj['assets'].push(params)
            resolve();
          })
        })
        promises.push(promise)
      }
    })
  }
  return Promise.all(promises)
}

MySpritePackTool.prototype.dealImgsPacking = function (obj) {
  let count = 0;
  if (obj.hasOwnProperty('assets')) {
    let newBlocks = obj["assets"];
    obj['assets'] = [];

    while (newBlocks.length > 0 && count < this.options.maxCount) {
      let packer1 = new Packer(this.options.maxSize.width, this.options.maxSize.height);
      packer1.fit(newBlocks)
      let sheets1 = {
        maxArea: packer1.usedArea,
        atlas: newBlocks,
        fileName: `${obj['name']+(count ? '-' + count : '')}`
      }

      newBlocks = packer1.levelBlocks;
      obj["assets"].push(sheets1);
      count++;
    }
  }
  for (let item in obj) {
    if (obj[item].hasOwnProperty("assets")) {
      this.dealImgsPacking(obj[item]);
    }
  }
}

MySpritePackTool.prototype.drawImages = function (obj) {
  let count = 0;
  if (obj.hasOwnProperty("assets")) {
    //打包出一个或者多个图集
    let imgsInfo = obj["assets"];
    imgsInfo.forEach(item => {
      if (item.hasOwnProperty("atlas")) {
        let imgObj = item["atlas"];
        console.log("8888",imgObj)
        //绘制一张透明图像
        // let newSprites = images(item["maxArea"].width, item["maxArea"].height);
        // imgObj.forEach(it => {
        //   newSprites.draw(images(it["id"]), it["x"], it["y"]);
        // });
        const compositeList = imgObj.map(it=>({input:it.id,top:it.y,left:it.x}))
        sharp({
          create:{
            width:item["maxArea"].width, 
            height:item["maxArea"].height,
            channels:4,
            background:{ r: 255, g: 0, b: 0, alpha: 0 }
          }
        })
        .composite(compositeList)
        .png()
        .toFile(`${this.options.outPutPath}/${item['fileName']}.png`)

        count++;
      }
    })
  }

  for (let item in obj) {
    if (obj[item].hasOwnProperty("assets")) {
      this.drawImages(obj[item]);
    }
  }
}

// const options = {
//   assetsPath: './assets/index',
//   outPutPath: '.'
// }

// let obj = {}
// const demo = new MySpritePackTool(options)
// demo.finAllFiles(obj, './assets').then(() => {
//   demo.dealImgsPacking(obj)
//   demo.drawImages(obj)
// })




module.exports = MySpritePackTool;
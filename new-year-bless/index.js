const readline = require('readline');
// 改颜色的
const chalk = require('chalk');
const fs = require('fs')
// 将png图像 打印到控制台
const consolePng = require('console-png')
// 艺术字
const CFonts = require('cfonts')

// 是否支持TTY类型
console.log(process.stdout.isTTY)

consolePng.attachTo(console)

// 随机位置
function randomPos() {
  const x = Math.floor(30 * Math.random());
  const y = Math.floor(10 * Math.random());
  return [x, y];
}

//  随机样式
function randomStyle(text) {
  const styles = ['redBright', 'yellowBright', 'blueBright', 'cyanBright', 'greenBright', 'magentaBright', 'whiteBright'];
  const color = styles[Math.floor(Math.random() * styles.length)];
  return chalk[color](text);
}
// 输出流
const outStream = process.stdout;
// 输入流
const rl = readline.createInterface({
  input: process.stdin,
  output: outStream
});
// 光标移动 并 清空控制台
readline.cursorTo(outStream, 0, 0);
readline.clearScreenDown(outStream);

// 获取图片信息
const image = fs.readFileSync(__dirname + '/index.png')
const textArr = ['2021', '感谢', '大家的', '支持', '2022', '我们', '一起', '加油！'];

(async function () {
  for (let i = 0; i < textArr.length; i++) {
    readline.cursorTo(outStream, ...randomPos());
    rl.write(randomStyle(textArr[i]));
    await delay(1000);
    readline.cursorTo(outStream, 0, 0);
    readline.clearScreenDown(outStream);
  }

  // console.png(image)
  const prettyFont = CFonts.render('|HAPPY|NEW YEAR', {
    font: 'block',
    colors: ['blue', 'yellow']
  });

  let startX = 60;
  let startY = 0;
  prettyFont.array.forEach((line, index) => {
    readline.cursorTo(outStream, startX + index, startY + index);
    rl.write(line);
  });

  readline.cursorTo(outStream, 120, 25);
  rl.write(chalk.yellowBright('跟着光哥走···'));
})();

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
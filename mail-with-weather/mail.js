const superagent = require("superagent")
const cheerio = require("cheerio")
const ejs = require("ejs")
const fs = require("fs")
const path = require("path"); //路径配置
const nodemailer = require("nodemailer")
const schedule = require("node-schedule"); //定时器任务库

let startDay = "2018/12/24";
let EmianService = "163"
let EamilAuth = {
    user:"*********@163.com",
    pass:"***********"
}

let EmailFrom ='"猪" <**********@163.com>'
let EmailTo = "********@qq.com"

let EmailSubject = ""

let EmailHour = 14,EmailMinminute = 53;



let local = "shanxi/taiyuan" //收件人位置

const OneUrl = "http://wufazhuce.com/";
const WeatherUrl = "https://tianqi.moji.com/weather/china/" + local;

function getOneData(){
    return new Promise((resolve,reject)=>{
        superagent.get(OneUrl).end((err,res)=>{
            if(err){
                reject(err)
            }else{
                let $ = cheerio.load(res.text);
                let selectItem = $("#carousel-one .carousel-inner .item");
                console.log(selectItem)
                let todayOne = selectItem[0];
                let todayOneData = {
                imgUrl: $(todayOne)
                    .find(".fp-one-imagen")
                    .attr("src"),
                type: $(todayOne)
                    .find(".fp-one-imagen-footer")
                    .text()
                    .replace(/(^\s*)|(\s*$)/g, ""),
                text: $(todayOne)
                    .find(".fp-one-cita")
                    .text()
                    .replace(/(^\s*)|(\s*$)/g, "")
                };
                resolve(todayOneData)
            }
        })
    })
}

function getWeatherTips(){
    return new Promise((resolve,reject)=>{
        superagent.get(WeatherUrl).end((err,res)=>{
            if(err){
                reject(err)
            }else{
                let $ = cheerio.load(res.text)
                let tip = $(".wea_tips em").text().replace(/(^\s)|($\s)/,"")
                resolve(tip)
            }
        })
    })
}

function getWeatherData(){
    return new Promise((resolve,reject)=>{
        superagent.get(WeatherUrl).end((err,res)=>{
            if(err){
                reject(err)
            }else{
                let threeDaysData = [];
                let weatherTip = "";
                let $ = cheerio.load(res.text);
                $(".forecast .days").each(function(i, elem) {
                const SingleDay = $(elem).find("li");
                threeDaysData.push({
                    Day: $(SingleDay[0])
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    WeatherImgUrl: $(SingleDay[1])
                        .find("img")
                        .attr("src"),
                    WeatherText: $(SingleDay[1])
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    Temperature: $(SingleDay[2])
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    WindDirection: $(SingleDay[3])
                        .find("em")
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    WindLevel: $(SingleDay[3])
                        .find("b")
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    Pollution: $(SingleDay[4])
                        .text()
                        .replace(/(^\s*)|(\s*$)/g, ""),
                    PollutionLevel: $(SingleDay[4])
                        .find("strong")
                        .attr("class")
                    });
                });
                resolve(threeDaysData)
            }
        })
    })
}

function sendMail(HtmlData) {
    const template = ejs.compile(
      fs.readFileSync(path.resolve(__dirname, "email.ejs"), "utf8")
    );
    const html = template(HtmlData);
  
    let transporter = nodemailer.createTransport({
      service: EmianService,
      port: 465,
      secureConnection: true,
      auth: EamilAuth
    });
  
    let mailOptions = {
      from: EmailFrom,
      to: EmailTo,
      subject: EmailSubject,
      html: html
    };
    transporter.sendMail(mailOptions, (error, info={}) => {
      if (error) {
        console.log(error);
        sendMail(HtmlData); //再次发送
      }
      console.log("邮件发送成功", info.messageId);
      console.log("静等下一次发送");
    });
  }

function getAllDataAndSendMail(){
    let HtmlData = {};
    // how long with
    let today = new Date();
    console.log(today)
    let initDay = new Date(startDay);
    let lastDay = Math.floor((today - initDay) / 1000 / 60 / 60 / 24);
    let todaystr =
      today.getFullYear() +
      " / " +
      (today.getMonth() + 1) +
      " / " +
      today.getDate();
    HtmlData["lastDay"] = lastDay;
    HtmlData["todaystr"] = todaystr;

    Promise.all([getOneData(),getWeatherTips(),getWeatherData()]).then(
        function(data){
            HtmlData["todayOneData"] = data[0];
            HtmlData["weatherTip"] = data[1];
            HtmlData["threeDaysData"] = data[2];
            sendMail(HtmlData)
        }
    ).catch(function(err){
        getAllDataAndSendMail() //再次获取
        console.log('获取数据失败： ',err);
    })
}

let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = EmailHour;
rule.minute = EmailMinminute;
console.log('NodeMail: 开始等待目标时刻...')
let j = schedule.scheduleJob(rule, function() {
  console.log("执行任务");
  getAllDataAndSendMail();
});
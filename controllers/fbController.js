var express = require('express')
var app = express();
var bcrypt = require('bcryptjs');

const request = require("request");
let Product = require('../models/product');
const puppeteer = require('puppeteer');

var Mess = require('../models/mess');
var User = require('../models/user');
var Sale = require('../models/sale');

// const PAGE_ACCESS_TOKEN = 'EAAHh0ZCcqftcBAML83HJONXMoWGSHsRbia7ls8fqDmKv4TqA0nGCs2YgSyk9uNgrl7g4yyNGOklrLhJI0zjcK5eaDGFChvVZBd1PoSqkGcxCdgT2lIfC7KD9giVEMDQaTz8t0wZBum5hAQJrqxcu4UHy4RMDkjZAONiiBtUbqwZDZD';

//Handler LoopMessage
// B1 : check mail = true -> save temp pass and request pass 
// B2 : hash pass anh check with temp pass , check isadmin
// B3 : if pass = true -> login success -> reset loop = 0


function handleLoopMessage(sender_psid, received_message) {
  let response;
  Mess.findOne({
    id: sender_psid
  }, function (err, id) {
    if (id) {
      switch (id.loop) {
        case 1: // 
          User.findOne({
            email: received_message.text
          }, function (err, user) {
            if (user) {
              response = {
                "text": "Vui lòng nhập mật khẩu"
              }
              callSendAPI(sender_psid, response);
              id.loop += 1;
              id.temppass = user.password;
              if (user.role == 'admin') id.admin = 1;
              id.save(function (err) {
                if (err)
                  return console.log(err);
              });
            } else {
              response = {
                "text": "Tên đăng nhập không đúng vui lòng nhập lại"
              }
              callSendAPI(sender_psid, response);
            }
          })
          return;

        case 2:
          bcrypt.compare(received_message.text, id.temppass, function (err, isMatch) {
            if (err)
              console.log(err);

            if (isMatch) {
              if (id.admin) {
                response = {
                  "text": "Bạn đã đăng nhập thành công"
                }
                callSendAPI(sender_psid, response);
                id.loop = 0;
                id.save(function (err) {
                  if (err)
                    return console.log(err);
                });
              } else {
                response = {
                  "text": "Vui lòng đăng nhập với tài khoản admin"
                }
                callSendAPI(sender_psid, response);
                id.loop = 0;
                id.save(function (err) {
                  if (err)
                    return console.log(err);
                });
              }

            } else {
              response = {
                "text": "Vui lòng nhập lại password"
              }
              callSendAPI(sender_psid, response);
            }
          });

          return;

        default:
          response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": "Nhấn button to login !",
                "buttons": [{
                  "type": "postback",
                  "title": "Loop mess ",
                  "payload": "login"
                }]
              }
            }
          }
          callSendAPI(sender_psid, response);
          return;
      }
    }
  })

}


/**
 * This function to handle message for event
 * @param {*} sender_psid 
 * @param {*} received_message 
 */
function handleMessage(sender_psid, received_message) {
  let response;

  switch (received_message.text.toLowerCase()) {
    case 'biểu đồ năm nay':
      sendChart('year', sender_psid);
      return;
    case 'biểu đồ hôm nay':
      sendChart('day', sender_psid);
      return;

    case 'logout':
      Mess.findOneAndRemove({
        id: sender_psid
      }, function (err) {
        if (err)
          return console.log(err);
        callSendAPI(sender_psid, {
          "text": "đã logout"
        });
      });
      return;
    case 'login':
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "button",
            "text": "Vui lòng nhấn button để đăng nhập!",
            "buttons": [{
              "type": "postback",
              "title": "login đi",
              "payload": "login"
            }]
          }
        }
      }
      callSendAPI(sender_psid, response);
      return;
    default:
  }
}

// Start event login 

function handleLogin(sender_psid) {
  response = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Vui lòng nhấn button để đăng nhập",
        "buttons": [{
          "type": "postback",
          "title": "login đi",
          "payload": "login"
        }]
      }
    }
  }
  callSendAPI(sender_psid, response);
  return;
}

/**
 * This is function to recive handle postback from facebook     
 * @param {id user } sender_psid 
 * @param {...} received_postback 
 */
function handlePostback(sender_psid, received_postback) {

  //do something
  let response
  let payload = received_postback.payload
  if (payload === 'login') {
    response = {
      'text': 'Vui lòng nhập email'
    }
    callSendAPI(sender_psid, response);
    Mess.findOne({
      id: sender_psid
    }, function (err, id) {
      if (id) {
        id.loop += 1;
        id.save(function (err) {
          if (err)
            return console.log(err);
        });
      }
    })
    return;
  } else if (payload === 'no') {
    // response = {
    //   'text': ' ...'
    // }
  }
}

/**
 * This is function to Send text message
 * @param {id user for recive mess} sender_psid 
 * @param {object message include text } response 
 */

async function callSendAPI(sender_psid, response = {
  'text': 'day la tin nhan mac dinh'
}) {

  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {
      "access_token": process.env.FACEBOOK_TOKEN
    },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    console.log('err', err)
    if (!err) {
      console.log('Mess đã được gửi!')
    } else {
      console.error("Không thể gửi mess:" + err);
    }
  });
}


/**
 * This async function to render the template for day or year (2019)
 */

async function getTemplateForDay() {
  let date = new Date()
  let day = date.getDate();
  let month = date.getMonth();
  let arr = [];
  let arr2 = [];
  for (let i = 8; i <= 18; i++) {
    let sum1 = 0,
      sum2 = 0;
    await Sale.find(function (err, sale) {
      sale.forEach((v, j) => {
        if (v.date.getMonth() == month) {

          if (v.date.getDate() == day && v.date.getHours() == i) sum1 += v.total;

          // not check day = 1 return day = 31 || 30 prev month
          if (v.date.getDate() == day - 1 && v.date.getHours() == i) sum2 += v.total;
        }
      })

    })
    arr.push(sum1);
    arr2.push(sum2);
  }

  return `<html>
          <head>
              <title></title>
              <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.min.js"></script>
          </head>
          <body style="max-width: 850px; margin: auto;">
                <div>
                        <canvas id="myChart" width="600" height="400"></canvas>
                </div>
               
            </body>
          <script>
              new Chart(document.getElementById("myChart"), {
                type: 'line',
                data: {
                    label: 'biểu đồ theo ngày',
                    labels: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
                    datasets: [{
                        data: [${arr}],
                        label: "Ngày hôm nay",
                        borderColor: "#3e95cd",
                        fill: false
                    }, {
                        data: [${arr2}],
                        label: "Ngày hôm qua",
                        borderColor: "#8e5ea2",
                        fill: false
                    }]
                }
            });
            </script>
          </html>`;
}

async function getTemplateForYear() {
  let arr = [];
  for (let i = 0; i < 12; i++) {
    let sum = 0;
    await Sale.find(function (err, sale) {
      sale.forEach((v, j) => {
        if (v.date.getFullYear() == 2019 && v.date.getMonth() == i) {
          sum += v.total;
        }
      })

    })
    arr.push(sum);
  }

  return `<html>
          <head>
              <title></title>
              <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.min.js"></script>
          </head>
          <body style="max-width: 850px; margin: auto;">
                <div><canvas id="myChart" width="600" height="400"></canvas></div>
          </body>
          <script>
            var ctx = document.getElementById('myChart').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                    datasets: [{
                        label: 'biểu đồ theo năm',
                        data: [${arr}],
                        borderWidth: 1,
                        backgroundColor: [
                          '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
                          '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
                          '#008080', '#e6beff'
                      ],
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
            </script>
          </html>`;
}


/**
 * 
 * @param {key for select year or day} chart 
 * @param {id user for send} sender_psid 
 */

async function sendChart(chart, sender_psid) {

  let response, htmlString;

  if (chart == "year") {
    htmlString = await getTemplateForYear();
  } else htmlString = await getTemplateForDay();

  // create img with puppeteer library and send chart 

  (async () => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    await page.setContent(htmlString)
    await page.screenshot({
      path: 'public/images/' + chart + '.png'
    })
    await browser.close()

    response = {
      "attachment": {
        "type": "image",
        "payload": {
          "url": "https://c465f9cd.ngrok.io/images/" + chart + ".png",
          "is_reusable": true
        }
      }
    }

    callSendAPI(sender_psid, response);
    // console.log('ben trong')
    return;
  })()
}

/**
 * Exports module
 */

module.exports = {
  handleMessage: handleMessage,
  handleLoopMessage: handleLoopMessage,
  handlePostback: handlePostback,
  sendChart: sendChart,
  callSendAPI: callSendAPI,
  handleLogin: handleLogin
}

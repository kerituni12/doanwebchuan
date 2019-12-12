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
              if(user.role == 'admin') id.admin = 1; 
              id.save(function (err) {
                if (err)
                  return console.log(err);
              });
            }else {
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
                if(id.admin){
                  response = {
                    "text": "Bạn đã đăng nhập thành công"
                    }
                    callSendAPI(sender_psid, response);
                    id.loop  = 0; 
                    id.save(function (err) {
                      if (err)
                        return console.log(err);
                    });       
                }else {
                  response = {
                    "text": "Vui lòng đăng nhập với tài khoản admin"
                    }
                    callSendAPI(sender_psid, response);
                    id.loop  = 0; 
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

//  send chart to mess 


function handleMessage(sender_psid, received_message) {
  let response;
  
  switch (received_message.text.toLowerCase()) {
    case 'biểu đồ':
        sendChart('chart', sender_psid);
        return;

    // Chart for month 

    // case 't1':
    //   sendChart('chart1', sender_psid);
    //   return;
    // case 't2':
    //   sendChart('chart2', sender_psid);
    //   return;
    // case 't3':
    //   sendChart('chart3', sender_psid);
    //   return;
    // case 't4':
    //   sendChart('chart4', sender_psid);
    //   return;
    // case 't5':
    //   sendChart('chart5', sender_psid);
    //   return;
    // case 't6':
    //   sendChart('chart6', sender_psid);
    //   return;
    // case 't7':
    //   sendChart('chart7', sender_psid);
    //   return;
    // case 't8':
    //   sendChart('chart8', sender_psid);
    //   return;
    // case 't9':
    //   sendChart('chart9', sender_psid);
    //   return;
    // case 't10':
    //   sendChart('chart10', sender_psid);
    //   return;
    // case 't11':
    //   sendChart('chart11', sender_psid);
    //   return;
    // case 't12':
    //   sendChart('chart12', sender_psid);
    //   return;
    case 'logout':     
      Mess.findOneAndRemove({id:sender_psid}, function (err) {
          if (err)
              return console.log(err);
              callSendAPI(sender_psid, {"text": "đã logout"});
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

function handleLogin (sender_psid){
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

//Handler Postback
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

// Messenger Send API

async function callSendAPI(sender_psid, response = {'text': 'day la tin nhan mac dinh'}) {

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


// Send img chart

async function sendChart(chart, sender_psid) {
  
  let response;
  let arr = [];    
        for (let i = 0; i < 12; i ++) {
            let sum = 0;
            await Sale.find(function(err, sale) {   
                sale.forEach((v, j) => {                   
                    if(v.date.getFullYear() == 2019 && v.date.getMonth() == i) {
                        sum += v.total;
                        }
                })             
                
            })            
            arr.push(sum);
        }

  const htmlString =  `<html>
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
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
            datasets: [{
                label: '${chart}',
                data: [${arr}],
                borderWidth: 1
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

  // console.log('html', htmlString);

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
          "url": "https://9448e64d.ngrok.io/images/" + chart + ".png",
          "is_reusable": true
        }
      }
    }

    callSendAPI(sender_psid, response);
    // console.log('ben trong')
    return;
  })()
}


module.exports = {
  handleMessage: handleMessage,
  handleLoopMessage: handleLoopMessage,
  handlePostback: handlePostback,
  sendChart: sendChart,
  callSendAPI: callSendAPI,
  handleLogin: handleLogin
}

// await Product.findOne({slug: received_message.text}, function (err, product) {
//   if (err) {
//       console.log(err);
//   } else {
//      response = {
//        "text": `your product ${product.title}`
//      }
//      console.log('da gan res');
//   }
//   console.log(product.title);
// });
// console.log(response);
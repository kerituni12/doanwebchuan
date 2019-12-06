var express = require('express')
var app = express();
var bcrypt = require('bcryptjs');

const request = require("request");
let Product = require('../models/product');
const puppeteer = require('puppeteer');

var Mess = require('../models/mess');
var User = require('../models/user');

const PAGE_ACCESS_TOKEN = 'EAAHh0ZCcqftcBAO2hiY5CsZCX0Ep55XnwUV2pXBjuK7iY5r7Gwzj0AEjAAtFbkRWV6O6NlwBcbit7E91OEZB3v5zME2A1qLMtTfl7isYftC2n930YRvTbBABdmnWMf1A0rmOZByOiCmBZCOkEfZBtgcsQPlMUPAPZCbSG9nNZCFeg9CpPlapnGSH';
//Handler Message
function handleLoopMessage(sender_psid, received_message) {
  let response;
  Mess.findOne({
    id: sender_psid
  }, function (err, id) {
    if (id) {
      switch (id.loop) {
        case 1:
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
                "text": "ten dang nhap khong dung, vui long nhap lai"
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
                  "text": "mat khau khong  dung"
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
                "text": "Try the postback button!",
                "buttons": [{
                  "type": "postback",
                  "title": "dang trong loop mess",
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

function handleMessage(sender_psid, received_message) {
  let response;
  
  switch (received_message.text) {
    case 't1':
      sendChart('chart1', sender_psid);
      return;
    case 't2':
      sendChart('chart2', sender_psid);
      return;
    case 't3':
      sendChart('chart3', sender_psid);
      return;
    case 't4':
      sendChart('chart4', sender_psid);
      return;
    case 't5':
      sendChart('chart5', sender_psid);
      return;
    case 't6':
      sendChart('chart6', sender_psid);
      return;
    case 't7':
      sendChart('chart7', sender_psid);
      return;
    case 't8':
      sendChart('chart8', sender_psid);
      return;
    case 't9':
      sendChart('chart9', sender_psid);
      return;
    case 't10':
      sendChart('chart10', sender_psid);
      return;
    case 't11':
      sendChart('chart11', sender_psid);
      return;
    case 't12':
      sendChart('chart12', sender_psid);
      return;
    case 'login':
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "button",
            "text": "Try the postback button!",
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

function handleLogin (sender_psid){
  response = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Try the postback button!",
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
    response = {
      'text': 'Oops, try sending another image.'
    }
  }
}

// Messenger Send API
function callSendAPI(sender_psid, response = 'aaa') {

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
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}


// Send img chart
function sendChart(chart, sender_psid) {
  let response;
  const htmlString = `<html>
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
                data: [12, 19, 3, 5, 2, 3],
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
          "url": "https://91602fd1.ngrok.io/images/" + chart + ".png",
          "is_reusable": true
        }
      }
    }

    callSendAPI(sender_psid, response);
    console.log('ben trong')
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
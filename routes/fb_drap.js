const express = require('express')

const router = express.Router()
const request = require('request')

var Mess = require('../models/mess');

 
function callSendAPI (sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
//   console.log(response, '<<<<<<<<<<<<<<<<<<<response')
  console.log(request_body, '<<<<<<< req_body')
  request({
    // 'qs': 'EAAJN50qr7CYBABLUgugbgpXb8cYPjkZAjF1arcWDbjJF8QEmGOOyQvGJUyfPrKGBfHVPUKBZC3UyzpDGtaZBXKhtpcDUFdNZCigZBq6N3XYXIiAs5PdKdZAWBmy5WF5eZCMavpPmDGRT9CxfN7DLtwFTAAnxngDJ7wkD6Iy35ZBHVAZDZD',
    // 'qs': {'access_token': process.env.PAGE_ACCESS_TOKEN},
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {"access_token": 'EAAF7fszPymMBABVirV8XKpg0hNDrvPoy2P70fYj8a1TSnWotYFWtN1AFZBSUgyLgEB4ZALZAAdZAridtZABsj13KitSmEtuXZAQFhqDE3H6OKw4RqOFtdkIMecNRLEEkMUfleaZBDV6VbQZBd3ZCjFoZBmhjwZB3YR0aqdm4Ja0f8sZAY1URunUgPnIp'},
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent')
    } else {
      console.error('unable to send message' + err)
    }
  })
}



router.post('/webhook', (req, res) => {
  let body = req.body
  if (body.object === 'page') {
    body.entry.forEach(function (entry) {
      let webhook_event = entry.messaging[0]

      console.log(webhook_event)

      let sender_psid = webhook_event.sender.id
        console.log('number : ',req.app.locals.sessionchat);

        
      if (webhook_event.message) {
        cate
        if(req.app.locals.sessionchat == null) {
            response = {
                "attachment":{
                  "type":"template",
                  "payload":{
                    "template_type":"button",
                    "text":"Try the postback button!",
                    "buttons":[
                      {
                        "type":"postback",   
                        "title":"login đi",             
                        "payload":"login"
                      }
                    ]
                  }
                }
              }
                    
            callSendAPI(sender_psid, response); 
        }else {

            Mess.findOne({id: sender_psid}, function(err, id){
                if(err){}
                switch(id.loop){
                    case 1:
                         response = {
                            "text": "day la session 2"
                         }  
                         callSendAPI(sender_psid, response);  
                         id.loop +=1;
                         return;
                    case 2:
                        response = {
                            "text": "day la session 3"
                        }  
                        callSendAPI(sender_psid, response);  
                        id.loop = null ;
                        return;
                    case 3:
                      response = {
                          "text": "rết"
                      }  
                      callSendAPI(sender_psid, response);  
                      id.loop = null;
                      return;
                    default: 
                        response = {
                            "attachment":{
                                "type":"template",
                                "payload":{
                                "template_type":"button",
                                "text":"Try the postback button!",
                                "buttons":[
                                    {
                                    "type":"postback",   
                                    "title":"login đi",             
                                    "payload":"login"
                                    }
                                ]
                                }
                            }
                        }
                        callSendAPI(sender_psid, response);  
                        return;
                }      
            })
            Mess.save(function (err) {
                if (err)
                    return console.log(err);   
            }); 
        }
      } else if (webhook_event.postback) {
            let response
            let payload = webhook_event.postback.payload
            if (payload === 'login') {

                Mess.findOne({id: sender_psid}, function(err, id){
                    if(id){}
                    else{
                        var Mess = new Mess({
                            id: sender_psid,
                            loop: 1
                        });
                        Mess.save(function (err) {
                            if (err)
                                return console.log(err);   
                        });
                    }
                })
            response = { 'text': 'session 1!' }
            callSendAPI(sender_psid, response);            
            return;
            } else if (payload === 'no') {
            response = { 'text': 'Oops, try sending another image.' }
            }
      }
    })
    res.status(200).send('Event received')
  } else {
    res.sendStatus(404)
  }
})



router.get('/webhook', (req, res) => {
//   let VERIFY_TOKEN = process.env.VERIFY_TOKEN
  let VERIFY_TOKEN = 'test'
  let mode = req.query['hub.mode']
  let token = req.query['hub.verify_token']
  let challenge = req.query['hub.challenge']
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified')
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
  } else {
    res.sendStatus(404)
  }
})


module.exports = router;
var express = require('express')
var app = express();
const request = require("request");

function handleMessage(type, sender_psid, mess) {
  
    switch (type) {
        case 'facebook':             
            facebook(sender_psid, mess);
            return;
        case 'telegram':
            telegram(sender_psid, mess);
            return;
        case 'gmail': 
            return; 
        default:
            return;
    }
}

function facebook(sender_psid, mess) {

    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": mess
    }

    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": {
        "access_token": process.env.FACEBOOK_TOKEN
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

function telegram(sender_psid, mess) {
    let request_body = {
        "chat_id": sender_psid,
        "text": mess
      }
    
      // Send the HTTP request to the Messenger Platform
      request({
        "uri": `https://api.telegram.org/bot999322685:AAEdwW77vn6kQ9M3XHzAcAB_GVoA8aW_zeM/sendMessage`,        
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

module.exports = {
    handleMessage = handleMessage
}
var request = require("request");
var rp = require('request-promise');


async function telegram(sender_psid, mess) {
  let request_body = {
      "chat_id": sender_psid,
      "text": 'a'
    }
 
    let results = await rp({
      "uri": `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,        
      "method": "POST",
      "json": request_body
    }).then(data => console.log(data)).catch(err => console.log(err.message));

    return results;
}

telegram("3020488171325993",{"text": "a"}).then(mess => console.log(mess));

// async function facebook(sender_psid, mess) {
//   var results = {};

//   let request_body = {
//     "recipient": {
//       "id": sender_psid
//     },
//     "message": {"text": "a"}
//   }
  
//   results = await rp({
//     "uri": "https://graph.facebook.com/v2.6/me/messages",
//     "qs": {
//       "access_token": process.env.FACEBOOK_TOKEN
//     },
//     "method": "POST",
//     "json": request_body
//   }).then(function(data){return {status: 'ok', mess: results}}).catch(function (err) {
//      let mess = err.error.error.message;
//     return {status: 'notok', mess: mess};
// });
//   // console.log(results);
//   return results;
// }

//   facebook("3020488171325993",{"text": "a"}).then(mess => console.log(mess));



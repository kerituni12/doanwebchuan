const fbController = require('../controllers/fbController');

const VERIFY_TOKEN = 'test';

var Mess = require('../models/mess');
/* 
 * Webhook Verification GET
 */
function handleVerifyServer(req, res) {
 
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      res.status(200).send(challenge);
    } else {  

      res.sendStatus(403);
    }
  }
}

/*
 * Webhook POST handler 
 */
function handleWebhookEvent(req, res) {
  let body = req.body;

  if (body.object === 'page') {
    
    body.entry.forEach(function (entry) {

      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      Mess.findOne({id: sender_psid}, function(err, id){
        if (id) {          
          if (webhook_event.message) {
            if(id.loop == 0)  {
              if(id.admin == 1)           
                fbController.handleMessage(sender_psid, webhook_event.message);                
                else if(webhook_event.message.text == 'login')  fbController.handleLogin(sender_psid);  
            }                              
            else 
            fbController.handleLoopMessage(sender_psid, webhook_event.message);
          } else if (webhook_event.postback) {
            fbController.handlePostback(sender_psid, webhook_event.postback);
          }
        }else {
          var mess = new Mess({
            id: sender_psid,
            loop: 0
          });
          mess.save(function (err) {
              if (err)
                  return console.log(err);   
          });
            if (webhook_event.message.text == "login") {            
              fbController.handleLogin(sender_psid);
            } else if (webhook_event.postback) {
              fbController.handlePostback(sender_psid, webhook_event.postback);
            }
          }
          
      })     
      
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
      res.sendStatus(404);
  }
}

/*
 * Health Endpoint
 */
function handleHealthEndpoint(req, res) {
  res.status(200).send("Health endpoint successful!");
}

module.exports = {
  handleVerifyServer: handleVerifyServer,
  handleWebhookEvent: handleWebhookEvent,
  handleHealthEndpoint: handleHealthEndpoint
}
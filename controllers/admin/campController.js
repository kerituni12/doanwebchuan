// Get Category model
let Camp = require('../../models/camp');

const request = require("request");
const rp = require('request-promise');

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const TOKEN_PATH = 'token.json';

exports.index = function (req, res) {   
    // console.log(req.user);
    Promise.all([Camp.count(), Camp.find().exec()]).then(([cout,camp]) => res.render('admin/camp', {
        camp: camp,
        count: cout
    }) )
    
};

exports.add_camp = function (req, res) {

    //req.checkBody('title', 'Title must have a value.').notEmpty();

    let name = req.body.name;
    let content = req.body.content;
    let des = req.body.des;
    let type = req.body.type;

    let errors = req.validationErrors();

    if (errors) {
        req.flash('danger', errors);
        res.redirect('/admin/camps');
    } else {
        let camp = new Camp({           
            name: name,
            content:content,
            des: des,
            type: type,
            status: 0
        });

        camp.save(function (err) {
            if (err)
                return console.log(err);
            req.flash('success', 'Camp đã được thêm');
            res.redirect('/admin/camps');
        });
    }

};

exports.edit_camp_get = function (req, res) {

    Camp.findById(req.params.id, function (err, camp) {
        if (err)
            return console.log(err);
        res.send(camp);
    });

};

exports.edit_camp_post = function (req, res) {

    let name = req.body.name;
    let content = req.body.content;
    let des = req.body.des;
    let type = req.body.type;
    let id = req.params.id;
    // let status = req.params.status;

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/camp', {
            errors: errors,
            name: name,
            id: id
        });
    } else {
        Camp.findById(id, function (err, camp) {
            if (err)
                return console.log(err);

            camp.name = name;
            camp.content = content;
            camp.des = des;
            camp.type = type;
            // camp.status = status

            camp.save(function (err) {
                if (err)
                    return console.log(err);

                req.flash('success', 'Camp đã được chỉnh sửa!');
                res.redirect('/admin/camps');
            });

        });
    }
 };

exports.delete_camp_post = function (req, res) {
    Camp.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);
        req.flash('success', 'Camp đã được xóa!');
        res.redirect('/admin/camps');
    });
};


exports.send_camp = function (req, res) {

    let sender_psid = req.body.user;
    let type = req.body.type;

    Camp.findById(req.params.id, async function(err, camp) {
        if (err)
            return console.log(err);

        switch (type) {
            case 'facebook':             
                facebook(sender_psid, camp.content).then(data => {
                    if(data.status == 'ok') {
                        camp.status = 1;
                        camp.save(function (err) {
                            if (err)
                                return console.log(err);
            
                            req.flash('success', 'Đã gửi!');
                             res.redirect('/admin/camps');
                        });
                    } else {
                        req.flash('danger', data.mess);
                        res.redirect('/admin/camps');
                    }
                });
                return;
            case 'telegram':
                telegram(sender_psid, camp.content);
                camp.status = 1;
                camp.save(function (err) {
                    if (err)
                        return console.log(err);
    
                    req.flash('success', 'Đã gửi!');
                    res.redirect('/admin/camps');
                });
                return;
            case 'gmail': 
                gmail('kerituni123@gmail.com', 'kerituni123@gmail.com', camp.content, camp.content);
                camp.status = 1;
                camp.save(function (err) {
                    if (err)
                        return console.log(err);
    
                    req.flash('success', 'Đã gửi!');
                    res.redirect('/admin/camps');
                });
                return; 
            default:
                return;
        }
    })
}



async function facebook(sender_psid, mess) {
    var results = {};

    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": {"text": mess}
    }
    
    results = await rp({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": {
        "access_token": process.env.FACEBOOK_TOKEN
      },
      "method": "POST",
      "json": request_body
    }).then(function(data){ console.log(data); return {status: 'ok', mess: results}}).catch(function (err) {
       let mess = err.error.error.message;
       //console.log('loi', mess);
      return {status: 'notok', mess: mess};
  });
    // console.log(results);
    return results;
  }

  exports.facebook = facebook;
// https://api.telegram.org/bot[BOT_API_KEY]/sendMessage?chat_id=-[MY_CHANNEL_NAME]&text=[MY_MESSAGE_TEXT]

function telegram(sender_psid, mess) {
    let request_body = {
        "chat_id": `-${sender_psid}`,
        "text": mess
      }
   
      request({
        "uri": `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,        
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          console.log('message sent! telegram ');
        } else {
          console.error("Không thể gửi mess" + err);
        }
      });
}

function gmail(from , to, subject, mess) {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Gmail API.
        authorize(JSON.parse(content), sendmail, from, to, subject, mess);
      });
}

exports.gmail = gmail;
async function sendmail(auth, from, to, subject, mess) {
    const gmail = google.gmail({version: 'v1', auth});

    // UTF-8 encoding icon
    
    // const subject = '🤘 Hello 🤘';
     const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    // let message = `${Buffer.from(mess).toString('base64')}`
    // teamplate gmail
    const messageParts = [
      `From: CMS Team99 <${from}>`,
      `To: <${to}>`,
      'Content-Type: text/html; charset=UTF-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      mess
    ].join('\n');
    // const message = messageParts.join('\n');
  
    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(messageParts)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    console.log(res.data);
    return res.data;
  }

 

  function authorize(credentials, callback, from, to, subject, mess) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, from, to, subject, mess);
    });
  }

  
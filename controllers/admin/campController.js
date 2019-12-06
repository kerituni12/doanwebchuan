// Get Category model
let Camp = require('../../models/camp');

const request = require("request");
const rp = require('request-promise');

exports.index = function (req, res) {   

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


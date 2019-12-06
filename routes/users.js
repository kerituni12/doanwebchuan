var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

// Get Users model
var User = require('../models/user');

/*
 * GET register
 */
router.get('/register', function (req, res) {

    res.render('register', {
        title: 'Register'
    });

});

/*
 * POST register
 */
router.post('/register', function (req, res) {

    var name = req.body.name;
    var email = req.body.email;    
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Vui lòng nhập tên').notEmpty();
    req.checkBody('email', 'Vui lòng nhập email').isEmail();    
    req.checkBody('password', 'Vui lòng nhập mật khẩu').notEmpty();
    req.checkBody('password2', 'Vui lòng nhập lại mật khẩu').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({email: email}, function (err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Người dùng đã tồn tại');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,                   
                    password: password,
                    phone: 123,
                    role: 'mem'
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'Bạn đã đăng kí thành công');
                                res.redirect('/users/login')
                            }
                        });
                    });
                });
            }
        });
    }

});

/*
 * GET login
 */
router.get('/login', function (req, res) {

    if (req.user) return res.redirect('/');
    
    res.render('login', {
        title: 'Log in'
    });

});

/*
 * POST login
 */
router.post('/login', function (req, res, next) {
    //
    passport.authenticate('local', {
        successRedirect: '/admin/users',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));
// xử lý sau khi user cho phép xác thực với facebook
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    })
);

/*
 * GET logout
 */
router.get('/logout', function (req, res) {

    req.logout();
    
    req.flash('success', 'Bạn đã đăng xuất!');
    res.redirect('/users/login');

});

// Exports
module.exports = router;



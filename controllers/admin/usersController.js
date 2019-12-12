var passport = require('passport');
var bcrypt = require('bcryptjs'); // ma hoa ...

// Get Users model
var User = require('../../models/user');

exports.index = function (req, res) {
    req.app.locals.errors = null;
    User.find(function (err, users) {
        if (err)
            return console.log(err);
        res.render('admin/users', {
            users: users
        });
    });
};

exports.add_user = function (req, res) {

    
    req.checkBody('name', 'Tên  không được rỗng.').notEmpty();
    req.checkBody('phone', 'Số điện thoại không được rỗng.').notEmpty();
    // req.checkBody('address', 'Địa chỉ không được rỗng.').notEmpty();
    req.checkBody('role', 'Vai trò không được rỗng.').notEmpty();
    req.checkBody('email', 'Email không được rỗng.').notEmpty();

    var name = req.body.name;
    // var username = name.replace(/\s+/g, '-').toLowerCase();
    var phone = req.body.phone;
    var address = req.body.address;
    var email = req.body.email;
    var role = req.body.role;
    var password = 'nhanvien';

    var errors = req.validationErrors();

    if (errors) {
        User.find(function (err, users) {
            res.render('admin/users', {
                errors: errors,
                users: users
            });
        });
    } else {
        User.findOne({
            phone: phone
        }, function (err, user) {
            if (user) {
                req.flash('danger', 'Người dùng đã tồn tại');
                res.redirect('/admin/users');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    // username: username,
                    password: password,
                    phone: phone,
                    address: address,
                    role: role
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
                                req.flash('success', 'Đã thêm nhân viên');
                                res.redirect('/admin/users')
                            }
                        });
                    });
                });
            }
        });
    }

};

exports.edit_user_get = function (req, res) {

    User.findById(req.params.id, function (err, user) {
        if (err)
            return console.log(err);
        res.send(user);
    });

};

exports.edit_user_post = function (req, res) {

    req.checkBody('name', 'Tên  không được rỗng.').notEmpty();
    req.checkBody('phone', 'Số điện thoại không được rỗng.').notEmpty();
    req.checkBody('role', 'Vai trò không được rỗng.').notEmpty();
    // req.checkBody('address', 'Địa chỉ không được rỗng.').notEmpty();
    req.checkBody('email', 'Email không được rỗng.').notEmpty();

    var name = req.body.name;
    var phone = req.body.phone;
    var address = req.body.address;
    var email = req.body.email;
    var role = req.body.role;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        User.find(function (err, users) {
            res.render('admin/users', {
                errors: errors,
                users: users
            });
        });
    } else {
        User.findOne({
            phone: phone,
            
        }, function (err, user) {
            if (user) {
                req.flash('danger', 'Người dùng đã tồn tại!');
                res.redirect('/admin/users');
            } else {

                User.findById(id, function (err, user) {
                    user.name = name;
                    user.phone = phone;
                    user.address = address;
                    user.email = email;
                    user.role = role;

                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.flash('success', 'Đã chỉnh sửa nhân viên');
                            res.redirect('/admin/users')
                        }
                    });
                });

            }
        });
    }

};

exports.del_user = function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);
        req.flash('success', 'Người dùng đã được xóa');
        res.redirect('/admin/users');
    });
};

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var bcrypt = require('bcryptjs');

var {
    configAuth
} = require('./auth');

module.exports = function (passport) {

    passport.use(new LocalStrategy({usernameField: 'email',
    passwordField: 'password'},function (email, password, done) {

        User.findOne({
            'email': email
        }, function (err, user) {
            if (err)
                console.log(err);

            if (!user) {
                return done(null, false, {
                    message: 'No user found!'
                });
            }

            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err)
                    console.log(err);

                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Wrong password.'
                    });
                }
            });
        });

    }));


    // Facebook 
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
            // điền thông tin để xác thực với Facebook.
            // những thông tin này đã được điền ở file auth.js
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: [
                'id',
                'displayName',
                'email',
                'first_name',
                'last_name',
                'middle_name'
            ]
        },

        function (token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function () {

                User.findOne({
                    'email': profile.emails[0].value
                }, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if(user.facebook.id != null) return done(null, user); // user found, return that user
                        // else
                        // user.update({$set: {'facebook.id': profile.id}}, {w: 1}, function(err){
                        //     return done(null, user);
                        // });

                        if (typeof user.facebook.id == 'undefined') {
                            user.update({
                                $set: {
                                    'facebook.id': profile.id,
                                    'facebook.token': token
                                }
                            }, {
                                w: 1
                            }, function (err) {});
                        }
                        return done(err, user);

                    } else {

                        var user = new User({
                            name: profile.name.givenName + ' ' + profile.name.familyName,
                            email: profile.emails[0].value,
                            password: '',
                            phone: 1234,
                            role: 'mem',
                            'facebook.id': profile.id
                        }); 
                        
                        bcrypt.genSalt(10, function (err, salt) {
                            bcrypt.hash(user.password, salt, function (err, hash) {
                                if (err)
                                    console.log(err);
        
                                user.password = hash;
        
                                user.save(function (err) {
                                    if (err)
                                        throw err;

                                    return done(null, user);
                                });
                            });
                        });

                        user.save(function (err) {
                            if (err)
                                throw err;

                            return done(null, user);
                        });
                    }

                });
            });

        }));


    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

}
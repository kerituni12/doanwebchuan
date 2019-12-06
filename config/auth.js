exports.isUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Please log in.');
        res.redirect('/users/login');
    }
}

exports.isAdmin = function(req, res, next) {    
    if (req.isAuthenticated() && req.user.role == 'admin') {
        next();
    } else {
       req.flash('danger', 'Please log in admin.');
       return res.redirect('/users/login');   
    }
    
}

exports.configAuth = {
    'facebookAuth': {
        'clientID': '417259508976227', // App ID của bản
        'clientSecret': '499cc51efd29d5149e47395332bb16f4', // App Secret của bạn
        'callbackURL': 'https://localhost:3001/users/auth/facebook/callback'
    }
  }
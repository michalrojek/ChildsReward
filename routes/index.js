var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
    res.render('index', {layout: ''});
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        //req.flash('error_msg', 'You are not logged in');
        return next();
    }
}

// Register user
router.post('/register', function(req, res){
    var name = req.body.name_reg;
    var email = req.body.mail_reg;
    var username = req.body.username_reg;
    var password = req.body.password_reg;
    var password2 = req.body.password2_reg;
    
    // Validation
    req.checkBody('name_reg', 'Name is required').notEmpty();
    req.checkBody('username_reg', 'Username is required').notEmpty();
    req.checkBody('mail_reg', 'Email is required').notEmpty();
    req.checkBody('mail_reg', 'Email is not valid').isEmail();
    req.checkBody('password_reg', 'Password is required').notEmpty();
    req.checkBody('password2_reg', 'Passwords do not match').equals(req.body.password_reg);
    
    var errors = req.validationErrors();
    
    User.findOne({ $or: [{username: username}, {email: email}]}, function(err, user){
        if(err) console.log(err);
        if(user && username != '' && email != '') {
            var error = {param: 'mail_reg', msg: 'Username or email is already taken.'};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }
        
        if(errors) {
            req.flash('errors', errors);
            res.redirect('/#register');
        } else {
            var newUser = new User({
                name: name,
                email: email,
                username: username,
                password: password
            });

            User.createUser(newUser, function(err, user){
                if(err) throw err;
                console.log(user);
            });

            req.flash('success_msg', 'You are registered and can now login');

            res.redirect('/');
        }
         
    });
});

router.post('/login',
  passport.authenticate('local', {successRedirect: '/dashboard', failureRedirect: '/', failureFlash: true}),
  function(req, res) {
    res.redirect('/dashboard');
  });

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;
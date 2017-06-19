var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');

var User = require('../models/user');
var Child = require('../models/child');

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
    fs.readdir('./public/img/stock_photos', function(err, files){
        if(err)
            throw err;
        req.app.images = [];
        files.forEach(function(file){
            req.app.images.push(file);
        });
        console.log(req.app.images);
    });
    res.render('index', {layout: ''});
});

router.get('/user', ensureAuthenticated, function(req, res){
    res.render('user_login', {layout: ''});
});

router.get('/child', ensureAuthenticated, function(req, res){
    res.render('child_login', {layout: ''});
});

function ensureAuthenticated(req, res, next){
    if(req.user instanceof User) {
        res.redirect('/dashboard');
    } else if (req.user instanceof Child) {
        res.redirect('/childDashboard');
    } else {
        //req.flash('error_msg', 'You are not logged in');
        return next();
    }
}

// Register user
router.post('/user/register', function(req, res){
    var name = req.body.name_reg;
    var email = req.body.mail_reg;
    var username = req.body.username_reg;
    var password = req.body.password_reg;
    var password2 = req.body.password2_reg;
    
    // Validation
    req.checkBody('name_reg', 'Imię i nazwisko jest wymagane').notEmpty();
    req.checkBody('username_reg', 'Nazwa użytkownika jest wymagana').notEmpty();
    req.checkBody('mail_reg', 'Email jest wymagany').notEmpty();
    req.checkBody('mail_reg', 'Email jest niepoprawny').isEmail();
    req.checkBody('password_reg', 'Hasło jest wymagane').notEmpty();
    req.checkBody('password2_reg', 'Hasła nie są takie same').equals(req.body.password_reg);
    
    var errors = req.validationErrors();
    
    User.findOne({ $or: [{username: username}, {email: email}]}, function(err, user){
        if(err) console.log(err);
        if(user && username != '' && email != '') {
            var error = {param: 'mail_reg', msg: 'Nazwa użytkownika lub email są już zajęte'};
            if(!errors) {
                errors = [];
            }
            errors.push(error);
        }
        
        if(errors) {
            req.flash('errors', errors);
            res.redirect('/user#register');
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

            req.flash('success_msg', 'Rejestracja przebiegła pomyślnie, możesz się zalogować');

            res.redirect('/user#login');
        }
         
    });
});

router.post('/user/login',
  passport.authenticate('user', {successRedirect: '/dashboard', failureRedirect: '/user#login', failureFlash: true}),
  function(req, res) {
    res.redirect('/dashboard');
  });

router.post('/child',
  passport.authenticate('child', {successRedirect: '/childDashboard', failureRedirect: '/child', failureFlash: true}),
  function(req, res) {
    res.redirect('/childDashboard');
  });

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'Wylogowano');
    res.redirect('/users/login');
});

module.exports = router;
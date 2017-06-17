const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Child = require('../models/child');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
    //Local Strategy for user
    passport.use('user', new LocalStrategy(function(username, password, done){
        // Match Username
        let query = {username:username};
        User.findOne(query, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Brak użytkownika o takim loginie'});
            }

            // Match Password
            bcrypt.compare(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Niewłaściwe hasło'});
                }
            });
        });
    }));
    
    //Local Strategy for child
    passport.use('child', new LocalStrategy(function(username, password, done){
        // Match Username
        let query = {login:username};
        Child.findOne(query, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Brak użytkownika o takim loginie'});
            }

            // Match Password
            bcrypt.compare(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    console.log(user);
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Niewłaściwe hasło'});
                }
            });
        });
    }));

  passport.serializeUser(function(user, done) {
      var key;
      if(user instanceof User) {
          key = {
              id: user.id,
              type: 1
          }
      } else if (user instanceof Child) {
          key = {
              id: user.id,
              type: 2
          }
      }
    done(null, key);
  });

  passport.deserializeUser(function(key, done) {
      if(key.type === 1){
          User.findById(key.id, function(err, user) {
              done(err, user);
          });
      } else if (key.type === 2){
          Child.findById(key.id, function(err, user) {
              done(err, user);
          });
      }
  });
}
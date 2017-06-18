const express = require('express');
const router = express.Router();
const schedule = require('node-schedule');
const bcrypt = require('bcryptjs');

let User = require('../models/user');
let Task = require('../models/task');
let Child = require('../models/child');
let Achievment = require('../models/achievment');
let Prize = require('../models/prize');

router.get('/', ensureAuthenticated, function(req, res){
    res.redirect('/childDashboard/tasks')
    //res.render('child_dashboard', {layout: 'child_layout'});
});

function findOneshot(req, res, next) {
    Task.find({type: 1, child: req.user._id}, function(err, tasks){
        if(err){
            console.log(err);
            return;
        } else {
            req.oneshotTasks = tasks;
            return next();
        }
    });
}

function findRepeat(req, res, next) {
    Task.find({type: 2, child: req.user._id, isActive: true}, function(err, tasks){
        if(err){
            console.log(err);
            return;
        } else {
            req.repeatTasks = tasks;
            next();
        }
    });
}

function renderTasks(req, res) {
    res.render('child_profile_tasks', {
        oneshotTasks: req.oneshotTasks,
        repeatTasks: req.repeatTasks,
        layout: 'child_layout'
    });
}

router.get('/tasks', ensureAuthenticated, findOneshot, findRepeat, renderTasks);

router.get('/achievments', ensureAuthenticated, function(req, res){
        Child.findById(req.user._id, function(err, child){
           if(err) {
               console.log(err);
           } else {
               let newChild = child;
               console.log(newChild instanceof Task);
               console.log(newChild.achievments);
               Achievment.find({_id: {$in: child.achievments}}, function(err, achievments){
                      res.render('child_achievment', {
                            child: child,
                            achievmentsRender: achievments.sort(function(a,b) {return (a.score > b.score) ? 1 : ((b.score > a.score) ? -1 : 0);} ),
                            layout: 'child_layout'
                        }); 
               });
           }
        });
    
});

router.get('/rewards', ensureAuthenticated, function(req, res){
        Child.findById(req.user._id, function(err, child){
           if(err) {
               console.log(err);
           } else {
               let newChild = child;
               console.log(newChild instanceof Task);
               console.log(newChild.achievments);
                   Prize.find({_id: {$in: child.prizes}}, function(err, prizes){
                      res.render('child_rewards', {
                            child: child,
                            prizesRender: prizes,
                            layout: 'child_layout'
                        }); 
                   });
           }
        });
    
});

function ensureAuthenticated(req, res, next){
    //console.log(req);
    if(req.user instanceof Child) {
        return next();
    } else {
        //req.flash('error_msg', 'You are not logged in');
        res.redirect('/');
    }
}

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success_msg', 'Wylogowano');
  res.redirect('/#childlogin');
});

module.exports = router;
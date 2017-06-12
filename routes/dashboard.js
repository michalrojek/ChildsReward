const express = require('express');
const router = express.Router();
const schedule = require('node-schedule');

let User = require('../models/user');
let Task = require('../models/task');
let Child = require('../models/child');
let Achievment = require('../models/achievment');

//var date = new Date(2017, 5, 11, 12, 43, 20);

function calculateNextDeadline(task){
    var dat = new Date(task.deadline);
    task.nextDeadline = new Date();
    switch(task.typeOfDeadline) {
        case 'everyDay':
            task.nextDeadline.setDate(dat.getDate() + 1);
            break;
        case 'every3Days':
            task.nextDeadline.setDate(dat.getDate() + 3);
            break;
        case 'everyWeek':
            task.nextDeadline.setDate(dat.getDate() + 7);
            break;
        case 'every2Weeks':
            task.nextDeadline.setDate(dat.getDate() + 14);
            break;
        case 'everyMonth':
            task.nextDeadline.setDate(dat.getDate() + 30);
            break;
            
    }
}

var j = schedule.scheduleJob('* 0 * * *', function(){
    Task.find(function(err, tasks){
         tasks.forEach(function(task){
             if(task.deadline < new Date()) {
                 if(task.type === 1){
                     Task.remove({_id: task._id}, function(err){
                         if(err)
                             console.log(err);
                     });
                 } else {
                     task.isActive = true;
                     let date = new Date(task.nextDeadline)
                     task.deadline = date;
                     calculateNextDeadline(task);
                     console.log(task.deadline);
                     Task.update({_id: task._id},task,function(err){
                         if(err)
                             console.log(err);
                     })
                 }
             }
         });
    });
});

function lookForCurChild(req, res, next) {
    if(req.session.curChild === undefined){
       Child.findOne({parent: req.user._id}, function(err, child){
          if(err){
              console.log(err);
              return;
          } else {
              if(child) {
                  console.log(child._id);
                  req.session.curChild = child._id;
                  return next();
              } else {
                  req.session.curChild = 1;
                  return next();
              }
          }
       });
    } else {
       return next();
    }
}

function findOneshot(req, res, next) {
    Task.find({type: 1, author: req.user._id, child: req.session.curChild}, function(err, tasks){
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
    Task.find({type: 2, author: req.user._id, child: req.session.curChild, isActive: true}, function(err, tasks){
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
    res.render('profile_tasks', {
        oneshotTasks: req.oneshotTasks,
        repeatTasks: req.repeatTasks,
        curChild: req.session.curChild,
        children: req.session.children
    });
}

//router.get('/', ensureAuthenticated, findOneshot, findRepeat, renderTasks);

router.get('/', ensureAuthenticated, lookForCurChild, function(req, res){
    let userId = req.user._id;
    
    Child.find({parent: userId}, function(err, child){
        if(err){
            console.log(err);
            return;
        } else {
            req.session.children = child;
            /*res.render('dashboard', {
                children: req.session.children
            });*/
            res.redirect('/dashboard/profile');
        }
    });
});

router.get('/addChild', ensureAuthenticated, function(req, res){
   res.render('add_child', {children: req.session.children}); 
});

router.post('/addChild', function(req, res){
    req.checkBody('childName', 'Imię dziecka jest wymagane').notEmpty();
    
    let errors = req.validationErrors();
    
    if(errors){
        console.log(errors);
        res.render('add_child', {
            errors: errors,
            children: req.session.children
        });
    } else {
        let child = new Child();
        child.name = req.body.childName;
        child.parent = req.user._id;
        child.score = 0;
        
        child.save(function(err){
           if(err) {
               console.log(err);
               return;
           } else {
               req.session.curChild = child._id;
               req.flash('success_msg', 'Dziecko zostało dodane');
               res.redirect('/dashboard');
           }
        });
    }
});

router.get('/profile', ensureAuthenticated, findOneshot, findRepeat, renderTasks);

router.post('/profile', function(req, res){
   //console.log(req.body.selectProfile);
    req.session.curChild = req.body.selectProfile;
    //res.render('profile_tasks', {children: req.app.get('children')});
    res.redirect('/dashboard/profile');
});

router.get('/addTask', ensureAuthenticated, function(req, res){
   res.render('add_task', {children: req.session.children}); 
});

router.post('/addTask', function(req, res) {
    req.checkBody('name', 'Nazwa zadania jest wymagana').notEmpty();
    req.checkBody('desc', 'Opis zadania jest wymagany').notEmpty();
    req.checkBody('score', 'Ilość punktów jest wymagana').notEmpty();
    req.checkBody('type', 'Typ zadania jest wymagany').notEmpty();
    req.checkBody('deadline', 'Termin zadania jest wymagany').notEmpty();
    
    if(req.body.type === 'repeat') {
        req.checkBody('deadlineType', 'Częstotliwość zadania cyklicznego jest wymagana').notEmpty();
    }
    
    let errors = req.validationErrors();
    
    if((new Date(req.body.deadline).getTime()<new Date().getTime())) {
        var error = {param: 'deadline', msg: 'Termin nie może być z przeszłości'};
        if(!errors) {
            errors = [];
        }
        errors.push(error);
    }
    
    if(errors){
        res.render('add_task', {
            errors: errors,
            children: req.session.children
        });
    } else {
        let task = new Task();
        task.name = req.body.name;
        task.desc = req.body.desc;
        task.score = req.body.score;
        if(req.body.type === 'oneshot') {
            task.type = 1;
        } else if(req.body.type === 'repeat') {
            task.type = 2;
        }
        task.author = req.user._id;
        task.child = req.session.curChild;
        task.deadline = req.body.deadline;
        task.isActive = true;
        
        if(task.type === 2) {
            task.typeOfDeadline = req.body.deadlineType;
            task.nextDeadline = req.body.deadline;
            calculateNextDeadline(task);
        }
        
        task.save(function(err) {
            if(err) {
                console.log(err);
                return;
            } else {
                req.flash('success_msg', 'Zadanie zostało dodane');
                res.redirect('/dashboard/profile');
            }
        });
    }
    
});

router.get('/editTask/:id', ensureAuthenticated, function(req, res){
  Task.findById(req.params.id, function(err, task){
    if(task.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('edit_task', {
        task:task,
        children: req.session.children
    });
  });
});

// Update Submit POST Route
router.post('/editTask/:id', function(req, res){
    req.checkBody('name', 'Nazwa zadania jest wymagana').notEmpty();
    req.checkBody('desc', 'Opis zadania jest wymagany').notEmpty();
    req.checkBody('score', 'Ilość punktów jest wymagana').notEmpty();
    req.checkBody('type', 'Typ zadania jest wymagany').notEmpty();
    req.checkBody('deadline', 'Termin jest wymagany').notEmpty();
    
    if(req.body.type === 'repeat') {
        req.checkBody('deadlineType', 'Częstotliwość zadania cyklicznego jest wymagana').notEmpty();
    }
    
    let errors = req.validationErrors();
    
    console.log("deadline: "+(new Date(req.body.deadline).getTime()<new Date().getTime()))
    
    if((new Date(req.body.deadline).getTime()<new Date().getTime())) {
        console.log("robie to dobrze");
        var error = {param: 'deadline', msg: 'Termin nie może być z przeszłości'};
        if(!errors) {
            errors = [];
        }
        errors.push(error);
    }
    
    if(errors){
        Task.findById(req.params.id, function(err, task){
            if(task.author != req.user._id){
              req.flash('danger', 'Not Authorized');
              res.redirect('/');
            }
            res.render('edit_task', {
                errors: errors,
                task:task,
                children: req.session.children
            });
          });
    } else {
        let task = {};
        task.name = req.body.name;
        task.desc = req.body.desc;
        task.score = req.body.score;
        if(req.body.type === 'oneshot') {
            task.type = 1;
        } else if(req.body.type === 'repeat') {
            task.type = 2;
        }
        task.author = req.user._id;
        task.child = req.session.curChild;
        task.deadline = req.body.deadline;
        task.isActive = true;
        
        if(task.type === 2) {
            task.typeOfDeadline = req.body.deadlineType;
            task.nextDeadline = req.body.deadline;
            calculateNextDeadline(task);
        }
        
          let query = {_id:req.params.id}

          Task.update(query, task, function(err){
            if(err){
              console.log(err);
              return;
            } else {
              req.flash('success_msg', 'Zadanie zostało zaktualizowane');
              res.redirect('/dashboard/profile');
            }
          });

    }
});

router.get('/achievments', function(req, res){
    if(req.session.curChild === 1) {
        res.render('achievment', {
                        children: req.session.children
                    });
    } else {
        Child.findById(req.session.curChild, function(err, child){
           if(err) {
               console.log(err);
           } else {
               let newChild = child;
               console.log(newChild.achievments);
               Achievment.find({_id: {$in: child.achievments}}, function(err, achievments){
                        res.render('achievment', {
                            child: child,
                            achievmentsRender: achievments,
                            children: req.session.children
                        });
               });
           }
        });
    }
});

router.delete('/task/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
    }
    
    let query = {_id:req.params.id}
    
    Task.findById(req.params.id, function(err, task){
        if(task.author != req.user._id){
            res.status(500).send();
        } else {
            Task.remove(query, function(err){
                if(err) {
                    console.log(err);
                }
                req.flash('success_msg', 'Zadanie zostało usunięte');
                res.send('Success');
            });
        }
    });
});

router.delete('/taskComplete/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
    }
    
    let query = {_id:req.params.id}
    
    Task.findById(req.params.id, function(err, task){
        if(task.author != req.user._id){
            res.status(500).send();
        } else {
            Child.findById(req.session.curChild, function(err, child){
               if(err){ 
                   console.log(err);
               } else {
                   let newChild = child;
                   newChild.score += task.score;
                   console.log(newChild.score);
                   newChild.achievments = [];
                   Achievment.find({score: {$lte: newChild.score}}, function(err, achievments){
                        achievments.forEach(function(achievment){
                            newChild.achievments.push(achievment._id);
                        });
                        Child.update({_id: req.session.curChild}, newChild, function(err){
                            if(err)
                                console.log(err);
                        });
                   });
               }
            });
            if(task.type === 1){
                Task.remove(query, function(err){
                    if(err) {
                        console.log(err);
                    }
                    req.flash('success_msg', 'Zadanie zostało wykonane');
                    res.send('Success');
                });
            } else {
                let pomTask = task;
                pomTask.isActive = false;
                Task.update(query, pomTask, function(err){
                    if(err) {
                        console.log(err);
                    }
                    req.flash('success_msg', 'Zadanie zostało wykonane');
                    res.send('Success');
                });
            }
        }
    });
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    } else {
        //req.flash('error_msg', 'You are not logged in');
        res.redirect('/');
    }
}

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success_msg', 'Wylogowano');
  res.redirect('/');
});

module.exports = router;
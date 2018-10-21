var express     = require('express');
var router      = express.Router();
var passport    = require('passport');
var User        = require('../models/user');
var Campground  = require('../models/campground');
var async       = require('async');
var nodemailer  = require('nodemailer');
var crypto      = require('crypto');



    // show the home page (will also have our login links)
    router.get('/', function(req, res) {
        res.redirect("/campground");
    });

    router.get('/index', function(req,res){
        res.render('v_access/index');
    });

    // PROFILE SECTION =========================
    router.get('/users/:id', isLoggedIn, function(req, res) {
        User.findById(req.params.id, function(err, foundUser){
            if(err){
                req.flash("error", "Something went wrong");
                res.redirect("/campground");
            }//jika berhasil menemukan user, maka cari campground milik user
            Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
                if(err){
                    req.flash("error", "Something went wrong");
                    res.redirect("/campground");
                } //jika ketemu, tampilkan list campground beserta profil user
                console.log("User id saat ini "+req.user._id+" User google "+campgrounds[0].author.id);
                res.render('v_access/profile',{user : foundUser, campgrounds : campgrounds});
            });
        });
        
    });

    // LOGOUT ==============================
    router.get('/logout', function(req, res) {
        req.logout();
        req.flash("success", "You successfull logout!"); // pertama dari sini, trs dikirim ke app.js, trs dikirim ke header
        res.redirect('/campground');
    });


    router.get('/latihan', (req,res)=>{ res.render('v_access/latihan'); }); 

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        router.get('/login', function(req, res) {
            res.render("v_access/login", { message: req.flash('loginMessage')});
        });

        // process the login form
        router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/campground', //redirect to homepage campground
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        router.get('/signup', function(req, res) {
            res.render('v_access/signup', { message: req.flash('signupMessage')});
        });

        // process the signup form
        router.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/verify', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authenticated the user
        router.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/campground',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        router.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        router.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/campground',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        router.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/campground',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        router.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        router.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        router.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authorized the user
        router.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        router.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        router.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        router.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        router.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    router.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    router.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    router.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    router.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });



    //FORGOT PASSWORD
    router.get("/forgot", function(req,res){
        res.render("v_access/forgot");
    });

    router.post('/forgot', function(req, res, next) {
        async.waterfall([
          function(done) {
            crypto.randomBytes(20, function(err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
          },
          function(token, done) {
            User.findOne({ 'local.email': req.body.email }, function(err, user) {
              if (!user) {
                req.flash('error', 'No account with that email address exists.');
                return res.redirect('/forgot');
              }
      
              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      
              user.save(function(err) {
                done(err, token, user);
              });
            });
          },
          function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
              service: 'Gmail', 
              auth: {
                user: 'fadlurss@gmail.com',
                pass: process.env.GMAILPW
              }
              
            });
            var mailOptions = {
              to: user.local.email,
              from: 'fadlurss@gmail.com',
              subject: 'Node.js Password Reset',
              text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              console.log('mail sent');
              req.flash('success', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
              done(err, 'done');
            });
          }
        ], function(err) {
          if (err) return next(err);
          res.redirect('/forgot');
        });
      });


      router.get('/reset/:token', function(req, res) {
        User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, cari) {
          
          
          res.json({token: req.params.token});
          console.log("HASILNYA "+cari);
        });
      });

    router.post('/reset/:token', function(req, res) {
        async.waterfall([
            function(done) {
                User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires' : { $gt: Date.now() } }, function(err, user) {
                    if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                    }
                    console.log("Hasil post "+user);
                    if(req.body.password === req.body.confirm){
                        user.local.setPassword(req.body.password, function(err){
                            user.local.resetPasswordToken = undefined;
                            user.local.resetPasswordExpires = undefined;

                        user.save(function(err){
                            req.logIn(user.local, function(err){
                                done(err, user);
                            });
                            });
                        });
                    } else {
                        req.flash('error', 'Password do not match');
                        return res.redirect('back');
                    }
                });
            }, function(user, done){
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail', 
                    auth: {
                        user: 'fadlurss@gmail.com',
                        pass: process.env.GMAILPW // GMAILPW=your password in terminal node app.js
                    }
                });

                var mailOptions  = {
                    to: user.local.email,
                    from: 'fadlurss@gmail.com',
                    subject: 'Your password has been changed',
                    text: 'Hello, \n\n'+
                    'This is a confirmation that the password for your account '+user.local.email+' has just been changed.\n'
                };

                smtpTransport.sendMail(mailOptions, function(err){
                    req.flash("success", "Success! Your password has been changed");
                    done(err);
                });
               }
            ], function(err){
                res.redirect("/campground");
            });
        });


        router.get("/verify", function(req,res){
            res.render("v_access/verify", {message : req.flash('success')});
        });

        router.post('/verify', function(req,res){
            User.findOne({'local.tokenReg' : req.body.tokenReg}, function(err, result){
                if(err){
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(!result){
                        console.log(result);
                        res.send("user not found");
                    } else {
                        // eval(require('locus'));
                        result.local.activeReg = true;
                        result.tokenReg = '';
                        result.save();
                        req.flash("success", "You successfull verify email!");
                        res.redirect("/campground");
                        console.log(result.active);
                    }
                }
            });
        });

    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/');
    }

module.exports = router;
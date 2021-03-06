var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Campground = require('../models/campground');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var Categories = require('../models/categories');
const bcrypt = require('bcrypt-nodejs');
asyncMiddleware = require("../middleware");
Joi = require('joi');



const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'ikutanevent',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.redirect_index = function (req, res) {
    res.redirect("/campground");
};

exports.render_index = function (req, res) {
    res.render('v_access/index');
};

exports.update_user = middleware.asyncMiddleware(async (req, res, next) => {
    const email_local = req.body.email_local;
    const email_google = req.body.email_google;
    const updateuser = {
        "local.email": email_local,
        "google.email": email_google
    }
    const hasil_update = await User.findOneAndUpdate(req.params.id, updateuser);
    res.redirect('/users/' + hasil_update._id);
});

// PROFILE SECTION 
exports.profile_user = function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("/campground");
        } //jika berhasil menemukan user, maka cari campground milik user
        Campground.find().where('author.id').equals(foundUser._id).exec(function (err, campgrounds) {
            if (err) {
                req.flash("error", "Something went wrong");
                res.redirect("/campground");
            } //jika ketemu, tampilkan list campground beserta profil user
            // console.log("User id saat ini " + req.user._id + " User google " + foundUser);
            Categories.find({}, function (err, categories) {
                res.render('v_access/profile', {
                    user: foundUser,
                    campgrounds: campgrounds,
                    categories: categories
                });
            });
        });
    });
};


exports.logout = function (req, res) {
    req.logout();
    req.flash("success", "You successfull logout!"); // pertama dari sini, trs dikirim ke app.js, trs dikirim ke header
    res.redirect('/campground');
};

exports.get_login = function (req, res) {
    res.render("v_access/login", {
        message: req.flash('loginMessage')
    });
};

// process the login form
exports.post_login = passport.authenticate('local-login', {
    successRedirect: '/', //redirect to homepage campground
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
});

// show the signup form
exports.get_signup = function (req, res) {
    res.render('v_access/signup', {
        message: req.flash('signupMessage')
    });
};

// process the signup form
exports.post_signup = passport.authenticate('local-signup', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
});

// send to facebook to do the authentication
exports.get_facebook = passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
});

// handle the callback after facebook has authenticated the user
exports.callback_facebook =
    passport.authenticate('facebook', {
        successRedirect: '/campground',
        failureRedirect: '/'
    });

// send to google to do the authentication
exports.get_google = passport.authenticate('google', {
    scope: ['profile', 'email']
});

// the callback after google has authenticated the user
exports.callback_google =
    passport.authenticate('google', {
        successRedirect: '/campground',
        failureRedirect: '/'
    });

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

// locally --------------------------------
exports.get_local = function (req, res) {
    res.render('connect-local.ejs', {
        message: req.flash('loginMessage')
    });
};
exports.post_local = passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
});

// send to facebook to do the authentication
exports.local_facebok = passport.authorize('facebook', {
    scope: ['public_profile', 'email']
});

// handle the callback after facebook has authorized the user
exports.callback_local_facebook =
    passport.authorize('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    });

// send to google to do the authentication
exports.local_google = passport.authorize('google', {
    scope: ['profile', 'email']
});

// the callback after google has authorized the user
exports.callback_local_google =
    passport.authorize('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    });

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

// local -----------------------------------
exports.unlink = function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
        res.redirect('/profile');
    });
};

// facebook -------------------------------
exports.unlink_facebook = function (req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function (err) {
        res.redirect('/profile');
    });
};

// google ---------------------------------
exports.unlink_google = function (req, res) {
    var user = req.user;
    user.google.token = undefined;
    user.save(function (err) {
        res.redirect('/profile');
    });
};



//FORGOT PASSWORD
exports.get_forgot_password = function (req, res) {
    Categories.find({}, function (err, categories) {
        res.render("v_access/forgot", {
            categories: categories
        });
    });
};

exports.post_forgot_password = function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({
                'local.email': req.body.email
            }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 7600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });

            var userData = {
                "local.resetPasswordToken": token,
                "local.resetPasswordExpires": Date.now() + 7600000
            }
            User.updateOne({
                _id: req.user._id
            }, {
                $set: userData
            }, function (err, hasil) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(hasil);
                }
            });
        },
        function (token, user, done) {
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
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
};


exports.get_token = function (req, res) {
    User.findOne({
        'local.resetPasswordToken': req.params.token,
        'local.resetPasswordExpires': {
            $gt: Date.now()
        }
    }, function (err, cari) {

        Categories.find({}, function (err, categories) {
            res.render("v_access/reset", {
                token: req.params.token,
                categories: categories
            });
        });

        //   res.json({token: req.params.token});
        //   console.log("HASILNYA "+req.params.token);
    });
};

exports.post_token = function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({
                'local.resetPasswordToken': req.params.token
            }, function (err, user) {
                if (user == null) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                let hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));
                user.local.password = hash
                user.local.resetPasswordToken = undefined;
                user.local.resetPasswordExpires = undefined;

                user.save(function (err, result) {
                    if (err) {
                        res.send(err)
                    } else {
                        res.redirect('/login')
                    }
                });
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'fadlurss@gmail.com',
                    pass: process.env.GMAILPW // GMAILPW=your password in terminal node app.js
                }
            });

            var mailOptions = {
                to: user.local.email,
                from: 'fadlurss@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello, \n\n' +
                    'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
            };

            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash("success", "Success! Your password has been changed");
                done(err);
            });
        }
    ], function (err) {
        res.redirect("/campground");
    });
};


exports.get_verify = function (req, res) {
    res.render("v_access/verify", {
        message: req.flash('success')
    });
};

exports.post_verify = function (req, res) {
    User.findOne({
        'local.tokenReg': req.params.tokenReg
    }, function (err, result) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            if (!result) {
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
};

exports.upload_ktp = function (req, res) {
    res.render("v_access/uploadktp");
};

exports.post_ktp = (req, res) => {
    var a = req.files[0].path;
    var b = req.files[1].path;
    var image_ktp = "";
    var image_ktp_selfie = "";
    cloudinary.v2.uploader.upload(a, function (error, result) {
        image_ktp = a;
        image_ktp = result.secure_url;
        console.log("hasil ktp " + image_ktp);

    });
    cloudinary.v2.uploader.upload(b, function (error, result) {
        image_ktp_selfie = b;
        image_ktp_selfie = result.secure_url;
        console.log("hasil selfie " + image_ktp_selfie);
        var userData = {
            "local.image_ktp": image_ktp,
            "local.image_ktp_selfie": image_ktp_selfie
        }
        User.updateOne({
            _id: req.user._id
        }, {
            $set: userData
        }, function (err, hasil) {
            if (err) {
                res.send(err);
            } else {
                res.send("berhasil");
            }
        });
    });
};


exports.get_all_user = middleware.asyncMiddleware(async (req, res, next) => {
    const allUser = await User.find({});
    res.render("v_access/alluser", {
        allUser: allUser
    });
});

// UPDATE STATUS AKUN
exports.post_statusakun = middleware.asyncMiddleware(async (req, res, next) => {
    var userData = {
        "local.statusAkun": req.body.statusAkun
    }
    const update_statusAkun = await User.findByIdAndUpdate(req.body.id, {
        $set: userData
    });
    res.send(update_statusAkun)

    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'fadlurss@gmail.com',
            pass: process.env.GMAILPW
        }
    });

    var mailOptions = {
        to: update_statusAkun.local.email,
        from: 'fadlurss@gmail.com',
        subject: 'Akun yelpcamp kamu sudah terverifikasi',
        text: 'Halo, \n\n' +
            'Yelpcamp menginformasikan bahwa akun ' + update_statusAkun.local.email + ' sudah terverifikasi.\n\n' +
            'Kamu sekarang bisa membuat acara baru di yelpcamp! \n\n' +
            'Terima kasih, Yelpcamp'
    };

    smtpTransport.sendMail(mailOptions, function (err) {
        done(err);
    });

});

// KIRIM EMAIL GAGAL VERIFIKASI USER
exports.post_gagalverifikasi = middleware.asyncMiddleware(async (req, res, next) => {
    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'fadlurss@gmail.com',
            pass: process.env.GMAILPW
        }
    });

    var mailOptions = {
        to: req.body.email,
        from: 'fadlurss@gmail.com',
        subject: 'Maaf, akun yelpcamp kamu gagal verifikasi',
        text: 'Halo, \n\n' +
            'Yelpcamp menginformasikan bahwa akun ' + req.body.email + ' gagal verifikasi.\n\n' +
            'Silakan upload photo KTP kamu dan photo selfie diri kamu dengan KTP \n\n' +
            'Terima kasih, Yelpcamp'
    };

    smtpTransport.sendMail(mailOptions, function (err) {
        res.redirect("/alluser");
    });
});


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
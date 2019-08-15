var express = require('express')
router = express.Router()
Booking = require("../models/booking")
Campground = require("../models/campground")
middleware = require("../middleware")
asyncMiddleware = require("../middleware");

exports.post_booking = function (req, res) {
    // const id_campground = req.body.id_campground;
    // const id_user = req.body.id_user;
    // const newBooking = {
    //     id_campground: id_campground,
    //     id_user: id_user
    // }
    // const postBooking = await Booking.create(newBooking);
    // const ticket = -1;
    // const updateCampground = await Campground.findOneAndUpdate({
    //     _id: id_campground
    // }, {
    //     $inc: {
    //         count_ticket: ticket
    //     },
    //     $push: {
    //         booking: postBooking.id
    //     }
    // });
    // res.redirect("/campground/");

    // Campground.findById(req.params.id, function (err, campground) {
    //     const id_campground = req.body.id_campground;
    //     const id_user = req.user._id;
    //     const newBooking = {
    //         id_campground: id_campground,
    //         id_user: id_user
    //     }
    //     Booking.create(newBooking, function (err, booking) {
    //         campground.bookings.push(booking);
    //         campground.save();
    //         res.redirect('/campground/');
    //     });
    // });

    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campground");
        } else {
            var id_campground = req.body.id_campground;
            var id_user = req.user._id;
            var newComment = {
                id_campground: id_campground,
                id_user: id_user
            }
            Booking.create(newComment, function (err, booking) {
                if (err) {
                    console.log(err);
                } else {
                    campground.bookings.push(booking);
                    campground.save();
                    // console.log(campground.encodedName);
                    req.flash('success', 'Your comment will reviewed in a moment in a hours');
                    res.redirect('/campground/');
                }
            });
        }
    });

};
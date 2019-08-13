var express = require('express')
router = express.Router()
Booking = require("../models/booking")
Campground = require("../models/campground")
middleware = require("../middleware")
asyncMiddleware = require("../middleware");

exports.post_booking = middleware.asyncMiddleware(async (req, res, next) => {
    const id_campground = req.body.id_campground;
    const id_user = req.body.id_user;
    const newBooking = {
        id_campground: id_campground,
        id_user: id_user
    }
    const postBooking = await Booking.create(newBooking);
    const ticket = -1;
    const updateCampground = await Campground.findOneAndUpdate({
        _id: id_campground
    }, {
        $inc: {
            count_ticket: ticket
        }
    });
    res.redirect("/campground/");
});
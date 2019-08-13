var mongoose = require('mongoose');
var bookingSchema = new mongoose.Schema({
    created_booking: {
        type: Date,
        default: Date.now
    },
    status: String,
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    id_campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campground'
    }
});


module.exports = mongoose.model("Booking", bookingSchema);
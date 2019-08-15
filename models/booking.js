var mongoose = require('mongoose');
var bookingSchema = new mongoose.Schema({
    created_booking: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Belum bayar"
    },
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});


module.exports = mongoose.model("Booking", bookingSchema);
var mongoose = require('mongoose');
var campgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        index: true
    },
    encodedName: {
        type: String,
        unique: true,
    },
    image: {
        link: String,
        public_id: String
    },
    price: Number,
    count_ticket: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        firstName: String,
        lastName: String,
        email: String,
    },
    created: {
        type: Date,
        default: Date.now
    },
    start_date: Date,
    end_date: Date,
    description: String,
    categories: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories'
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    }]
});

campgroundSchema.static("findByEncodedName", function (encodedName, callback) {
    return this.find({
        encodedName: encodedName
    }, callback);
});

module.exports = mongoose.model("Campground", campgroundSchema);
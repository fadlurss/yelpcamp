var mongoose = require('mongoose');
var campgroundSchema = new mongoose.Schema({
    name : {
            type: String,
            unique: true,
    },
    encodedName : {
            type: String,
            unique: true,
    },
    image : String,
    price : String,
    author : {
        id : {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username : String,
        firstName : String,
        lastName : String,
        email : String,
    },
    createdAt: { type: Date, default: Date.now },
    description : String,
    comments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ]
});

campgroundSchema.static("findByEncodedName", function(encodedName, callback){
    return this.find({encodedName: encodedName}, callback);
});

module.exports = mongoose.model("Campground", campgroundSchema);
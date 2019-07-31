var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    content: String,
    approveComment: {
        type: Boolean,
        default: false
    },
    author: {
        id_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },

    created: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model("Comment", commentSchema);

// author : {
//         id : mongoose.Schema.Types.ObjectId,
//         username : String
// },
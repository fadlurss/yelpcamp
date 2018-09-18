var mongoose    = require("mongoose");

var commentSchema   = mongoose.Schema({
    content: String,
    author: {
        id_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});


module.exports  = mongoose.model("Comment", commentSchema);

 // author : {
    //         id : mongoose.Schema.Types.ObjectId,
    //         username : String
    // },
var mongoose    = require("mongoose");

var categoriesSchema   = mongoose.Schema({
    name : {
        type: String,
        unique: true,
    },

    encodedName : {
        type: String,
        unique: true,
    },

    created : {type : Date, default: Date.now}
});

// categoriesSchema.static("findByEncodedName", function(encodedName, callback){
//     return this.find({encodedName: encodedName}, callback);
// });

module.exports  = mongoose.model("Categories", categoriesSchema);

 
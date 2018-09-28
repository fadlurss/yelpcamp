var  express = require('express')
     router = express.Router()
     Categories = require("../models/categories")
     Campground = require("../models/campground")

    router.get('/new', (req,res)=>{ 
       res.render("v_categories/new");
    }); 

    router.post("/new", function(req,res){
        var name = req.body.categories;
        var encodedName = req.body.categories.split(' ').join('-');
        var newCategories = {name : name, encodedName : encodedName};
        Categories.create(newCategories, function(err, input_categories_baru){
            if(err){
                res.render("v_categories/new");
            } else {
                res.redirect("/admin/categories");
            }
        });
    });


    router.get('/:id', function(req, res) {
        Categories.findById(req.params.id, function(err, foundCategories){
            if(err){
                req.flash("error", "Something went wrong");
                res.redirect("/campground");
            }//jika berhasil menemukan user, maka cari campground milik user
            Campground.find().where('categories').equals(foundCategories.id).exec(function(err, campgrounds){
                if(err){
                    req.flash("error", "Something went wrong");
                    res.redirect("/campground");
                    
                } //jika ketemu, tampilkan list campground beserta profil user
                // console.log("User id saat ini "+req.user._id+" User google "+campgrounds[0].author.id);
                res.render('v_categories/categories',{categories: foundCategories, campgrounds : campgrounds});
                console.log("hasil categories "+foundCategories.id);
            });
        });
        
        // res.send("dcdc");
    });


module.exports = router;
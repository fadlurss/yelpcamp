const express = require('express')
    router = express.Router()
    m_campground = require("../models/campground")
    Categories = require("../models/categories")
    middleware = require("../middleware")
    request    = require("request")
    multer     = require("multer");

const storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = function (req, file, cb) {
    //accept image files only
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({storage: storage, fileFilter: imageFilter})

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'ikutanevent',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

     router.get("/", function(req, res){
        var perPage = 8;
        var pageQuery = parseInt(req.query.page);
        var pageNumber = pageQuery ? pageQuery : 1;
        var noMatch = null;
        if(req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            m_campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
                m_campground.count({name: regex}).exec(function (err, count) {
                    if (err) {
                        console.log(err);
                        res.redirect("back");
                    } else {
                        if(allCampgrounds.length < 1) {
                            noMatch = "No campgrounds match that query, please try again.";
                        }
                        res.render("v_campground/index", {
                            campgrounds: allCampgrounds,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: req.query.search
                        });
                    }
                });
            });
        } else {
            // get all campgrounds from DB
            m_campground.find({}).sort({created: -1}).skip((perPage * pageNumber) - perPage).populate("categories").limit(perPage).exec(function (err, allCampgrounds) {
                m_campground.count().exec(function (err, count) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("v_campground/index", {
                            campgrounds: allCampgrounds,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: false
                        });
                    }
                });
            });
        }
    });
    
    // //INDEX  ROUTES --> index show all campground
    // router.get("/", function(req,res){
    //     // eval(require('locus'));
    //     var tidak_ada_hasil = '';
    //     if(req.query.search){
    //         var regex = new RegExp(escapeRegex(req.query.search), 'gi');
    //         m_campground.find({name : regex}, function(err, list_campground){
    //             if(err){
    //                 console.log(err);
    //             } else {
    //                 if(list_campground.length < 1){
    //                     req.flash("pesan_cari", "Data not found");
    //                     return res.redirect("/campground");
    //                 }
    //                 res.render("v_campground/index", {result_campground : list_campground});
    //             }
    //         });
    //     } else {
    //         m_campground.find({}, function(err, list_campground){
    //             if(err){
    //                 console.log(err);
    //             } else {
    //                 console.log(req.user);
    //                 res.render("v_campground/index", {result_campground : list_campground ,tidak_ada_hasil  :tidak_ada_hasil});
                    
    //             }
    //         });
    //     }
    // });

    //NEW ROUTES tambah campground baru klw sudah login, krn pakai function isLoggedIn
    router.get("/new", middleware.isLoggedIn ,  function(req,res){
        Categories.find({}, function(err,categories){
            res.render("v_campground/new", {categories : categories});
        });
    });

    //CREATE ROUTES
    router.post("/",middleware.isLoggedIn, upload.single('image'), function(req,res){
        cloudinary.uploader.upload(req.file.path, function(result) {
            var name = req.body.name;
            var encodedName = req.body.name.split(' ').join('-');
            var image = req.body.image;
            image = result.secure_url;
            var description = req.body.description;
            var categories = req.body.categories;
            var price = req.body.price;
            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            var author = {
                id : req.user._id,
                username : req.body.username
            }
            var newCampground = {name : name, encodedName : encodedName, image : image, categories: categories, description : description, author : author, price : price, start_date: start_date, end_date: end_date};
            m_campground.create(newCampground, function(err, input_blog_baru){
                if(err){//jika gagal balik ke form new
                    res.render("v_campground/new");
                } else {//jika berhasil balik ke halaman campground
                    // console.log(input_blog_baru);
                    
                    res.redirect("/campground");
                    // res.redirect("/campground/" + campground.id);
                }
            });
        });
    });


    //SHOW ROUTES 
    router.get("/:encodedName", function(req,res){
        m_campground.findByEncodedName(req.params.encodedName).populate({path: "comments",match: {approveComment: true}, options: {sort: {created: -1}}}).populate("categories").exec(function(err, hasil_pencarian_id){
            if(err){
                res.redirect("/campground");
            } else {
            Categories.find({}, function(err, categories){
                res.render("v_campground/show", {categories: categories,campground : hasil_pencarian_id[0]});
            });
            }
        });
    });

    //EDIT ROUTES
    router.get("/:id/edit",middleware.checkCampgroundOwnership, function(req,res){
            m_campground.findById(req.params.id, function(err, edit_id){
                Categories.find({}, function(err,categories){
                    res.render("v_campground/edit", {halaman_edit_id : edit_id, categories:categories});
                }); 
            });
    });

    //UPDATE ROUTES
    router.put("/:id",middleware.checkCampgroundOwnership, function(req,res){
        // myblognya.findByIdAndUpdate(id, newData, callback) sebagai acuan utk dibawah ini
        var name = req.body.name;
        var encodedName = req.body.name.split(' ').join('-');
        var image = req.body.image;
        var description = req.body.description;
        var price = req.body.price;
        var categories = req.body.categories;
        var author = {
            id : req.user._id,
            username : req.body.username
        }
        var updateCampground = {name : name, encodedName : encodedName,categories : categories, image : image, description : description, author : author, price : price};
        m_campground.findByIdAndUpdate(req.params.id, updateCampground, function(err, update_id){
            console.log("HASILNYA "+updateCampground.encodedName);
            if(err){
                res.redirect("campground");
            } else {
                res.redirect("/campground/"+updateCampground.encodedName);
                
            }
        });
    });

    //DELETE ROUTES
    router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
        m_campground.findByIdAndRemove(req.params.id, function(err){
            if(err){
                res.redirect("/campground");
            } else {
                res.redirect("/campground");
            }
        });
    });


    function escapeRegex(text) { //fuzzy searching with mongodb
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

module.exports = router;
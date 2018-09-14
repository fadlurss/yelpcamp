var  express = require('express')
     router = express.Router()
     m_campground = require("../models/campground")
     middleware = require("../middleware")

    //INDEX  ROUTES --> index show all campground
    router.get("/", function(req,res){
        // eval(require('locus'));
        var tidak_ada_hasil = '';
        if(req.query.search){
            var regex = new RegExp(escapeRegex(req.query.search), 'gi');
            m_campground.find({name : regex}, function(err, list_campground){
                if(err){
                    console.log(err);
                } else {
                    if(list_campground.length < 1){
                        req.flash("pesan_cari", "Data not found");
                        return res.redirect("/campground");
                    }
                    res.render("v_campground/index", {result_campground : list_campground});
                }
            });
        } else {
            m_campground.find({}, function(err, list_campground){
                if(err){
                    console.log(err);
                } else {
                    console.log(req.user);
                    res.render("v_campground/index", {result_campground : list_campground ,tidak_ada_hasil  :tidak_ada_hasil});
                    
                }
            });
        }
    });

    //NEW ROUTES tambah campground baru klw sudah login, krn pakai function isLoggedIn
    router.get("/new", middleware.isLoggedIn ,  function(req,res){
        res.render("v_campground/new");
    });

    //CREATE ROUTES
    router.post("/",middleware.isLoggedIn ,function(req,res){
        var name = req.body.name;
        var encodedName = req.body.name.split(' ').join('-');
        var image = req.body.image;
        var description = req.body.description;
        var price = req.body.price;
        var author = {
            id : req.user._id,
            username : req.body.username
        }
        var newCampground = {name : name, encodedName : encodedName, image : image, description : description, author : author, price : price};
        m_campground.create(newCampground, function(err, input_blog_baru){
            if(err){//jika gagal balik ke form new
                res.render("v_campground/new");
            } else {//jika berhasil balik ke halaman campground
                // console.log(input_blog_baru);
                
                res.redirect("/campground");
            }
        });
    });


    //SHOW ROUTES 
    router.get("/:encodedName", function(req,res){
        m_campground.findByEncodedName(req.params.encodedName).populate("comments").exec(function(err, hasil_pencarian_id){
            if(err){
                res.redirect("/campground");
            } else {
                res.render("v_campground/show", {panggil_id : hasil_pencarian_id[0]});
            }
        });
    });

    //EDIT ROUTES
    router.get("/:id/edit",middleware.checkCampgroundOwnership, function(req,res){
            m_campground.findById(req.params.id, function(err, edit_id){
                res.render("v_campground/edit", {halaman_edit_id : edit_id});
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
        var author = {
            id : req.user._id,
            username : req.body.username
        }
        var updateCampground = {name : name, encodedName : encodedName, image : image, description : description, author : author, price : price};
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
    router.delete("/:encodedName", middleware.checkCampgroundOwnership, function(req, res){
        m_campground.findByEncodedNameAndRemove(req.params.encodedName, function(err){
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
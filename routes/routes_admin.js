var  express = require('express')
     router = express.Router()
     Campgrounds = require('../models/campground');
     Comments = require('../models/comment');
     Users = require('../models/user');
     middleware = require("../middleware");

     router.get("/", middleware.isLoggedIn , (req,res)=>{
     	Campgrounds.find({}).populate("comments").sort({created: -1}).exec(function(err, campgrounds){
            res.render("v_admin/index", {campgrounds : campgrounds});
            console.log();
         });
        // Campgrounds.find({author: req.user.id})
        //     .populate('comments')
        //     .then(campgrounds=>{
    
        //         res.render("v_admin/index", {campgrounds : campgrounds});
        //     });
    
     });

     router.get('/:id', (req, res)=>{


        Campgrounds.find({author: req.user.id})
            .populate('comments')
            .then(posts=>{
    
                res.render("v_admin/index", {campgrounds : campgrounds});
            });
    
    
    
    });

     router.get("/comments", (req,res)=>{
        Comments.find({}).populate("user").sort({created: -1}).exec(function(err, comments){
            Campgrounds.findById(req.params.id, function(err, hasilnya){
                res.render("v_admin/comments", {comments : comments, hasilnya: hasilnya});
            });
        });
     });








module.exports = router;
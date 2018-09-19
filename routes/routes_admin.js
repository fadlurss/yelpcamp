var  express = require('express')
     router = express.Router()
     Campgrounds = require('../models/campground');
     Comments = require('../models/comment');
     Users = require('../models/user');

     router.get("/", (req,res)=>{
     	Campgrounds.find({author: req.user.id}).populate("comments","user").sort({created: -1}).exec(function(err, campgrounds){
            res.render("v_admin/index", {campgrounds : campgrounds});
            console.log();
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
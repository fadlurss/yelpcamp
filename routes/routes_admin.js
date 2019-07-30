var express = require("express");
router = express.Router();
Campgrounds = require("../models/campground");
Comments = require("../models/comment");
Users = require("../models/user");
Categories = require('../models/categories');
middleware = require("../middleware");

//Get all campgrounds to admin
router.get("/", middleware.isLoggedIn, (req, res) => {
  Users.findById(req.user.id, (err, foundUser) => {
    console.log("user saat ini " + req.user.id);
    Campgrounds.find()
      .where("author.id")
      .equals(foundUser.id)
      .populate({path: "comments", match: {approveComment: true}})
      .sort({ created: -1 })
      .exec(function(err, campgrounds) {
        res.render("v_admin/index", {
          user: foundUser,
          campgrounds: campgrounds
        });
        console.log("user terdaftar " + foundUser.id);
      });
  });
});

//Get all comments
router.get("/comments", function(req,res){
    Users.findById(req.user.id, (err, foundUser) => {
        console.log("user saat ini " + req.user.id);
        Campgrounds.find()
          .where("author.id")
          .equals(foundUser.id)
          .populate({path: "comments", sort: {created: -1}})
          .sort({ created: -1 })
          .exec(function(err, campgrounds) {
            res.render("v_admin/comments", {
              user: foundUser,
              campgrounds: campgrounds
            });
            console.log("user terdaftar " + foundUser.id);
          });
      });
});


router.get("/categories", function(req,res){
  Categories.find({}, function(err, hasil_categories){
    res.render("v_admin/categories", {hasil_categories: hasil_categories});
  });
});


//Delete comments
router.delete('/comments/:id', (req, res)=>{
    Comments.remove({_id:req.params.id}).then(deleteItem=>{
        Campgrounds.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data)=>{
           if(err) console.log(err);
            res.redirect("/admin/comments");
              });
        });
});

router.post('/comments/approve-comment', (req, res)=>{
  // console.log(req.body.id);
    Comments.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result)=>{
        if(err) return err;
        res.send(result)
    });
    // console.log(req.body.approveComment);
});


module.exports = router;

const express = require("express");
const router  = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const { isLoggedIn, checkCommentOwnership, checkCampgroundOwnership, isAdmin } = middleware;

//Comments New
router.get("/new", isLoggedIn, function(req, res){
    // find campground by id
    console.log(req.params.id);
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("v_comment/new", {campground: campground});
        }
    })
});

//Comments Create
router.post("/", isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campground");
       } else {
            var content = req.body.content;
            var author = {
                id_user : req.user._id,
                username : req.body.author
            };
            var newComment = {
                content : content,
                author  : author
            }
        Comment.create(newComment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               campground.comments.push(comment);
               campground.save();
               console.log(campground.encodedName);
               req.flash('success', 'Created a comment!');
               res.redirect('/campground/'+campground.encodedName);
           }
        });
       }
   });
});


  router.put("/:comment_id", isLoggedIn, checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
    var content = req.body.content;
    var author = {
        id_user : req.user._id,
        username : req.body.author
    }
    var editComment = {content : content, author : author};
     Comment.findByIdAndUpdate(req.params.comment_id, editComment, function(err, comment){
         if(err){
            console.log(err);
             res.render("edit");
         } else {
             console.log("hasil komen "+comment);
             res.redirect("/campground/"+campground.encodedName);
         }
     }); 
    });
  });

router.delete("/:commentId", checkCommentOwnership, function(req, res){
    // find campground, remove comment from comments array, delete comment in db
    Campground.findByIdAndUpdate(req.params.id, {
      $pull: {
        comments: req.params.commentId
      }
    }, function(err, campground) {
      if(err){ 
          console.log(err)
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          Comment.findByIdAndRemove(req.params.commentId, function(err) {
            if(err) {
              req.flash('error', err.message);
              return res.redirect('/');
            }
            req.flash('error', 'Comment deleted!');
            res.redirect("/campground/"+campground.encodedName);
          });
      }
    });
  });

module.exports = router;
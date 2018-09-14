var express = require('express')
    router = express.Router({mergeParams : true})
    m_campground = require("../models/campground")
    m_comment    = require("../models/comment")
    middleware = require("../middleware")
    
    router.get("/new",middleware.isLoggedIn, function(req, res){
        m_campground.findById(req.params.id, function(err, cari_id_campground){
          res.render("v_comment/new", {cari_dong : cari_id_campground}); 
        });
    });

    router.post("/",middleware.isLoggedIn, function(req, res){
        //cari dulu campground id
        m_campground.findById(req.params.id, function(err, cari_campground){
            if(err){
                console.log(err);
                res.redirect("/campground");
            } else { //kemudian buat komen
            var content = req.body.content;
            var author = { id_user : req.user._id, username : req.body.author }
            var newComment = {content : content, author : author};
                m_comment.create(newComment, function(err, input_komen_baru){
                    cari_campground.comments.push(input_komen_baru);
                    cari_campground.save();//kemudian simpan
                    console.log("cobaaaaaaaaa");
                    console.log(req.comment);
                    res.redirect("/campground/" + cari_campground._id);
                });
            }
        });
    });

    //edit route
    router.get("/:comment_id/edit" , middleware.checkCommentOwnership,function(req,res){ //ini dari button edit di show campground
        m_comment.findById(req.params.comment_id ,function(err, edit_komen){
          res.render("v_comment/comment_edit", {campground_id : req.params.id, comment : edit_komen});
        });
    });

    //update route
    router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){ //ini dapat dari views/comment_edit
        var content = req.body.content;
            var author = {
                id_user : req.user._id,
                username : req.body.author
            }
            var editComment = {content : content, author : author};
        m_comment.findByIdAndUpdate(req.params.comment_id, editComment, function(err, update_komen){
            res.redirect("/campground/" + req.params.id); // ini dapat dari router.put("linknya"), klw pakai req.params.id disesuiakan dengan linkny
        });
    })

    //delete route
    router.delete("/:comment_id",middleware.checkCommentOwnership, function(req,res){
        m_comment.findByIdAndRemove(req.params.comment_id, function(err){
                res.redirect("/campground/"+req.params.id);
        });
    });

module.exports = router;
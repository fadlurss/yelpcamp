var express = require('express')
router = express.Router()
Categories = require("../models/categories")
Campground = require("../models/campground")

exports.new_categories = function (req, res) {
    res.render("v_categories/new");
};

exports.create_categories = function (req, res) {
    var name = req.body.categories;
    var encodedName = req.body.categories.split(' ').join('-');
    var newCategories = {
        name: name,
        encodedName: encodedName
    };
    Categories.create(newCategories, function (err, input_categories_baru) {
        if (err) {
            res.render("v_categories/new");
        } else {
            res.redirect("/admin/categories");
        }
    });
};


exports.edit_categories = function (req, res) {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    Categories.findById(req.params.id, function (err, foundCategories) {
        if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("/campground");
        } //jika berhasil menemukan user, maka cari campground milik user
        Campground.find().sort({
            created: -1
        }).skip((perPage * pageNumber) - perPage).where('categories').equals(foundCategories.id).exec(function (err, campgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    res.redirect("/campground");

                } //jika ketemu, tampilkan list campground beserta profil user
                // console.log("User id saat ini "+req.user._id+" User google "+campgrounds[0].author.id);
                Categories.find({}, function (err, categories) {
                    res.render('v_categories/categories', {
                        categories: categories,
                        categori: foundCategories,
                        campgrounds: campgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                });
            });

        });
    });
};
const m_campground = require("../models/campground")
Categories = require("../models/categories")
middleware = require("../middleware")
request = require("request")
multer = require("multer");
asyncMiddleware = require("../middleware");

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'ikutanevent',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.read_campground = middleware.asyncMiddleware(async (req, res, next) => {
    const perPage = 8;
    const pageQuery = parseInt(req.query.page);
    const data_categories = await Categories.find({});
    const pageNumber = pageQuery ? pageQuery : 1;

    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');

        console.log(data_categories);

        const allCampgrounds = await m_campground.find({
            name: regex
        }).skip((perPage * pageNumber) - perPage).limit(perPage)
        const count = await m_campground.count({
            name: regex
        })
        if (allCampgrounds.length < 1) {
            noMatch = "No campgrounds match that query, please try again.";
        }
        res.render("v_campground/index", {
            campgrounds: allCampgrounds,

            current: pageNumber,
            pages: Math.ceil(count / perPage),
            noMatch: noMatch,
            search: req.query.search
        });
    } else {
        const allCampgrounds = await m_campground.find({}).sort({
            created: -1
        }).skip((perPage * pageNumber) - perPage).populate("categories").limit(perPage)
        const count = await m_campground.count()
        Categories.find({}, function (err, categories) {
            res.render("v_campground/index", {
                categories: categories,
                data_categories: data_categories,
                campgrounds: allCampgrounds,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                noMatch: noMatch,
                search: false
            });
        });
    }
});

//NEW ROUTES 
exports.new_campground = middleware.asyncMiddleware(async (req, res, next) => {
    const categories = await Categories.find({});
    res.render("v_campground/new", {
        categories: categories
    });
});

//CREATE ROUTES
exports.post_campground = middleware.asyncMiddleware(async (req, res, next) => {
    cloudinary.uploader.upload(req.file.path, async (result) => {
        const name = req.body.name;
        const encodedName = req.body.name.split(' ').join('-');
        var image = req.body.image;
        image = {
            link: result.secure_url,
            public_id: result.public_id
        };
        const description = req.body.description;
        const categories = req.body.categories;
        const price = req.body.price;
        const start_date = req.body.start_date;
        const end_date = req.body.end_date;
        const author = {
            id: req.user._id,
            username: req.body.username
        };
        const newCampground = {
            name: name,
            encodedName: encodedName,
            image: image,
            categories: categories,
            description: description,
            author: author,
            price: price,
            start_date: start_date,
            end_date: end_date
        };
        const input_blog_baru = await m_campground.create(newCampground);
        res.redirect("/campground")
    })
});

//SHOW ROUTES 
exports.show_campground = middleware.asyncMiddleware(async (req, res, next) => {
    const campground_slug = await m_campground.findByEncodedName(req.params.encodedName)
        .populate({
            path: "comments",
            match: {
                approveComment: true
            },
            options: {
                sort: {
                    created: -1
                }
            }
        })
        .populate("categories")
    const categories = await Categories.find({});
    res.render("v_campground/show", {
        categories: categories,
        campground: campground_slug[0]
    });
});

//EDIT ROUTES
exports.edit_campground =
    function (req, res) {
        m_campground.findById(req.params.id, function (err, edit_id) {
            Categories.find({}, function (err, categories) {
                res.render("v_campground/edit", {
                    halaman_edit_id: edit_id,
                    categories: categories
                });
            });
        });
    };

//UPDATE ROUTES
exports.update_campground = middleware.asyncMiddleware(async (req, res, next) => {
    cloudinary.uploader.upload(req.file.path, async (result) => {
        const name = req.body.name;
        const encodedName = req.body.name.split(' ').join('-');
        var image = req.body.image;
        image = {
            link: result.secure_url,
            public_id: result.public_id
        };
        const description = req.body.description;
        const price = req.body.price;
        const categories = req.body.categories;
        const updateCampground = {
            name: name,
            encodedName: encodedName,
            categories: categories,
            image: image,
            description: description,
            price: price
        };
        const hasil_update = await m_campground.findOneAndUpdate(req.params.id, updateCampground);
        res.redirect("/campground/" + updateCampground.encodedName);
    })
});

exports.edit_name_campground = middleware.asyncMiddleware(async (req, res, next) => {
    const campground_slug = await m_campground.findByEncodedName(req.params.encodedName)
        .populate({
            path: "comments",
            match: {
                approveComment: true
            },
            options: {
                sort: {
                    created: -1
                }
            }
        })
        .populate("categories")
    const categories = await Categories.find({});
    res.render("v_campground/show", {
        categories: categories,
        campground: campground_slug[0]
    });
});

//DELETE ROUTES
exports.delete_campground = middleware.asyncMiddleware(async (req, res, next) => {
    const delete_campground = await m_campground.findByIdAndRemove(req.params.id)
    cloudinary.v2.uploader.destroy(delete_campground.image.public_id, async (error, result) => {
        res.redirect("/campground");
    });

});


function escapeRegex(text) { //fuzzy searching with mongodb
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
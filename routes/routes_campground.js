const express = require('express')
router = express.Router()
campground = require("../controllers/con_campground");
request = require("request")
multer = require("multer");
asyncMiddleware = require("../middleware");


const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = function (req, file, cb) {
    //accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: imageFilter
})


router.get("/", campground.read_campground);
router.get("/:encodedName", campground.show_campground);
router.get("/new", middleware.isLoggedIn, campground.new_campground);
router.post("/", middleware.isLoggedIn, upload.single('image'), campground.post_campground);
router.get("/:id/edit", middleware.checkCampgroundOwnership, campground.edit_campground);
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), campground.update_campground);
// router.get("/:encodedName", campground.edit_name_campground);
router.delete("/:id", middleware.checkCampgroundOwnership, campground.delete_campground);

module.exports = router;
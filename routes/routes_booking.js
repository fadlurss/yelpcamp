const express = require('express')
router = express.Router()
booking = require("../controllers/con_booking");
request = require("request")
multer = require("multer");
asyncMiddleware = require("../middleware");


router.post("/", middleware.isLoggedIn, booking.post_booking);

module.exports = router;
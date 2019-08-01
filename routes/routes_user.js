var express = require('express');
var router = express.Router();
const con_user = require("../controllers/con_user");
var multer = require("multer");
const asyncMiddleware = require("../middleware");

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
});

router.get('/', con_user.redirect_index);
router.get('/index', con_user.render_index);
router.get('/users/:id', asyncMiddleware.isLoggedIn, con_user.profile_user);
router.put("/users/:id", con_user.update_user);
router.get('/logout', con_user.logout);
router.get('/login', con_user.get_login);
router.post('/login', con_user.post_login);
router.get('/signup', con_user.get_signup);
router.post('/signup', con_user.post_signup);
router.get('/auth/facebook', con_user.get_facebook);
router.get('/auth/facebook/callback', con_user.callback_facebook);
router.get('/auth/google', con_user.get_google);
router.get('/auth/google/callback', con_user.callback_google);
router.get('/connect/local', con_user.get_local);
router.post('/connect/local', con_user.post_local);
router.get('/connect/facebook', con_user.local_facebok);
router.get('/connect/facebook/callback', con_user.callback_local_facebook);
router.get('/connect/google', con_user.local_google);
router.get('/connect/google/callback', con_user.callback_local_google);
router.get('/unlink/local', asyncMiddleware.isLoggedIn, con_user.unlink);
router.get('/unlink/facebook', asyncMiddleware.isLoggedIn, con_user.unlink_facebook);
router.get('/unlink/google', asyncMiddleware.isLoggedIn, con_user.unlink_google);
router.get("/forgot", con_user.get_forgot_password);
router.post('/forgot', con_user.post_forgot_password);
router.get('/reset/:token', con_user.get_token);
router.post('/reset/:token', con_user.post_token);
router.get("/verify", con_user.get_verify);
router.get('/verify/:tokenReg', con_user.post_verify);
router.get("/uploadktp", con_user.upload_ktp);
router.post('/uploadktp', upload.any(), con_user.post_ktp);
router.get("/alluser", con_user.get_all_user);
router.post('/statusAkun', con_user.post_statusakun);
router.post("/gagalverifikasi", con_user.post_gagalverifikasi);

module.exports = router;
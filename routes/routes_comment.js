const express = require("express");
const router = express.Router({
  mergeParams: true
});
const comment = require("../controllers/con_comment");
const middleware = require("../middleware");
const {
  isLoggedIn,
  checkCommentOwnership,
  checkCampgroundOwnership,
  isAdmin
} = middleware;


router.get("/new", isLoggedIn, comment.new_comment);
router.post("/", isLoggedIn, comment.create_comment);
router.put("/:comment_id", isLoggedIn, checkCommentOwnership, comment.update_comment);
router.delete("/:commentId", checkCommentOwnership, comment.delete_comment);

module.exports = router;
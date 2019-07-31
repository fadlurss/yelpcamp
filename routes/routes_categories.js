var express = require('express')
router = express.Router()
categories = require("../controllers/con_categories");

router.get('/', categories.get_categories);
router.get('/new', categories.new_categories);
router.post("/new", categories.create_categories);
router.get('/:id', categories.edit_categories);


module.exports = router;
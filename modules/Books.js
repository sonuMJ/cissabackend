const express = require('express');
const router = express.Router();
var books = require('../bookdata')

router.get("/getBookdata", function(req, res){
    res.json(books);
})

module.exports = router;
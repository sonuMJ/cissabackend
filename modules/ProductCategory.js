const express = require('express');
const router = express.Router();
const db = require('../db/dbconnection');

router.get("/getcategory", function(req, res){
    db.query("SELECT * FROM product_category", function(err,result){
        if(!err){
            res.json(result);
        }else{
            return null;
        }
        
    })
})



module.exports = router;
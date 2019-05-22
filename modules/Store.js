const express = require('express');
const router = express.Router();
const db = require("../db/dbconnection");

router.get("/getstores", function(req, res){
    db.query("SELECT l_abbr as abbr,l_name as store_name FROM store_location", function(err, result){
        if(!err){
            res.json(result)
        }else{
            res.sendStatus(404);
        }
    })
})
router.post("/getstorebyabbr", function(req, res){
    var _loc = req.body.loc_abbr;
    
    db.query("SELECT l_name as store_name,l_address as store_address FROM store_location WHERE l_abbr=?",[_loc],function(err, result){
        if(!err&&result.length > 0){
            res.json(result);
        }else{
            res.sendStatus(404);
        }
    })
})
router.post("/getstoredetailbyabbr", function(req, res){
    var _loc = req.body.loc_abbr;
    console.log(_loc);
    
    db.query("SELECT l_name as store_name,l_address as store_address FROM store_location WHERE l_abbr=?",[_loc],function(err, result){
        if(!err&&result.length > 0){
            res.json(result);
        }else{
            res.sendStatus(404);
        }
    })
})

module.exports = router;
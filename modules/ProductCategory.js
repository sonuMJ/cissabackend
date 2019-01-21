const express = require('express');
const router = express.Router();
const db = require('../db/dbconnection');
const { check, validationResult } = require('express-validator/check')
const misc= require("../Misc/Misc");

router.get("/getcategory", function(req, res){
    db.query("SELECT * FROM product_category", function(err,result){
        if(!err){
            res.json(result);
        }else{
            return null;
        }
        
    })
})

//post category
router.post("/send",
        [
            check('name').isLength({min:2, max:30}).not().isEmpty()
        ]
        , function(req, res){
            var input = req.body;
            var data = {
                name:input.name,
                category_id: misc.RandomCategoryID()
            }
            const error = validationResult(req);
                if(!error.isEmpty()){
                    res.status(422).json({errors : error.array()})
                }else{
                    db.query("INSERT INTO product_category SET ?",[data], function(err, result){
                        if(err){
                            console.log(err);
                            res.json({message : "Failed to add product!"});
                        }
                        res.status(200).json({message : "Product successfully added!"});
                    })
                }
            
})
//delete category
router.delete("/:id", function(req, res){
    var id = req.params.id;
    db.query("DELETE FROM product_category WHERE category_id = ?", [ id ], function(err, results){
        if(err){
            res.json({message:"Something went wrong!"});
        }
        res.status(200).json({message : "Successfully Deleted!"})
    })
})


module.exports = router;
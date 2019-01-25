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
            var token = req.headers.token;
            var session = req.headers.sessionid;
            var validToken = jwt.JWTVerify(token);
            if(validToken){
                var jwtParse = jwt.JWTParse(token);
                var JWT_SESSION = jwtParse[0].csrf;
                var ROLE = jwtParse[0].role;
                if(JWT_SESSION === session){
                    if(ROLE == "admin"){
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
                                        res.json({status:"Failed",message : "Failed to add category!"});
                                    }
                                    res.status(200).json({status:"Success",message : "New category added!"});
                                })
                            }
                        }
                        else{
                            res.status(200).json({status:"Failed", message : "Permission Denied !"});
                        }
                    }
                    else{
                        res.sendStatus(404);
                    }
                }
                else{
                    res.sendStatus(404);
                }
})

//delete category
router.delete("/:id", function(req, res){
    var token = req.headers.token;
    var session = req.headers.sessionid;
    var validToken = jwt.JWTVerify(token);
    if(validToken){
        var jwtParse = jwt.JWTParse(token);
        var JWT_SESSION = jwtParse[0].csrf;
        var ROLE = jwtParse[0].role;
        if(JWT_SESSION === session){
            if(ROLE == "admin"){
                var id = req.params.id;
                db.query("DELETE FROM product_category WHERE category_id = ?", [ id ], function(err, results){
                    if(err){
                        res.json({status:"Failed",message:"Something went wrong!"});
                    }
                    res.status(200).json({status:"Success", message : "Category Deleted!"})
                })
            }
            else{
                res.status(200).json({status:"Failed", message : "Permission Denied !"});
            }
        }
        else{
            res.sendStatus(404);
        }
    }
    else{
        res.sendStatus(404);
    }
})


module.exports = router;
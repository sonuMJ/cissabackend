const express = require('express');
const router = express.Router();
const db = require('../db/dbconnection');
const { check, validationResult } = require('express-validator/check')
const misc= require("../Misc/Misc");
const jwt = require("../security/Jwt");

router.get("/getcategory", function(req, res){
    db.query("SELECT * FROM product_category WHERE category_id != 'NONE'", function(err,result){
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
            check('name').isLength({min:1, max:30}).not().isEmpty()
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
                    URL = "SELECT * FROM permission WHERE permission_id = ?";
                    db.query(URL,[jwtParse[0]._pid], function(err, result){
                        if(err){
                            console.log(err);
                        }
                        var permission = (result[0].c_create == "true");
                        if(permission){
                            var input = req.body;
                            var data = {
                                name:input.name,
                                category_id: misc.RandomCategoryID()
                            }
                            const error = validationResult(req);
                                if(!error.isEmpty()){
                                    res.status(200).json({status:"Failed",message : "Data validation error!"});
                                }else{
                                    db.query("INSERT INTO product_category SET ?",[data], function(err, result){
                                        if(err){
                                            console.log(err);
                                            res.json({status:"Failed",message : "Failed to add category!"});
                                        }
                                        res.status(200).json({status:"Success",message : "A new category has been added!"});
                                    })
                                }
                            }
                            else{
                                res.status(200).json({status:"Failed", message : "Permission Denied !"});
                            }
                    });
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
            URL = "SELECT * FROM permission WHERE permission_id = ?";
            db.query(URL,[jwtParse[0]._pid], function(err, result){
                if(err){
                    console.log(err);
                }
                var permission = (result[0].c_delete == "true");
                if(permission){
                    var id = req.params.id;
                    db.query("UPDATE products set category_id = 'NONE' WHERE category_id = ?", [id], function(err, result){
                        if(err){
                            res.json({message:"Somthing went wrong!"});
                        }
                        else{
                            db.query("DELETE FROM product_category WHERE category_id = ?", [ id ], function(err, results){
                                if(err){
                                    res.json({status:"Failed",message:"Something went wrong!"});
                                }
                                res.status(200).json({status:"Success", message : "Category Deleted!"})
                            })
                        }
                    })
                }
                else{
                    res.status(200).json({status:"Failed", message : "Permission Denied !"});
                }
            });

        }
        else{
            res.sendStatus(404);
        }
    }
    else{
        res.sendStatus(404);
    }
})
//update name
router.put("/:id", function(req, res){
    var token = req.headers.token;
    var session = req.headers.sessionid;
    var validToken = jwt.JWTVerify(token);
    if(validToken){
        var jwtParse = jwt.JWTParse(token);
        var JWT_SESSION = jwtParse[0].csrf;
        if(JWT_SESSION === session){
            URL = "SELECT * FROM permission WHERE permission_id = ?";
            db.query(URL,[jwtParse[0]._pid], function(err, result){
                if(err){
                    console.log(err);
                }
                var permission = (result[0].c_alter == "true");
                if(permission){
                    var id = req.params.id;
                    var name = req.body.category_name;
                    db.query("UPDATE product_category set name = ? WHERE category_id = ?", [name, id], function(err, result){
                        if(err){
                            res.json({status:"Failed",message:"Somthing went wrong!"});
                        }
                        res.status(200).json({status:"Success",message : "Category name changed!"})
                    })
                }
                else{
                    res.status(200).json({status:"Failed", message : "Permission Denied !"});
                }
            });

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
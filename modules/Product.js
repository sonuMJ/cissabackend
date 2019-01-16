const express = require('express');
const db = require("../db/dbconnection");
const misc = require("../Misc/Misc");
const { check, validationResult } = require('express-validator/check')
const router = express.Router();
const redis = require('redis');
const jwt = require("../security/Jwt");
const mail = require('../Mail/MailService');
const dbservice = require('../db/Dbservice');

var client = redis.createClient();


//get all products 
router.get("/getall/:category", function(req, res){
    var category = req.params.category;
    console.log(category);
    var URL = "SELECT * FROM products";
    if(category === "all"){
        URL = "SELECT * FROM products";
        db.query(URL, function(err, result){
            if(err){
                console.log(err);
            }
            res.status(200).json(result);
        })
    }else{
        URL = "SELECT * FROM products WHERE category =?";
        db.query(URL,[category], function(err, result){
            if(err){
                console.log(err);
            }
            res.status(200).json(result);
        })
    }
    
})
//get product by id
router.get("/get/:id", function(req, res){
    var id = req.params.id;
    console.log(id);
    db.query("SELECT * FROM products WHERE product_id =?",[id] ,function(err, result){
        if(err){
            res.json({message:"Somthing went wrong!"});

        }
        res.status(200).json(result);
    })
})

//search product

// router.post("/search", function(req, res){
//     var searchStr = req.body.search;
//     db.query("SELECT * FROM products WHERE name LIKE  ?",['%'+searchStr+'%'] ,function(err, result){
//         if(err){
//             console.log(err);
//         }
//         res.json(result);
//     })
// })

router.post('/search',(req,res) => {
    console.log('\n====================================');
    console.log("Connected to /search \t Method:POST"); 
    var search_query = req.body.search_query;
    console.log("Search query \t"+search_query);
    var post_query = "SELECT * FROM products WHERE MATCH(name)AGAINST(? IN NATURAL LANGUAGE MODE)";
    db.query(post_query,search_query, function (err, result) {
        if(err){
            console.log(err);
        }
        res.json(result);
    }); 
    console.log('====================================');
  });

  router.get('/search_p/:query',(req,res) => {
    var search_query = req.params.query;
    if(search_query != ""){
        db.query("SELECT * FROM products WHERE name LIKE  ?",[search_query+'%'] ,function(err, result){
            if(err){
                console.log(err);
            }
            res.json(result);
        })
    }else{
        res.sendStatus(404);
    }
  });

//post products
router.post("/send",
        [
            check('name').isLength({min:2, max:30}).not().isEmpty(),
            check('price').not().isEmpty().isLength({min:1, max:8}).isNumeric().withMessage("Must be a numeric value"),
            check('quantity').not().isEmpty().isLength({min:1, max:8}),
            check('availability').not().isEmpty().isBoolean().withMessage("Must be Boolean"),
            check('traslated').isLength({max : 20})
        ]
        , function(req, res){
            var input = req.body;
            var product_id = misc.RandomProductID();
            var data = {
                name:input.name,
                price:input.price,
                quantity:input.quantity,
                img_url: input.img_url,
                availability: input.availability,
                product_id: product_id,
                translated : input.translated,
                category:input.category
            }
            const error = validationResult(req);
                if(!error.isEmpty()){
                    res.status(422).json({errors : error.array()})
                }else{
                    db.query("INSERT INTO products SET ?",[data], function(err, result){
                        if(err){
                            console.log(err);
                            res.json({message : "Failed to add product!"});
                        }
                        res.status(200).json({message : "Product successfully added!"});
                    })
                }
            
})

//update product
router.put("/:id", function(req, res){
    var id = req.params.id;
    var input = req.body;
    var data = {
        name:input.name,
        price:input.price,
        quantity:input.quantity,
        img_url: input.img_url,
        translated : input.translated,
        category:input.category
    }
    db.query("UPDATE products set ? WHERE product_id = ?",[data,id], function(err, result){
        if(err){
            console.log(err);
            res.json({message:"Somthing went wrong!"});
        }
        res.status(200).json({message : "Product updated successfully!"});
    })
})

//update availability
router.put("/availabiltiy/:id", function(req, res){
    var id = req.params.id;
    var status = req.body.status;
    var av = "";
    if(status){
        av = "true";
    }else{
        av = "false";
    }
    db.query("UPDATE products set availability = ? WHERE product_id = ?", [av, id], function(err, result){
        if(err){
            res.json({message:"Somthing went wrong!"});
        }
        res.status(200).json({message : "Successfully Changed!"})
    })
})



//delete products
router.delete("/:id", function(req, res){
    var id = req.params.id;
    db.query("DELETE FROM products WHERE product_id = ?", [ id ], function(err, results){
        if(err){
            res.json({message:"Something went wrong!"});
        }
        res.status(200).json({message : "Successfully Deleted!"})
    })
})

//store multiple products
/*
    product id
    qty
    orderid
    date
*/
function nextDate(dayIndex) {
    var today = new Date();
    today.setDate(today.getDate() + (dayIndex - 1 - today.getDay() + 7) % 7 + 1);
    return today;
}
router.post("/orderproducts", function(req, res){
    var KEY = req.headers._cid;
    var TOKEN = req.headers.token;
    var SESSIONID = req.headers.sessionid;
    if(KEY != undefined && TOKEN != undefined && SESSIONID != undefined){
        var valid_token = jwt.JWTVerify(TOKEN);
        var TOKEN_DATA = jwt.JWTParse(TOKEN);
        
        if(valid_token){
            var JWT_SESSION = TOKEN_DATA[0].csrf;
            if(JWT_SESSION === SESSIONID){
                var USER_ID = TOKEN_DATA[0]._i;
                var JSON_RESULT=[];
                var fetched = false;
                var orderProducts = [];
                var orderId = misc.RandomOrderID();
                var bulkSave = false;
                var d = new Date();
                client.get(KEY, function(err, result){
                    if(err){
                        res.json({message: "Something went wrong!!"});
                    }
                    fetched = true;
                    JSON_RESULT = JSON.parse(result);
                    
                })
                setTimeout(() => {
                    if(fetched){
                        
                        JSON_RESULT.map(i => {
                            var order = [];
                            order.push(parseInt(orderId));
                            order.push(i.productId);
                            order.push(i.quantity);
                            order.push(d.getTime());
                            orderProducts.push(order);
                        })
                        db.query("INSERT INTO order_details(orderid,productid,quantity,date) VALUES ?", [orderProducts], function(err,result){
                            if(err){
                                res.sendStatus(304);
                            }
                            bulkSave = true;
                        })
                        setTimeout(() => {
                            if(bulkSave){
                                var orderData = {
                                    orderid:orderId,
                                    userid: USER_ID,
                                    date:d.getTime(),
                                    status:"not delivered"
                                }
                                db.query("INSERT INTO orders SET ?", [orderData], function(err, result){
                                    if(err){
                                        res.json({message: "Failed to add orders!!"});
                                    }
                                    if(result){
                                        client.del(KEY, function(err,reply){
                                            
                                        })
                                        // mail
                                        var userDetails = dbservice.UserdetailsById(USER_ID);
                                        setTimeout(() => {
                                            var username=''
                                            var email='';
                                            if(userDetails[0] != ""){
                                                userDetails.map(i => {
                                                    username = i[0].username,
                                                    email = i[0].email
                                                    
                                                })
                                                var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                                                var month = months[d.getMonth()];
                                                var time = d.getDate() +" "+month + " "+d.getFullYear();
                                                setTimeout(() => {
                                                    
                                                    mail.Orderpurchase(email,username,orderId, time);
                                                }, 1000);
                                            
                                            }
                                        }, 200);
                                        
                                        
                                        
                                        


                                        //response
                                        res.json({message: "Successfully Purchased!!"});
                                    }else{
                                        res.json({message: "Failed to add orders!!"});
                                    }
                                })
                            }else{
                                res.json({message: "Failed to add orders!!"});
                            }
                        }, 100);
                    }else{
                        res.json({message: "No orders found!!"});
                    }
                }, 100);
            }else{
                res.sendStatus(404);
            }
        }else{
            res.sendStatus(404);
        }
    }else{
        res.sendStatus(404);
    }
    
})

router.post("/reorder", function(req, res){
    var TOKEN = req.headers.token;
    var SESSIONID = req.headers.sessionid;
    if(TOKEN != undefined && SESSIONID != undefined){
        var valid_token = jwt.JWTVerify(TOKEN);
        var TOKEN_DATA = jwt.JWTParse(TOKEN);
        if(valid_token){
            var USER_ID = TOKEN_DATA[0]._i;
            var orderId = req.body.orderid;
            var neworderId = misc.RandomOrderID();
            var d = new Date();
            var orderProducts = [];
            var bulkSave = false;
            if(orderId != ""){
                db.query("SELECT * FROM order_details WHERE orderid = ?",[orderId], function(err, result){
                    if(!err){
                        result.map(i => {
                            var order = [];
                            order.push(parseInt(neworderId));
                            order.push(i.productid);
                            order.push(i.quantity);
                            order.push(d.getTime());
                            orderProducts.push(order);
                        })
                        
                        db.query("INSERT INTO order_details(orderid,productid,quantity,date) VALUES ?", [orderProducts], function(err,result){
                            if(err){
                                res.sendStatus(304);
                            }else{
                                bulkSave = true;
                            }
                            
                        })
                        setTimeout(() => {
                            if(bulkSave){
                                var orderData = {
                                    orderid:neworderId,
                                    userid: USER_ID,
                                    date:d.getTime(),
                                    status:"not delivered"
                                }
                                db.query("INSERT INTO orders SET ?", [orderData], function(err, result){
                                    if(err){
                                        res.json({message: "Failed to add orders!!"});
                                    }else{
                                        res.json({message:"Successfully Re-ordered your purchase!!"})
                                    }
                                })
                            }else{
                                re.sendStatus(404);
                            } 
                        }, 200);
                    }else{
                        res.json({message:"no data!"})
                    }
                })
            }
        }else{
            res.sendStatus(404);
        } 
    }else{
        res.sendStatus(404);
    }
})

module.exports = router;
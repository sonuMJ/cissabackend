const express = require('express');
const db = require("../db/dbconnection");
const misc = require("../Misc/Misc");
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const redis = require('redis');
const jwt = require("../security/Jwt");
const mail = require('../Mail/MailService');
const dbservice = require('../db/Dbservice');
var formidable = require('formidable');
var fs = require("fs");
const QR = require("../Mail/QRcode");

var client = redis.createClient();


//get all products 
router.get("/getall/:category", function(req, res){
    var category = req.params.category;
    var URL = "";
    if(category == 0){
        URL = "SELECT * FROM products WHERE availability = 'true'";
        db.query(URL, function(err, result){
            if(err){
                console.log(err);
            }
            res.status(200).json(result);
        })
    }else{
        URL = "SELECT * FROM products WHERE category_id = ? AND availability = 'true'";
        db.query(URL,[category], function(err, result){
            if(err){
                console.log(err);
            }
            res.status(200).json(result);
        })
    }
    
})
//check availability
router.post("/checkavailability", function(req, res){
    var KEY = req.headers._cid;
    var JSON_RESULT;
    var available= [];
    client.get(KEY, function(err, result){
        if(err){
            res.json({message: "Something went wrong!!"});
        }
        fetched = true;
        JSON_RESULT = JSON.parse(result);
        
    })
    setTimeout(() => {
        if(fetched){
            if(JSON_RESULT != ""){
                JSON_RESULT.map(item => {
                    db.query("SELECT availability from products WHERE product_id =?",[item.productId],function(err,result){
                            if(result != ""){
                                if(result[0].availability != "true"){
                                    available.push(item);
                                }
                            }
                        })
                })
                setTimeout(() => {
                    res.json(available);
                }, 200);
                
            }else{
                res.json("no data")
            }
            
        }
    }, 100);
    
    
    // if(product_id !== ""){
    //     db.query("SELECT availability from products WHERE product_id =?",[product_id],function(err,result){
    //         if(result != ""){
    //             if(result[0].availability==="true"){
    //                 res.sendStatus(200);
    //             }else{
    //                 res.sendStatus(406)
    //             }
    //         }else{
    //             res.sendStatus(406)
    //         }
    //     })
    // }
})

router.post("/getproductsbyorderid",function(req, res){
    var orderId = req.body.orderid;
    
    var KEY = req.headers._cid;
    var JSON_RESULT;
    var available= [];
    fetched = false;
    db.query("SELECT * FROM order_details WHERE orderid = ?",[orderId], function(err, result){
        if(err){
            res.sendStatus(404);
        }
        JSON_RESULT = JSON.parse(JSON.stringify(result));
        fetched = true;
        console.log(JSON_RESULT);
        
    })
    setTimeout(() => {
        if(fetched){
            if(JSON_RESULT != ""){
                JSON_RESULT.map(item => {
                    console.log(item.quantity);
                    
                    db.query("SELECT availability from products WHERE product_id =?",[item.productid],function(err,result){
                            if(result != ""){
                                if(result[0].availability != "false"){
                                    db.query("SELECT * from products WHERE product_id =?",[item.productid],function(err,result){
                                        if(result != ""){
                                            available.push({"product":result[0],"qty":item.quantity});
                                        }
                                    })
                                }
                            }
                        })
                })
                setTimeout(() => {
                    res.json(available);
                }, 200);
                
            }else{
                res.json("no data")
            }
            
        }
    }, 100);
})


//get all products ====> admin
router.get("/getall", function(req, res){
    var CARTID = misc.RandomUserCartID();
    db.query("SELECT products.id,TRIM(products.name) as name,product_category.name as category_name,products.price,products.quantity,products.img_url,products.availability,products.product_id,products.translated FROM products INNER JOIN product_category ON product_category.category_id = products.category_id", function(err, result){
        if(err){
            console.log(err);
        }
        res.status(200).json(result);
    })
})
//get product by id
router.get("/get/:id", function(req, res){
    var id = req.params.id;
    db.query("SELECT * FROM products WHERE product_id =?",[id] ,function(err, result){
        if(err){
            res.json({message:"Somthing went wrong!"});

        }
        res.status(200).json(result);
    })
})

//get product by id ====> admin
router.get("/getproductbyid/:id", function(req, res){
    var id = req.params.id;
    console.log(id);
    db.query("SELECT products.id,products.name,product_category.name as category_name,products.price,products.quantity,products.img_url,products.availability,products.product_id,products.translated FROM products INNER JOIN product_category ON product_category.category_id = products.category_id WHERE products.product_id =?",[id] ,function(err, result){
        if(err){
            res.json({status:"Failed",message:"Somthing went wrong!"});
        }
        else {
            res.status(200).json(result);
        }
        
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

router.get('/search/:query',(req,res) => {
    var search_query = req.params.query;
    console.log("Search query \t"+search_query);
    var post_query = "SELECT products.id,TRIM(products.name) as name,product_category.name as category_name,products.price,products.quantity,products.img_url,products.availability,products.product_id,products.translated FROM products INNER JOIN product_category ON product_category.category_id = products.category_id WHERE products.name LIKE  ?";
    db.query(post_query,['%'+search_query+'%'], function (err, result) {
        if(err){
            console.log(err);
        }
        res.json(result);
    }); 
  });

  router.get('/search_p/:query',(req,res) => {
    var search_query = req.params.query;
    if(search_query != ""){
        db.query("SELECT * FROM products WHERE availability = 'true' and  name LIKE  ?",['%'+search_query+'%'] ,function(err, result){
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
//post products
router.post("/send",
        [
            check('name').isLength({min:2, max:30}).not().isEmpty(),
            check('price').not().isEmpty().isLength({min:1, max:8}).isNumeric(),
            check('quantity').not().isEmpty(),
            check('availability').not().isEmpty().isBoolean().withMessage("Must be Boolean"),
            check('translated').isLength({max : 20})
        ]
        , function(req, res){
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
                        var permission = (result[0].p_create == "true");
                        if(permission){
                            var input = req.body;
                            var data = {
                                name:input.name,
                                category_id: input.category_id,
                                price:input.price,
                                quantity:input.quantity+" "+input.unit,
                                img_url: input.img_url,
                                availability: input.availability,
                                product_id: input.product_id,
                                translated : input.translated
                            }
                            if(data.product_id == ""){
                                data.product_id = misc.RandomProductID();
                            }
                            const error = validationResult(req);
							console.log(error.array());
                                if(!error.isEmpty()){
                                    res.status(200).json({status:"Failed", message : error.array()[0].param+": "+error.array()[0].msg});
                                }else{
                                    db.query("INSERT INTO products SET ?",[data], function(err, result){
                                        if(err){
                                            console.log(err);
                                            res.json({status:"Failed", message : "Failed to add product!"});
                                        }
                                        res.status(200).json({status:"Success", message : "New product added!"});
                                    })
                                }
                        }
                        else{
                            res.status(200).json({status:"Failed", message : "Permission Denied !"});
                        }
                    })
                }
                else{
                    res.sendStatus(404);
                }
            }
            else{
                res.sendStatus(404);
            }

            
})
//upload file
router.post("/upload",function(req,res){
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
                var permission = (result[0].p_create == "true");
                if(permission){
                    var form = new formidable.IncomingForm();
                    form.parse(req, function (err, fields, files) {
                        var product_id = misc.RandomProductID();
                        var oldpath = files.file.path;
                        var fileext = files.file.type.split("/");
                        var newpath = './data/images/' +product_id +"."+fileext[1];
						var calc_path = '/'+product_id +"."+fileext[1];
                        console.log('====================================');
                        console.log(files);
                        console.log(fields);
                        console.log(oldpath);
                        console.log(newpath);
                        console.log('====================================');
                        fs.rename(oldpath, newpath, function (err) {
                            if (err) throw err;
                            res.status(200).json(
                                {
                                    message : "Product updated successfully!",
                                    product_id: product_id,
                                    path: calc_path
                                }
                                );
                          });
                    });
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
//update image
router.post("/updateimg",function(req,res){
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
                var permission = (result[0].p_alter == "true");
                if(permission){
                    var form = new formidable.IncomingForm();
                    form.parse(req, function (err, fields, files) {
                        var product_id = fields.product_id;
                        var old_img = "./data/images/"+fields.old_img;
                        var oldpath = files.file.path;
                        var fileext = files.file.type.split("/");
                        var newpath = './data/images/' +product_id +"."+fileext[1];
						var calc_path = '/'+product_id +"."+fileext[1];
                        console.log('====================================');
                        console.log(files);
                        console.log(fields);
                        console.log(oldpath);
                        console.log(newpath);
                        console.log('====================================');
                        fs.unlink(old_img, (err) => {
                            if (err){}
                            fs.rename(oldpath, newpath, function (err) {
                                if (err) throw err;
                                res.status(200).json(
                                    {
                                        message : "Product updated successfully!",
                                        product_id: product_id,
                                        path: calc_path
                                    }
                                    );
                              });
                          });
                    });
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
//update product
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
                var permission = (result[0].p_alter == "true");
                if(permission){
                    var id = req.params.id;
                    var input = req.body;
                    var data = {
                        name:input.name,
                        category_id: input.category_id,
                        price:input.price,
                        quantity:input.quantity,
                        img_url: input.img_url,
                        translated : input.translated
                    }
                    db.query("UPDATE products set ? WHERE product_id = ?",[data,id], function(err, result){
                        if(err){
                            console.log(err);
                            res.json({status:"Failed",message:"Somthing went wrong!"});
                        }
                        res.status(200).json({status:"Success",message : "Product updated successfully!"});
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

//update availability
router.put("/availability/:id", function(req, res){
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
                var permission = (result[0].p_alter == "true");
                if(permission){
                    var id = req.params.id;
                    var status = req.body.status;
					var name = req.body.name;
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
						if(av=="true"){
							res.status(200).json({status:"Success",message : name+" is now made available !"})
						}
						if(av=="false"){
							res.status(200).json({status:"Success",message : name+" is now unavailable !"})
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



//delete products
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
                var permission = (result[0].p_delete == "true");
                if(permission){
					var old_img = "./data/images/"+req.headers.old_img;
					fs.unlink(old_img, (err) => {
						if (err){}
						var id = req.params.id;
						var name = req.headers.name;
						db.query("DELETE FROM products WHERE product_id = ?", [ id ], function(err, results){
							if(err){
								res.json({message:"Something went wrong!"});
							}
							res.status(200).json({status:"Success",message : name+" has been successfully removed!"})
						})
					});
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
    const SCHEDULED_DAY = 1; //1 => monday
    var KEY = req.headers._cid;
    var TOKEN = req.headers.token;
    var SESSIONID = req.headers.sessionid;
	var STORE_LOCATION = req.headers.loc;
    if(KEY != undefined && TOKEN != undefined && SESSIONID != undefined && STORE_LOCATION !== undefined){
        var valid_token = jwt.JWTVerify(TOKEN);
        var TOKEN_DATA = jwt.JWTParse(TOKEN);
        
        if(valid_token){
            console.log("valid token");
            
            var JWT_SESSION = TOKEN_DATA[0].csrf;
            if(JWT_SESSION === SESSIONID){
                var USER_ID = TOKEN_DATA[0]._i;
                var JSON_RESULT=[];
                var fetched = false;
                var orderProducts = [];
                var orderId = misc.RandomOrderID();
                var bulkSave = false;
				var STORE_NAME = "";
                var STORE_ADDRESS = "";
                var d = new Date();
                // scheduled for 
                var sDate = new Date();
                var scheduledDate = sDate.setDate(d.getDate() + + (SCHEDULED_DAY - 1 - d.getDay() + 7) % 7 + 1);

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
                                console.log(err);
                                
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
                                    scheduled_date:scheduledDate,
                                    status:"Pending Delivery",
									store:STORE_LOCATION
                                }
                                db.query("INSERT INTO orders SET ?", [orderData], function(err, result){
                                    if(err){
                                        res.json({message: "Failed to add orders!!"});
                                    }
                                    if(result){
                                        client.del(KEY, function(err,reply){
                                            
                                        })
										// QR code
										var qrPng = QR.CreateQRcode(orderId);
                                        // mail
                                        var userDetails = dbservice.UserdetailsById(USER_ID);
										// get store location
                                        var locationString = "";
                                        db.query("SELECT l_name as name, l_address as address FROM store_location WHERE l_abbr = ?", [STORE_LOCATION], function(err, array){
                                            if(!err){
                                                locationString = array[0].name +"$"+array[0].address;
                                            }
                                        })
                                        setTimeout(() => {
                                            if(locationString !== undefined){
                                                var _store = locationString.split("$");
                                                STORE_NAME = _store[0];
                                                STORE_ADDRESS = _store[1];
                                            }
                                            
                                        }, 100);
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
                                                var s_date = new Date(scheduledDate); 
                                                var s_month = months[s_date.getMonth()];
                                                var full_s_date = s_date.getDate() + " " + s_month + " " +s_date.getFullYear();
                                                
                                                setTimeout(() => {
                                                    var emailData = [];
                                                    db.query("SELECT products.name, order_details.quantity,products.price,order_details.quantity * products.price as 'total' FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE orders.orderid = ?", [orderId], function(err, array){
                                                        
                                                        if(!err){
                                                            emailData.push(array);
                                                        }
                                                    })
                                                    setTimeout(() => {
                                                        var emailParseData = JSON.parse(JSON.stringify(emailData[0]));
														var totalPrice = 0;
                                                        emailParseData.map(item => {
                                                            totalPrice += parseInt(item.total);
                                                        })
                                                        mail.Orderpurchase(email,username,orderId, time,full_s_date,emailParseData,totalPrice,STORE_NAME,STORE_ADDRESS);
                                                    }, 100);
                                                   
                                                }, 1000);
                                            
                                            }
                                        }, 200);
                                        
                                        
                                        
                                        
                                        
                                        

                                        //response
                                        res.json({message: "Successfully Purchased!!",statuscode:200});
                                    }else{
                                        res.json({message: "Failed to add orders!!",statuscode:400});
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
    const SCHEDULED_DAY = 1; //1 => monday
    var TOKEN = req.headers.token;
    var SESSIONID = req.headers.sessionid;
	var STORE_LOCATION = req.headers.loc;
    if(TOKEN != undefined && SESSIONID != undefined && STORE_LOCATION !== undefined){
        var valid_token = jwt.JWTVerify(TOKEN);
        var TOKEN_DATA = jwt.JWTParse(TOKEN);
        if(valid_token){
            console.log("works");
            //console.log(req.body.data);
            var productData = req.body.data;
            
            
            var USER_ID = TOKEN_DATA[0]._i;
            var neworderId = misc.RandomOrderID();
            var d = new Date();
            // scheduled for 
            var sDate = new Date();
            var scheduledDate = sDate.setDate(d.getDate() + + (SCHEDULED_DAY - 1 - d.getDay() + 7) % 7 + 1);
            var dd = new Date(scheduledDate);
            var orderProducts = [];
            var bulkSave = false;
			var STORE_NAME = "";
            var STORE_ADDRESS = "";
            if(productData != ""){
                        productData.map(i => {
                            var order = [];
                            order.push(parseInt(neworderId));
                            order.push(i.product.product_id);
                            order.push(parseInt(i.qty));
                            order.push(d.getTime());
                            orderProducts.push(order);
                            
                            
                        })
                        console.log(orderProducts);
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
                                scheduled_date:scheduledDate,
                                status:"Pending Delivery",
								store:STORE_LOCATION
                            }
                            db.query("INSERT INTO orders SET ?", [orderData], function(err, result){
                                if(err){
                                    res.json({message: "Failed to add orders!!"});
                                }else{
                                    // QR code
									var qrPng = QR.CreateQRcode(neworderId);
                                    var userDetails = dbservice.UserdetailsById(USER_ID);
									//location
									var locationString = "";
									db.query("SELECT l_name as name, l_address as address FROM store_location WHERE l_abbr = ?", [STORE_LOCATION], function(err, array){
										if(!err){
											locationString = array[0].name +"$"+array[0].address;
										}
									})
									setTimeout(() => {
										if(locationString !== undefined){
											var _store = locationString.split("$");
											STORE_NAME = _store[0];
											STORE_ADDRESS = _store[1];
										}
										
									}, 100);
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
                                            var s_date = new Date(scheduledDate); 
                                            var s_month = months[s_date.getMonth()];
                                            var full_s_date = s_date.getDate() + " " + s_month + " " +s_date.getFullYear();
                                            
                                            setTimeout(() => {
                                                var emailData = [];
                                                db.query("SELECT products.name, order_details.quantity,products.price,order_details.quantity * products.price as 'total' FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE orders.orderid = ?", [neworderId], function(err, array){
                                                    
                                                    if(!err){
                                                        emailData.push(array);
                                                    }
                                                })
                                                setTimeout(() => {
                                                    var emailParseData = JSON.parse(JSON.stringify(emailData[0]));
                                                    var totalPrice = 0;
                                                    emailParseData.map(item => {
                                                        totalPrice += parseInt(item.total);
                                                    })
                                                    mail.Orderpurchase(email,username,neworderId, time,full_s_date,emailParseData,totalPrice,STORE_NAME,STORE_ADDRESS);
                                                }, 100);
                                                
                                            }, 1000);
                                        
                                        }
                                    }, 200);
                                    res.json({message:"Successfully Re-ordered your purchase!!"})
                                }
                            })
                        }else{
                            re.sendStatus(404);
                        } 
                    }, 200);
            }
        }else{
            res.sendStatus(404);
        } 
    }else{
        res.sendStatus(404);
    }
})

module.exports = router;
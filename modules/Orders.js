const express = require('express');
const router = express.Router();
const jwt = require("../security/Jwt");
const db = require("../db/dbconnection");
const mail = require("../Mail/MailService")
const dbservice = require('../db/Dbservice');

//get all orders by user id
 /* router.post("/orderbyid", function(req, res){
    var token = req.headers.token;
    var session = req.headers.sessionid;
    var validToken = jwt.JWTVerify(token);
    if(validToken){
        var jwtParse = jwt.JWTParse(token);
        var JWT_SESSION = jwtParse[0].csrf;
        var USER_ID = jwtParse[0]._i;
        if(JWT_SESSION === session){
            //SELECT * FROM `orders` ORDER BY CAST(date as signed) DESC
            db.query("SELECT * FROM orders WHERE userid = ? ORDER BY CAST(date as signed) DESC", [USER_ID], function(err, array){
                if(!err){
                    res.json(array);
                }else{
                    console.log(err);
                }
            })
        }else{
            res.sendStatus(404);
        }
    }else{
        res.sendStatus(404);
    }
}) 
*/
 router.post("/orderbyid", function(req, res){
    // SELECT order_details.id,orders.orderid,orders.scheduled_date,orders.status,order_details.productid,products.name, (products.price * order_details.quantity) as total,CONCAT(CONCAT((order_details.quantity * products.quantity),' '),SUBSTRING_INDEX(SUBSTRING_INDEX(products.quantity, ' ', 2), ' ', -1)) as quantity,products.price, order_details.date FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE orders.userid = ? order by CAST(orders.date as SIGNED) DESC
    var token = req.headers.token;
    var session = req.headers.sessionid;
    var validToken = jwt.JWTVerify(token);
    if(validToken){
        var jwtParse = jwt.JWTParse(token);
        var JWT_SESSION = jwtParse[0].csrf;
        var USER_ID = jwtParse[0]._i;
        if(JWT_SESSION === session){
            //SELECT * FROM `orders` ORDER BY CAST(date as signed) DESC
            db.query("SELECT order_details.id,orders.orderid,orders.store,(SELECT l_name FROM store_location WHERE l_abbr = orders.store) as store_locaton, orders.scheduled_date,orders.status,order_details.productid,products.name,products.img_url, (products.price * order_details.quantity) as total,products.quantity as quantity,order_details.quantity as order_quantity,CONCAT(CONCAT((order_details.quantity * products.quantity),' '),SUBSTRING_INDEX(SUBSTRING_INDEX(products.quantity, ' ', 2), ' ', -1)) as total_quantity,products.price, order_details.date FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE orders.userid = ? order by CAST(orders.date as SIGNED) DESC", [USER_ID], function(err, array){
                if(!err){
                    res.json(array);
                }else{
                    console.log(err);
                }
            })
        }else{
            res.sendStatus(404);
        }
    }else{
        res.sendStatus(404);
    }
})

router.post("/productsbyorderid", function(req, res){
    var orderId = req.body.orderid;
    if(orderId != undefined){
        var data = [];
        db.query("SELECT * from order_details WHERE orderid = ?", [orderId], function(err, array){
            var usersRows = JSON.parse(JSON.stringify(array));
            if(!err){
                Object.keys(usersRows).map(i => {
                    var product_id = usersRows[i].productid;
                    db.query("SELECT * FROM products WHERE product_id = ?",[product_id], function(err, result){
                        var productRows = JSON.parse(JSON.stringify(result));
                        var it;
                        Object.keys(productRows).map(j => {
                            it = {orderdetails:usersRows[i], productdetails:productRows[j]}
                            data.push(it)
                        })
                    })
                })
            }
            setTimeout(() => {
                res.json(data);
            }, 100);
            
        })
    }
})

router.post("/productdetailformail", function(req, res){
    var orderId = req.body.orderid;
    if(orderId != undefined){
        var data = [];
        db.query("SELECT products.name, order_details.quantity,products.price FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE orders.orderid = ?", [orderId], function(err, array){
            var usersRows = JSON.parse(JSON.stringify(array));
            if(!err){
                res.json(array)
            }
            // setTimeout(() => {
            //     res.json(data);
            // }, 100);
        })
    }
})

router.post("/cancelorder", function(req, res){
    var orderid = req.body.orderid;
    console.log(orderid);
    
    var TOKEN = req.headers.token;
    var SESSIONID = req.headers.sessionid;
    if(TOKEN != undefined && SESSIONID != undefined){
        var valid_token = jwt.JWTVerify(TOKEN);
        var TOKEN_DATA = jwt.JWTParse(TOKEN);
        var cancelStatus = "Cancelled";
        if(valid_token){
            var csrf = TOKEN_DATA[0].csrf;
            var userId = TOKEN_DATA[0]._i;
            if(csrf === SESSIONID){
                var userDetails = dbservice.UserdetailsById(userId);
                var username=''
                var email='';
                setTimeout(() => {
                    if(userDetails[0] != ""){
                        userDetails.map(i => {
                            username = i[0].username,
                            email = i[0].email
                            
                        })
                    }
                    //update status
                    db.query("UPDATE orders set status = ? WHERE orderid = ?", [cancelStatus, orderid], function(err, result){
                        if(!err){
                            setTimeout(() => {
                                console.log(username + "" + email);
                                    var emailData = [];
                                    db.query("SELECT products.name, order_details.quantity,products.price,order_details.quantity * products.price as 'total' FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE orders.orderid = ?", [orderid], function(err, array){
                                        
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
										//send mail
                                        mail.OrdercancelMail(email,username,orderid,emailParseData,totalPrice);
                                    }, 100);
                                   
                                }, 1000);
                                //response
                            res.json({message:"Order successfully cancelled"});
                        }else{
                            console.log(err);
                            
                            res.json({message:"Something went wrong!!"});
                        }
                    })

                }, 100);
            }else{
                res.json({message: "Failed to cancel order!!"});
            }
        }else{
            res.json({message: "Failed to cancel order!!"});
        }
    }
})
router.post("/getall",function(req,res){
    var startDate = req.body.start;
    var endDate = req.body.end;
    db.query("SELECT order_details.id,orders.orderid,user.username,user.email,user.phoneno,orders.scheduled_date,orders.userid,orders.status,order_details.productid,products.name,order_details.quantity,CONCAT(CONCAT((order_details.quantity * products.quantity),' '),SUBSTRING_INDEX(SUBSTRING_INDEX(products.quantity, ' ', 2), ' ', -1)) as quan,products.price, order_details.date FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id INNER JOIN user ON user.user_id=orders.userid WHERE order_details.date BETWEEN ? AND ? ORDER BY IF((orders.status = 'Delivered' || orders.status = 'Cancelled'|| orders.status = 'Picked up') , TRUE,FALSE),CAST(orders.date as SIGNED) DESC",[startDate,endDate], function(err, result){
        if(err){
            console.log(err);
        }
        res.status(200).json(result);
    })
})
router.post("/getByProduct",function(req,res){
    var startDate = req.body.start;
    var endDate = req.body.end;
	console.log(startDate);
	console.log(endDate);
    db.query("SELECT orders.userid,orders.status,order_details.productid,products.name, order_details.quantity,products.price, order_details.date,CONCAT(CONCAT(SUM(CASE WHEN (orders.status = 'Pending Delivery' || orders.status = 'Upcoming pickup') THEN order_details.quantity ELSE 0 END) * products.quantity,' '),SUBSTRING_INDEX(SUBSTRING_INDEX(products.quantity, ' ', 2), ' ', -1)) AS quan FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN user ON user.user_id=orders.userid INNER JOIN products ON order_details.productid = products.product_id WHERE order_details.date BETWEEN ? AND ? GROUP BY order_details.productid HAVING quan != 0 ORDER BY quan DESC",[startDate,endDate], function(err, result){
        if(err){
            console.log(err);
        }
        res.status(200).json(result);
    })
})
router.put("/status/:id", function(req, res){
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
                var permission = (result[0].o_alter == "true");
                if(permission){
                    var id = req.params.id;
                    var status = req.body.status;
					var email = req.body.email;
					var name = req.body.name;
					var o_date = req.body.o_date;
					var s_date = req.body.s_date;
					var total = req.body.total;
					var status_present = "";
					if(status === "Delivered"){
						status_present = "Delivery"
					}
					if(status === "Picked up"){
						status_present = "Pick up"
					}
                    console.log(status+id);
                    db.query("UPDATE orders set status = ? WHERE orderid = ?", [status, id], function(err, result){
                        if(err){
                            res.status(200).json({status:"Failed",message:"Somthing went wrong!"});
                        }
						var emailData = [];
						db.query("SELECT products.name, order_details.quantity,products.price,order_details.quantity * products.price as 'total' FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE orders.orderid = ?", [id], function(err, array){
							
							if(!err){
								emailData.push(array);
							}
						})
						if(status === "Delivered" || status === "Picked up"){
							setTimeout(() => {
							var emailParseData = JSON.parse(JSON.stringify(emailData[0]));
							
							mail.orderStatus(email,name,id,o_date,s_date,emailParseData,total,status_present,status);
						}, 100);
						}
						if(status === "Cancelled"){
							setTimeout(() => {
							var emailParseData = JSON.parse(JSON.stringify(emailData[0]));
							
							mail.OrdercancelMail("deepak.sowibo@gmail.com",name,id,emailParseData,total);
						}, 100);
						}
                        res.status(200).json({status:"Success",message : "Order Status Changed!"})
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
router.post("/removeOrderProduct", function(req, res){
    //delete from order_details
    var orderid = req.body.orderid;
    var productid = req.body.productid;
    if(orderid !== ""&& productid !== ""){
        db.query("DELETE FROM order_details WHERE orderid = ? AND productid = ?", [orderid, productid], function(err, result){
            if(err){
                res.sendStatus(404)
            }else{
                res.json({message:"Product Deleted!"});
            }
        })
    }else{
        res.sendStatus(404);
    }
})
router.post("/rmvunwantedorder", function(req, res){
    var orderid = req.body.orderid;
    if(orderid !== ""){
        db.query("DELETE FROM orders WHERE orderid = ? ",[orderid] ,function(err, result){
            if(err){
                console.log(err);
                
                res.sendStatus(404);
            }else{
                res.json("Order deleted!")
            }
        })
    }else{
        res.sendStatus(404);
    }
})


module.exports = router;
const express = require('express');
const router = express.Router();
const jwt = require("../security/Jwt");
const db = require("../db/dbconnection");

//get all orders by user id
router.post("/orderbyid", function(req, res){
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
        var cancelStatus = "cancelled";
        if(valid_token){
            //update status
            db.query("UPDATE orders set status = ? WHERE orderid = ? ", [cancelStatus, orderid], function(err, result){
                if(!err){
                    res.json({message:"Order successfully cancelled"});
                }else{
                    console.log(err);
                    
                    res.json({message:"Something went wrong!!"});
                }
            })
        }else{
            res.json({message: "Failed to cancel order!!"});
        }
    }
})
router.post("/getall",function(req,res){
    console.log(req);
    var startDate = req.body.start;
    var endDate = req.body.end;
    console.log('====================================');
    console.log("order/getall");
    console.log(startDate);
    console.log(endDate);
    
    console.log('====================================');

    db.query("SELECT order_details.id,orders.orderid,orders.userid,orders.status,order_details.productid,products.name, order_details.quantity,products.price, order_details.date FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE order_details.date BETWEEN ? AND ? ORDER BY IF((orders.status = 'Delivered' || orders.status = 'Cancelled'|| orders.status = 'Picked up') , TRUE,FALSE),CAST(orders.date as SIGNED) DESC",[startDate,endDate], function(err, result){
        if(err){
            console.log(err);
        }
        res.status(200).json(result);
    })
})
router.post("/getByProduct",function(req,res){
    console.log(req);
    var startDate = req.body.start;
    var endDate = req.body.end;
    console.log('====================================');
    console.log("order/getall");
    console.log(startDate);
    console.log(endDate);
    
    console.log('====================================');

    db.query("SELECT orders.userid,orders.status,order_details.productid,products.name, order_details.quantity,products.price, order_details.date,SUM(CASE WHEN (orders.status = 'Pending Delivery' || orders.status = 'Upcoming pickup') THEN order_details.quantity ELSE 0 END) AS quan FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE order_details.date BETWEEN ? AND ? GROUP BY order_details.productid HAVING quan != 0 ORDER BY quan DESC ",[startDate,endDate], function(err, result){
        if(err){
            console.log(err);
        }
        res.status(200).json(result);
    })
})
router.put("/status/:id", function(req, res){
    
    var id = req.params.id;
    var status = req.body.status;
    console.log(status+id);
    db.query("UPDATE orders set status = ? WHERE orderid = ?", [status, id], function(err, result){
        if(err){
            res.json({message:"Somthing went wrong!"});
        }
        res.status(200).json({message : "Successfully Changed!"})
    })
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
    console.log(orderid);
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
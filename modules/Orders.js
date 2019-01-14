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

router.post("/cancelorder", function(req, res){
    var orderid = req.body.orderid;
    console.log(orderid);
    
    var TOKEN = req.headers.token;
    var SESSIONID = req.headers.sessionid;
    if(TOKEN != undefined && SESSIONID != undefined){
        var valid_token = jwt.JWTVerify(TOKEN);
        var TOKEN_DATA = jwt.JWTParse(TOKEN);
        console.log(SESSIONID);
        var cancelStatus = "cancelled";
        if(valid_token){
            //update status
            db.query("UPDATE orders set status = ? WHERE orderid = ? ", [cancelStatus, orderid], function(err, result){
                if(!err){
                    console.log(result);
                    
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



module.exports = router;
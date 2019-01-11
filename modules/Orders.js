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
            //
            db.query("SELECT * FROM orders WHERE userid = ?", [USER_ID], function(err, array){
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



module.exports = router;
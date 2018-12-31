const express = require('express');
const router = express.Router();
const misc = require('../Misc/Misc');
const redis = require('redis');
const db = require('../db/dbconnection');

var client = redis.createClient();

router.post('/__s', function(req, res){
    var _cartID = misc.RandomCartID();
    res.send(_cartID);
    
    //product id
    //product details
    // var id = req.body.prod_id;
    // var qty = req.body.quantity;
    // var product_data = "";
    
    // db.query("SELECT * FROM products WHERE product_id =?",[id] ,function(err, result){
    //     if(err){
    //         res.json({message:"Somthing went wrong!"});
    //     }
    //     product_data = result;
        
    // })
    
    // setTimeout(() => {
    //     client.hmset(_cartID, {
    //         id:id,
    //         product_details: JSON.stringify(product_data),
    //         quantity:1,
    //         key:_cartID
    //     },function(err, reply){
    //         if(err){
    //             console.log(err);
    //         }
    //         //res.send(reply)
    //         client.hgetall(_cartID, function(err, obj){
    //             if(err){
    //                 console.log(err);
    //             }
    //             res.send((obj))
    //         })
    //     })
    // }, 100);
})
router.post('/__g', function(req, res){
    //product id
    //product details
    var c_id = req.body.cart_id
    client.hgetall(c_id, function(err, obj){
        if(!obj == ""){
            if(err){
                console.log(err);
            }
            res.send((obj))
        }else{
            res.send("no data")
        }
    })
})
router.delete("/__d/:cart_id", function(req, res){
    var c_id = req.params.cart_id;
    client.del(c_id, function(err,reply){
        if(!err) {
            if(reply === 1) {
                res.send("deleted")
            } else {
                res.send("Does't exists");
            }
        }else{
            console.log(err);
        }
    })
})

module.exports = router;
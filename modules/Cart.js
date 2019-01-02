const express = require('express');
const router = express.Router();
const misc = require('../Misc/Misc');
const redis = require('redis');
const db = require('../db/dbconnection');

var client = redis.createClient();

router.post('/__s', function(req, res){
    var _cartID = misc.RandomCartID();

    //product id
    //product details
    var id = req.body.prod_id;
    var qty = req.body.quantity;
    var product_data = "";
    var oldData = [];
    
    db.query("SELECT * FROM products WHERE product_id =?",[id] ,function(err, result){
        if(err){
            res.json({message:"Somthing went wrong!"});
        }
        product_data = result;
        
    })
    
    var cartData = {
        productId:id,
        productData:product_data,
        quantitiy:qty
    }
    setTimeout(() => {
        client.hmset(_cartID, {
            id:id,
            product_details: JSON.stringify(product_data),
            quantity:1,
            key:_cartID
        },function(err, reply){
            if(err){
                console.log(err);
            }
            //res.send(reply)
            client.hgetall(_cartID, function(err, obj){
                if(err){
                    console.log(err);
                }
                res.send((obj))
            })
        })
    }, 100);
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

router.post("/cartpost", function(req, res){
    var product_details = "";
    /*
        product id
        user id
        product detail by product id
        qty
    */
    var KEY = req.body.key;
    var product_id = req.body.product_id;
    db.query("SELECT * FROM products WHERE product_id =?",[product_id] ,function(err, _array){
        if(err){
            res.json({message:"Somthing went wrong!"});
        }
        product_details = _array;
    })
    
    setTimeout(() => {
        var cartData = {
            productId: product_id,
            productData: product_details,
            quantitiy:1
        }
        client.get(KEY, function(err, result){
            if(err)
                console.log(err);
            
            if(result == null){
                console.log("empty");
                client.set(KEY, JSON.stringify(cartData), redis.print);
            }else{
                var _t = [];
                var JSON_result = JSON.parse(result);
                // JSON_result.map(i => {
                //     _t.push(i)
                // })
                Object.keys(JSON_result).map(i => {
                    // console.log(JSON_result[i]);
                    _t.push(JSON_result[i]);
                    if(JSON_result[i].productId == product_id){
                        console.log("We found product here!!");
                        
                    }
                })
                 _t.push(cartData);
                 client.set(KEY, JSON.stringify(_t), redis.print);
            }
        })
        //
    }, 100);
    
    
    
    // client.get(KEY, function(err, result){
    //     if(err)
    //         console.log(err);
        
    //     if(result == null){
    //         console.log("empty");
    //         client.set(KEY, JSON.stringify(cartData), redis.print);
    //     }else{
    //         var _t = [];
    //         var JSON_result = JSON.parse(result);
    //         JSON_result.map(i => {
    //             _t.push(i)
    //         })
    //          _t.push(cartData);
    //          client.set(KEY, JSON.stringify(_t), redis.print);
    //     }
    // })
    //
    res.send("success")
})
router.post("/cartget", function(req, res){
    var KEY = req.body.key;
    client.get(KEY, function(err, result){
        if(err){
            console.log(err);
        }
        res.send(JSON.parse(result))
    })
})

module.exports = router;
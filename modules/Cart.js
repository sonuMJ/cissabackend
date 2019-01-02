const express = require('express');
const router = express.Router();
const misc = require('../Misc/Misc');
const redis = require('redis');
const db = require('../db/dbconnection');

var client = redis.createClient();

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
                var _t = [];
                _t.push(cartData);
                console.log("empty");
                client.set(KEY, JSON.stringify(_t), redis.print);
            }else{
                var _t = [];
                if(result){
                    var JSON_result = JSON.parse(result);
                    Object.keys(JSON_result).map((item,pos) => {
                        
                        if(JSON_result[pos].productId == product_id){
                            console.log("we found that");
                            
                        }else{
                            _t.push(JSON_result[pos]);
                        }
                    })
                }
                
                _t.push(cartData);
                client.set(KEY, JSON.stringify(_t), redis.print);
            }
        })
        //
    }, 100);
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
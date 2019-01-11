const express = require('express');
const router = express.Router();
const misc = require('../Misc/Misc');
const redis = require('redis');
const db = require('../db/dbconnection');

var client = redis.createClient();

router.delete("/_cdel", function(req, res){
    var c_id = req.headers._cid;
    client.del(c_id, function(err,reply){
        if(!err) {
            if(reply === 1) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        }else{
            console.log(err);
        }
    })
})

router.post("/addCart", function(req, res){
    var exist = false;
    var JSON_result;
    var position;
    var product_details = "";
    /*
        product id 
        user id
        product detail by product id
        qty
    */
    var KEY = req.headers._cid;
    var product_id = req.body.product_id;


    
    db.query("SELECT * FROM products WHERE product_id =?",[product_id] ,function(err, _array){
        if(err){
            res.json({message:"Somthing went wrong!"});
        }
        product_details = _array;
    })
    
    setTimeout(() => {
        var itemPrice = product_details[0].price;
        
        var cartData = {
            productId: product_id,
            productData: product_details,
            quantity:1,
            total: itemPrice
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
                var newItem;
                if(result){
                    JSON_result = JSON.parse(result);
                    Object.keys(JSON_result).map((item,pos) => {
                        
                        if(JSON_result[pos].productId == product_id){
                            exist = true;
                            console.log("we found that");
                            position = JSON_result.indexOf(JSON_result[pos]);
                            console.log(position);
                            
                            newItem = {
                                productId : JSON_result[pos].productId,
                                productData : JSON_result[pos].productData,
                                quantitiy : JSON_result[pos].quantity + 1,
                                total : itemPrice * (JSON_result[pos].quantity + 1)
                            }
                                // JSON_result.splice(i, 1, newItem);
                                // _t.push(JSON_result[i])
                            
                        }
                        else{
                            // console.log("not exist!");
                             _t.push(JSON_result[pos]);
                        }
                    })
                }
                if(exist){
                    //true
                    JSON_result.splice(position, 1, newItem);
                    console.log(JSON_result);
                    _t.push(JSON_result[position])
                    
                }else{
                    //false
                    console.log(JSON_result);
                    _t.push(cartData)
                }
                client.set(KEY, JSON.stringify(_t), redis.print);
            }
        })
    //     //
    }, 100);
    res.json({message : "Successfully Added to cart"})
})
router.post("/showCart", function(req, res){
    var KEY = req.headers._cid;
    client.get(KEY, function(err, result){
        if(err){
            console.log(err);
        }
        res.json({result : JSON.parse(result)})
    })
})
router.put("/cartQty", function(req, res){
    var _t = [];
    var KEY = req.headers._cid;
    var product_id = req.body.product_id;
    var operation = req.body.operation;
    var JSON_RESULT;
    var exist = false;
    var newItem;
    var position;
    var unitPrice;
    if(operation === 'INC'){
        client.get(KEY, function(err, result){
            if(err){
                console.log(err);
            }
            JSON_RESULT = JSON.parse(result);
            if(result != null){
                Object.keys(JSON_RESULT).map((item, pos) => {
                    if(JSON_RESULT[pos].productId == product_id){
                        console.log("its exists");
                        exist = true;
                        unitPrice = JSON_RESULT[pos].productData[0].price;
                        position = JSON_RESULT.indexOf(JSON_RESULT[pos]);
                        newItem = {
                            productId : JSON_RESULT[pos].productId,
                            productData : JSON_RESULT[pos].productData,
                            quantity : JSON_RESULT[pos].quantity + 1,
                            total : unitPrice * (JSON_RESULT[pos].quantity + 1)
                        }
                    }else{
                        _t.push(JSON_RESULT[pos])
                    }
                })
            }
            if(exist){
                JSON_RESULT.splice(position, 1, newItem);
                _t.push(JSON_RESULT[position]);
            }
            client.set(KEY, JSON.stringify(_t), redis.print);
            res.json({message : "Successfully Added to cart"})
        })
    }else if(operation === 'DEC'){
        client.get(KEY, function(err, result){
            if(err){
                console.log(err);
            }
            JSON_RESULT = JSON.parse(result);
            if(result != null){
                Object.keys(JSON_RESULT).map((item, pos) => {
                    if(JSON_RESULT[pos].productId == product_id){
                        unitPrice = JSON_RESULT[pos].productData[0].price;
                        console.log("its exists");
                        exist = true;
                        position = JSON_RESULT.indexOf(JSON_RESULT[pos]);
                        newItem = {
                            productId : JSON_RESULT[pos].productId,
                            productData : JSON_RESULT[pos].productData,
                            quantity : JSON_RESULT[pos].quantity - 1,
                            total : unitPrice * (JSON_RESULT[pos].quantity - 1)
                        }
                    }else{
                        _t.push(JSON_RESULT[pos])
                    }
                })
            }
            if(exist){
                JSON_RESULT.splice(position, 1, newItem);
                _t.push(JSON_RESULT[position]);
            }
            client.set(KEY, JSON.stringify(_t), redis.print);
            res.json({message : "Successfully removed from cart"})
        })
    }
})
router.delete("/cartItemRemove", function(req, res){
    var product_id = req.body.product_id;
    var _t = [];
    var KEY = req.headers._cid;
    var JSON_RESULT;
        client.get(KEY, function(err, result){
            if(err){
                console.log(err);
            }
            JSON_RESULT = JSON.parse(result);
            if(result != null){
                Object.keys(JSON_RESULT).map((item, pos) => {
                    if(JSON_RESULT[pos].productId == product_id){
                        
                    }else{
                        _t.push(JSON_RESULT[pos])
                    }
                })
            }
            client.set(KEY, JSON.stringify(_t), redis.print);
        })
        res.json({message:"deleted"}).sendStatus(200);
})

router.get("/cartid", function(req, res){
    var k = '1800' + misc.RandomOrderID();
    res.json(parseInt(k));
})


module.exports = router;
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
	var cartNumber;
    var exist = false;
    var JSON_result;
    var checkQuantity = false;
    const MAX_QTY = 10;
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
            total: itemPrice,
			id:1
        }
        client.get(KEY, function(err, result){
            if(err){
                console.log(err);
            }else{
                if(result == null){
                    var _t = [];
                    _t.push(cartData);
                    client.set(KEY, JSON.stringify(_t), redis.print);
                }else{
                    var _t = [];
                    var newItem;
                    if(result){
                        JSON_result = JSON.parse(result);
                        Object.keys(JSON_result).map((item,pos) => {
                            cartNumber = JSON_result.length;
                            
                            if(JSON_result[pos].productId == product_id){
                                var q = JSON_result[pos].quantity;
                                //maximum quantity
                                if(q >= MAX_QTY){
                                    checkQuantity = true
                                    
                                }
                                exist = true;
                                
                                position = JSON_result.indexOf(JSON_result[pos]);
                                if(checkQuantity){
                                    newItem = {
                                        productId : JSON_result[pos].productId,
                                        productData : JSON_result[pos].productData,
                                        quantity : MAX_QTY,
                                        total : itemPrice * (JSON_result[pos].quantity),
										id:JSON_result[pos].id
                                    }
                                }else{
                                    newItem = {
                                        productId : JSON_result[pos].productId,
                                        productData : JSON_result[pos].productData,
                                        quantity : parseInt(JSON_result[pos].quantity) + 1,
                                        total : itemPrice * (JSON_result[pos].quantity + 1),
										id:JSON_result[pos].id
                                    }
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
                        _t.push(JSON_result[position])
                        
                    }else{
                        //false
                        if(checkQuantity){

                        }else{
                            cartDataAdd = {
                                productId: product_id,
                                productData: product_details,
                                quantity:1,
                                total: itemPrice,
                                id:cartNumber + 1 
                            }
                            _t.push(cartDataAdd)
                        }
                        
                    }
                    client.set(KEY, JSON.stringify(_t), redis.print);
                }
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
        var r = JSON.parse(result);
        if(result != null){
            r.sort(function(a, b) { 
                return a.id - b.id ;
            });
        }
        res.json({result : r})
    })
})
router.put("/cartQty", function(req, res){
    var _t = [];
    var KEY = req.headers._cid;
    var product_id = req.body.product_id;
    var operation = req.body.operation;
    var G_quantity = req.body.quantity;
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
                        exist = true;
                        unitPrice = JSON_RESULT[pos].productData[0].price;
                        position = JSON_RESULT.indexOf(JSON_RESULT[pos]);
                        newItem = {
                            productId : JSON_RESULT[pos].productId,
                            productData : JSON_RESULT[pos].productData,
                            quantity : parseInt(JSON_RESULT[pos].quantity) + 1,
                            total : unitPrice * (parseInt(JSON_RESULT[pos].quantity) + 1),
                            id:JSON_RESULT[pos].id
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
                        exist = true;
                        position = JSON_RESULT.indexOf(JSON_RESULT[pos]);
                        newItem = {
                            productId : JSON_RESULT[pos].productId,
                            productData : JSON_RESULT[pos].productData,
                            quantity : parseInt(JSON_RESULT[pos].quantity) - 1,
                            total : unitPrice * (parseInt(JSON_RESULT[pos].quantity) - 1),
                            id:JSON_RESULT[pos].id
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
    }else if(operation === "MANUAL"){
        client.get(KEY, function(err, result){
            if(err){
                console.log(err);
            }
            JSON_RESULT = JSON.parse(result);
            if(result != null){
                Object.keys(JSON_RESULT).map((item, pos) => {
                    if(JSON_RESULT[pos].productId == product_id){
                        exist = true;
                        unitPrice = JSON_RESULT[pos].productData[0].price;
                        position = JSON_RESULT.indexOf(JSON_RESULT[pos]);
                        newItem = {
                            productId : JSON_RESULT[pos].productId,
                            productData : JSON_RESULT[pos].productData,
                            quantity : G_quantity,
                            total : unitPrice * (G_quantity),
                            id:JSON_RESULT[pos].id
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
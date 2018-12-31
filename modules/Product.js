const express = require('express');
const db = require("../db/dbconnection");
const misc = require("../Misc/Misc");
const { check, validationResult } = require('express-validator/check')
const router = express.Router();


//get all products 
router.get("/getall", function(req, res){
    db.query("SELECT * FROM products", function(err, result){
        if(err){
            console.log(err);
        }
        res.status(200).json(result);
    })
})
//get product by id
router.get("/get/:id", function(req, res){
    var id = req.params.id;
    console.log(id);
    db.query("SELECT * FROM products WHERE product_id =?",[id] ,function(err, result){
        if(err){
            res.json({message:"Somthing went wrong!"});

        }
        res.status(200).json(result);
    })
})

//search product

router.post("/search", function(req, res){
    var searchStr = req.body.search;
    db.query("SELECT * FROM products WHERE name LIKE  ?",['%'+searchStr+'%'] ,function(err, result){
        if(err){
            console.log(err);
        }
        res.json(result);
    })
})

//post products
router.post("/send",
        [
            check('name').isLength({min:2, max:30}).not().isEmpty(),
            check('price').not().isEmpty().isLength({min:1, max:8}).isNumeric().withMessage("Must be a numeric value"),
            check('quantity').not().isEmpty().isLength({min:1, max:8}),
            check('availability').not().isEmpty().isBoolean().withMessage("Must be Boolean"),
            check('traslated').isLength({max : 20})
        ]
        , function(req, res){
            var input = req.body;
            var product_id = misc.RandomProductID();
            var data = {
                name:input.name,
                price:input.price,
                quantity:input.quantity,
                img_url: input.img_url,
                availability: input.availability,
                product_id: product_id,
                translated : input.translated
            }
            const error = validationResult(req);
                if(!error.isEmpty()){
                    res.status(422).json({errors : error.array()})
                }else{
                    db.query("INSERT INTO products SET ?",[data], function(err, result){
                        if(err){
                            console.log(err);
                            res.json({message : "Failed to add product!"});
                        }
                        res.status(200).json({message : "Product successfully added!"});
                    })
                }
            
})

//update product
router.put("/:id", function(req, res){
    var id = req.params.id;
    var input = req.body;
    var data = {
        name:input.name,
        price:input.price,
        quantity:input.quantity,
        img_url: "https://i5.walmartimages.ca/images/Large/832/497/6000196832497.jpg",
        availability: "true",
        product_id: "PRO123",
        translated : input.mal
    }
    db.query("UPDATE products set ? WHERE product_id = ?",[data,id], function(err, result){
        if(err){
            console.log(err);
            res.json({message:"Somthing went wrong!"});
        }
        res.status(200).json({message : "Product updated successfully!"});
    })
})

//update availability
router.put("/availabiltiy/:id", function(req, res){
    var id = req.params.id;
    var status = req.body.status;
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
        res.status(200).json({message : "Successfully Changed!"})
    })
})



//delete products
router.delete("/:id", function(req, res){
    var id = req.params.id;
    db.query("DELETE FROM products WHERE product_id = ?", [ id ], function(err, results){
        if(err){
            res.json({message:"Something went wrong!"});
        }
        res.status(200).json({message : "Successfully Deleted!"})
    })
})

module.exports = router;
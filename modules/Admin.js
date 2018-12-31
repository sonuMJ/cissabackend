const express = require("express");
const router = express.Router();
const db = require("../db/dbconnection");

//register admin
router.post("/", function(req, res){
    var input = req.body;
    var hash = "";
    bcrypt.hash( input.password , 10, function(err,hash){
        hash = hash;
    })
    var data = {
        name:input.name,
        email:input.email,
        phone:input.phone,
        password : hash
    }
    db.query("INSERT INTO admin SET ?", [data], function(err, result){
        if(err){
            res.json({message:"Something went wrong!!!"});
        }
        res.status(200).json({message:"Successfully Registered!!"})
    })
})

//admin login
router.post("/login", function(req, res){
    var email = req.body.email;
    var password = req.body.password;
    res.status(200).json({message:"Invalid Account!!"})
    // db.query("SELECT * FROM admin WHERE email = ?", [email],function(err, result){
    //     if(err){
    //         throw err;
    //     }
    //     if(result == ""){
    //         res.status(404).json({message:"Invalid Email!!"})
    //     }else{
    //         bcrypt.compare(password, result[0].password, function(err, valid){
    //             if(valid){
    //                 //success
    //             }else{
    //                 res.status(404).json({message:"Invalid Account!!"})
    //             }
    //         })
    //     }
    // })
})

//change password

module.exports = router;
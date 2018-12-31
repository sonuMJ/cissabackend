const express = require('express');
const bcrypt = require("bcrypt");
const db = require("../db/dbconnection");
const router = express.Router();
const misc = require("../Misc/Misc");
const jwt = require("../security/Jwt");
const csurf = require('csurf');
var session = require("express-session");


const saltRounds = 10;
const SELECT_ID_BY_EMAIL_FROM_USERDB = "SELECT id from user WHERE email = ?";
const SELECT_ALL_BY_EMAIL_FROM_USERDB = "SELECT * from user WHERE email = ?";
const USER_ROLE = 'user';

router.use(session({secret:"secret", resave:false, saveUninitialized :false}));
var csrfProtection = csurf({ignoreMethods:['POST']});

//router.use(csrfProtection);

//get all users
  
router.get("/",csrfProtection, function(req, res){
    console.log( req.headers['origin'])
    db.query("SELECT * FROM user", function(err,results){
        res.send(results);
    }) 
})

//save user
router.post("/", function(req, res){
    var input = req.body;
    var usr_id = misc.RandomIdGen();
    var hash_pwd = "";
    bcrypt.hash(input.password, saltRounds, function(err,results){
        hash_pwd = results;
    })
    setTimeout(() => {
        var data = {
            username: input.username,
            email: input.email,
            password: hash_pwd,
            user_id: usr_id
        }
        // check is exists
        db.query(SELECT_ID_BY_EMAIL_FROM_USERDB, [input.email],function(err, results){
            if(results == ""){
                //insert into database
                db.query("INSERT INTO user SET ?", [data], function(err,results){
                    if(err){
                        throw err;
                    }
                    res.status(200).json({message : "Successfully Registered!!"});
                })
            }else{
                res.json({message:"User Already Exists!!"})
            }
        })
    }, 100);
})

//login
router.post("/login",csrfProtection, function(req, res){
    console.log( req.headers['origin'])
    var email = req.body.email;
    var password = req.body.password;
    var csurf_token = req.csrfToken();
    db.query(SELECT_ALL_BY_EMAIL_FROM_USERDB, [email], function(err, results){
        if(results == ""){
            res.status(404).json({message : "Invalid User!!"});
        }else{
            //compare password
            bcrypt.compare(password, results[0].password, function(err, vaild){
                if(vaild){
                    var token = jwt.JWTSign(results[0].user_id, results[0].username, USER_ROLE,csurf_token);
                    res.status(200).json({
                        message : results[0].user_id,
                        token : token,
                        csrf_token : csurf_token
                    });
                    // var b = jwt.JWTVerify(token);
                    // console.log(b);
                    
                }else{
                    res.status(404).json({message : "Invalid User!!"});
                }
            })
        }
    })
})


module.exports = router;
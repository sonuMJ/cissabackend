const express = require('express');
const bcrypt = require("bcryptjs");
const db = require("../db/dbconnection");
const router = express.Router();
const misc = require("../Misc/Misc");
const jwt = require("../security/Jwt");
const csurf = require('csurf');
var session = require("express-session");
var mailService = require('../Mail/MailService');


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
router.post("/register", function(req, res){
    var input = req.body;
    var usr_id = misc.RandomIdGen();
    var hash_pwd = "";
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(input.password, salt, function(err,results){
        if(err)
        {
            console.log(err)
            res.json({message : "Something went wrongg!!"});
        }
        if(results){
            setTimeout(() => {
                var data = {
                    username: input.username,
                    email: input.email,
                    password: results,
                    user_id: parseInt(usr_id)
                }
                // check is exists
                db.query(SELECT_ID_BY_EMAIL_FROM_USERDB, [input.email],function(err, result){
                    if(result == ""){
                        //insert into database
                        db.query("INSERT INTO user SET ?", [data], function(err,fetchArray){
                            if(err){
                                //throw err;
                                res.json({message : "Something went wrong. try again later!"});
                            }
                            res.status(200).json({message : "Successfully Registered!!"});
                        })
                    }else{
                        res.json({message:"User Already Exists!!"})
                    }
                })
            }, 100);
        }
    })
})
    
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
                        _uid : results[0].user_id,
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

router.get("/sendmail", function(req, res){
    mailService.SentEmail();
})


module.exports = router;
const express = require('express');
const bcrypt = require("bcryptjs");
const db = require("../db/dbconnection");
const router = express.Router();
const misc = require("../Misc/Misc");
const jwt = require("../security/Jwt");
const csurf = require('csurf');
var session = require("express-session");
var mailService = require('../Mail/MailService');
var dbservice = require('../db/Dbservice');


const saltRounds = 10;
const SELECT_ID_BY_EMAIL_FROM_USERDB = "SELECT id from user WHERE email = ?";
const SELECT_ALL_BY_EMAIL_FROM_USERDB = "SELECT * from user WHERE email = ? AND verified = 'true'";
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
    var Verif_code = misc.RandomUserVerificationID();
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
                    user_id: parseInt(usr_id),
                    verification_code:Verif_code
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
                            mailService.EmailVerification(input.email, input.username, Verif_code);
                            res.status(200).json({message : "Please verify your account! verification link sended to your account!"});
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

router.post("/verifyaccount", function(req, res){
    var verify_code = req.body.verify_code;
    db.query("SELECT * FROM user WHERE verification_code = ?", [verify_code], function(err, result){
        if(!err){
            if(result != ""){
                db.query("UPDATE user SET verified = ? WHERE verification_code =?",["true", verify_code], function(err, array){
                    if(!err){
                        res.sendStatus(200);
                    }else{
                        res.sendStatus(404);
                    }
                })
            }
        }else{
            res.sendStatus(404);
        }
    })
})

router.get("/sendmail", function(req, res){
    //mailService.EmailVerification("sonu.sowibo@gmail.com","Sonu",a);
    var d = new Date();
    res.json(d.getDay());
})


module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../db/dbconnection");
const jwt = require("../security/Jwt");
const csurf = require('csurf');
var session = require("express-session");
const bcrypt = require("bcryptjs");

const saltRounds = 10;
const SELECT_ID_BY_EMAIL_FROM_USERDB = "SELECT id from admin WHERE email = ?";
const SELECT_ALL_BY_EMAIL_FROM_USERDB = "SELECT * from admin WHERE email = ?";
const USER_ROLE = 'admin';

router.use(session({secret:"secret", resave:false, saveUninitialized :false}));
var csrfProtection = csurf({ignoreMethods:['POST']});

//admin login
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
                    var token = jwt.JWTSign(results[0].user_id, results[0].username, results[0].role,csurf_token);
                    res.status(200).json({
                        _uid : results[0].user_id,
                        token : token,
                        csrf_token : csurf_token
                    });
                    
                }else{
                    res.status(404).json({message : "Invalid User!!"});
                }
            })
        }
    })
})

router.get("/getuserbytoken", function(req, res){
    var token = req.headers.token;
    if(token != ""){
        var valid_token = jwt.JWTVerify(token);
        var TOKEN_DATA = jwt.JWTParse(token);
        if(valid_token){
            var username = TOKEN_DATA[0]._u;
            var user_id = TOKEN_DATA[0]._i;
            res.json({user_id:user_id,name:username})
        }else{
            res.sendStatus(404);
        }
    }else{
        res.sendStatus(404);
    }
})
router.get("/verifyPermission", function(req, res){
    var token = req.headers.token;
    if(token != ""){
        var valid_token = jwt.JWTVerify(token);
        var TOKEN_DATA = jwt.JWTParse(token);
        if(valid_token){
            var user_role = TOKEN_DATA[0].role;
            if(user_role == "admin"){
                res.json({isAuthorized:true})
            }
            else{
                res.json({isAuthorized:false})
            }
        }else{
            res.sendStatus(404);
        }
    }else{
        res.sendStatus(404);
    }
})


//change password

module.exports = router;
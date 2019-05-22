const express = require("express");
const router = express.Router();
const db = require("../db/dbconnection");
const jwt = require("../security/Jwt");
const csurf = require('csurf');
var session = require("express-session");
const bcrypt = require("bcryptjs");
const misc = require("../Misc/Misc");
const mail = require("../Mail/MailService");
const { check, validationResult } = require('express-validator/check')

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
            res.status(200).json({status:"Failed", message : "Email or password is incorrect !"});
        }else{
            if(results[0].verified === "true"){
                //compare password
                bcrypt.compare(password, results[0].password, function(err, vaild){
                    if(vaild){
                        var user_id = results[0].user_id;
                        var username = results[0].username;
                        var permission_id = results[0].permission_id;
                        var token = jwt.JWTAdminSign(user_id,username,"ADMIN",permission_id,csurf_token);
                        res.status(200).json({
                            _uid : results[0].user_id,
                            token : token,
                            csrf_token : csurf_token
                        });
                        
                    }else{
                        res.status(200).json({status:"Failed", message : "Email or password is incorrect !"});
                    }
                })
            }
            else{
                res.status(200).json({status:"Failed", message : "Account unverified !"});
            }
        }
    })
})
// admin get all admin users
router.get("/getall", function(req, res){
    var token = req.headers.token;
    var session = req.headers.sessionid;
    var validToken = jwt.JWTVerify(token);
    if(validToken){
        var jwtParse = jwt.JWTParse(token);
        var JWT_SESSION = jwtParse[0].csrf;
        if(JWT_SESSION === session){
            db.query("SELECT admin.user_id,admin.email,admin.username,admin.password,permission.permission_id,permission.p_create,permission.p_alter,permission.p_delete,permission.c_create,permission.c_alter,permission.c_delete,permission.o_alter,permission.u_alter,permission.a_create,permission.a_alter,permission.a_delete from admin INNER JOIN permission ON admin.permission_id = permission.permission_id", function(err, result){
                if(err){
                    console.log(err);
                }
                res.status(200).json(result);
            })
        }
        else{
            res.sendStatus(404);
        }
    }
    else{
        res.sendStatus(404);
    }
})
//post admin
router.post("/send",
        [
            check('email').isLength({min:2, max:30}).not().isEmpty().isEmail(),
        ]
        , function(req, res){
            var token = req.headers.token;
            var session = req.headers.sessionid;
            var validToken = jwt.JWTVerify(token);
            if(validToken){
                var jwtParse = jwt.JWTParse(token);
                var JWT_SESSION = jwtParse[0].csrf;
                if(JWT_SESSION === session){
                    URL = "SELECT * FROM permission WHERE permission_id = ?";
                    db.query(URL,[jwtParse[0]._pid], function(err, result){
                        if(err){
                            console.log(err);
                        }
                        var permission = (result[0].a_create == "true");
                        if(permission){
                            var input = req.body;
                            var data = {
                                permission_id: misc.RandomPermissionID(),
                                p_create: input.p_create,
                                p_alter: input.p_alter,
                                p_delete: input.p_delete,
                                c_create: input.c_create,
                                c_alter: input.c_alter,
                                c_delete: input.c_delete,
                                o_alter: input.o_alter,
                                u_alter: input.u_alter,
                                a_create: input.a_create,
                                a_alter: input.a_alter,
                                a_delete: input.a_delete
                            }

                            db.query("SELECT * from admin WHERE email = ?",[req.body.email], function(err, result){
                                    if(err){
                                        console.log(err);
                                    }
                                if(result == ""){
                                    db.query("INSERT INTO permission SET ?",[data], function(err, result){
                                        if(err){
                                            console.log(err);
                                        }
                                        else{
                                            const error = validationResult(req);
                                            if(!error.isEmpty()){
                                                res.status(200).json({status:"Failed", message : error.array()[0].msg});
                                            }else{
                                                var adminData = {
                                                    user_id : misc.RandomAdminID(),
                                                    username : "Unverified",
                                                    verification_code: misc.RandomUserVerificationID(),
                                                    verified: "false",
                                                    email: input.email,
                                                    permission_id: data.permission_id
                                                }
                                                db.query("INSERT INTO admin SET ?",[adminData], function(err, result){
                                                    if(err){
                                                        console.log(err);
                                                        res.json({status:"Failed", message : "Failed to add admin!"});
                                                    }
													mail.adminSignup(input.email,adminData.verification_code);
                                                    res.status(200).json({status:"Success", message : "New admin added!"});
                                                })
                                            }
                                        }
                                    })
                                }
                                else{
                                    res.status(200).json({status:"Failed", message : "Email already active as admin !"});
                                }
                            });
                        }
                        else{
                            res.status(200).json({status:"Failed", message : "Permission Denied !"});
                        }
                    })
                }
                else{
                    res.sendStatus(404);
                }
            }
            else{
                res.sendStatus(404);
            }
})
//update permission
router.put("/permission/:id", function(req, res){
    var token = req.headers.token;
    var session = req.headers.sessionid;
    var validToken = jwt.JWTVerify(token);
    if(validToken){
        var jwtParse = jwt.JWTParse(token);
        var JWT_SESSION = jwtParse[0].csrf;
        URL = "SELECT * FROM permission WHERE permission_id = ?";
        if(JWT_SESSION === session){
            db.query(URL,[jwtParse[0]._pid], function(err, result){
                if(err){
                    console.log(err);
                }
                var permission = (result[0].a_alter == "true");
                if(permission){
                    var id = req.params.id;
                    var status = req.body.status;
                    var permission_name =req.body.permission;
                    var av = "";
                    if(status){
                        av = "true";
                    }else{
                        av = "false";
                    }
                    db.query("UPDATE permission set "+permission_name+" = ? WHERE permission_id = ?", [av, id], function(err, result){
                        if(err){
                            res.status(200).json({status:"Failed",message:"Somthing went wrong!"});
                        }
                        res.status(200).json({status:"Success",message : "Permission updated!"})
                    })
                }
                else{
                    res.status(200).json({status:"Failed", message : "Permission Denied !"});
                }
            });

    }
    else{
        res.sendStatus(404);
    }
}
else{
    res.sendStatus(404);
}
})
//change password
router.post("/changepassword", function(req, res){
    var token = req.headers.token;
    var session = req.headers.sessionid;
    var validToken = jwt.JWTVerify(token);
    if(validToken){
        var jwtParse = jwt.JWTParse(token);
        var JWT_SESSION = jwtParse[0].csrf;
        if(JWT_SESSION === session){
            var user_id = jwtParse[0]._i;
            var curr_password = req.body.curr_pwd;
            var new_password = req.body.new_pwd;
            var hashed_pwd = "";
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(new_password, salt, function(err,results){
                    if(err)
                    {
                        console.log(err)
                        res.json({message : "Something went wrongg!!"});
                    }
                    else
                    hashed_pwd = results
                });
            });
            db.query("SELECT * from admin WHERE user_id = ?", [user_id], function(err, results){
                if(results == ""){
                    res.status(404).json({message : "Invalid User!!"});
                }else{
                    //compare password
                    bcrypt.compare(curr_password, results[0].password, function(err, vaild){
                        if(vaild){
                            db.query("UPDATE admin set password = ? WHERE user_id = ?", [hashed_pwd, user_id], function(err, result){
                                if(err){
                                    res.status(200).json({status:"Failed",message:"Somthing went wrong!"});
                                }
                                res.status(200).json({status:"Success",message : "Password changed!"})
                            })
                            
                        }else{
                            res.status(200).json({status:"Failed",message:"Wrong password !"});
                        }
                    })
                }
            })
        }
        else{
            res.sendStatus(404);
        }
    }
    else{
        res.sendStatus(404);
    }

})

router.get("/getuserbytoken", function(req, res){
    var token = req.headers.token;
    if(token != ""){
        var valid_token = jwt.JWTVerify(token);
        var TOKEN_DATA = jwt.JWTParse(token);
        if(valid_token){
            var username = TOKEN_DATA[0]._u;
            var user_id = TOKEN_DATA[0]._i;
			var firstname = username.split(' ');
            res.json({user_id:user_id,name:firstname[0]})
        }else{
            res.sendStatus(404);
        }
    }else{
        res.sendStatus(404);
    }
})
router.get("/authorisetoken", function(req, res){
    var token = req.headers.token;
    if(token != ""){
        var valid_token = jwt.JWTVerify(token);
        var TOKEN_DATA = jwt.JWTParse(token);
        if(TOKEN_DATA[0]._role === "ADMIN"){
            if(valid_token){
                var packagedData = {
                    user_id: TOKEN_DATA[0]._i,
                    username: TOKEN_DATA[0]._u,
                    permission_id: TOKEN_DATA[0]._pid
                }
                res.json({status:"Success"})
            }else{
                res.sendStatus(404);
            }
        }
        else{
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
router.post("/signup", function(req, res){
    var v_code = req.body.verify_code;
    var email = req.body.email;
    var name = req.body.name;
    var newPassword = req.body.password;
	console.log(email + "" + newPassword);
    if(v_code !== ""&&email !== ""&&newPassword !== ""){
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newPassword, salt, function(err,results){
                if(err){
                    res.status(404);
                }else{
                    db.query("UPDATE admin SET password = ?,username = ?,verified = ? WHERE email= ? AND verification_code = ?", [results,name,"true",email, v_code], function(err, result){
						console.log(result)
                        if(err){
                            res.status(404);
                        }else{
                            res.status(200).json({status:"Success",message:"Account Activated"});
                        }
                    })
                }
            })
        })
    }else{
        res.status(200).json({status:"Failed",message:"Signup Failed"});
    }
})

router.get("/verifysignup", function(req, res){
    var email = req.headers.email;
    db.query("SELECT verified from admin WHERE email = ?",[email], function(err, result){
		if(result == ""){
			res.status(404).json({status:"Failed", message : "Unauthorized access"});
		}
		else{
			res.status(200).json(result);
		}
        if(err){
            console.log(err);
        }
    })
})

/delete products
router.delete("/:id", function(req, res){
    var token = req.headers.token;
    var session = req.headers.sessionid;
    var validToken = jwt.JWTVerify(token);
    if(validToken){
        var jwtParse = jwt.JWTParse(token);
        var JWT_SESSION = jwtParse[0].csrf;
        if(JWT_SESSION === session){
            URL = "SELECT * FROM permission WHERE permission_id = ?";
            db.query(URL,[jwtParse[0]._pid], function(err, result){
                if(err){
                    console.log(err);
                }
                var permission = (result[0].a_delete == "true");
                if(permission){
                    var id = req.params.id;
                    var permission_id = req.body.permission_id;
                    db.query("DELETE FROM admin WHERE user_id = ?", [ id ], function(err, results){
                        if(err){
                            res.status(200).json({status:"Failed",message:"Something went wrong!"});
                        }
                        else{
                            db.query("DELETE FROM permission WHERE permission_id = ?", [ permission_id ], function(err, results){
                                if(err){
                                    res.status(200).json({status:"Failed",message:"Something went wrong!"});
                                }
                                else{
                                    if(id == jwtParse[0]._i){
                                        res.sendStatus(500);
                                    }
                                    else{
                                        res.status(200).json({status:"Success",message : "Account terminated!"})
                                    }
                                }
                                
                            });

                        }
                    })
                }
                else{
                    res.status(200).json({status:"Failed", message : "Permission Denied !"});
                }
            });

        }
        else{
            res.sendStatus(404);
        }
    }
    else{
        res.sendStatus(404);
    }
})

//change password

module.exports = router;
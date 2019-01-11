const jwt = require("jsonwebtoken");

const JWT_KEY = 'shhhhh';

module.exports = {
    JWTSign : function(user_id, username, role,csrf_token){
        var token = jwt.sign({ _i: user_id, _u:username, role:role, csrf : csrf_token }, JWT_KEY, { expiresIn :'24h'});
        return token;
    },
    JWTVerify : function(token){
        var validToken = false;
        jwt.verify(token, JWT_KEY, function(err, decoded){
            if(err){
                validToken = false;
            }else{
                validToken = true;
            }
        })
        return validToken;
    },
    JWTParse : function(token){
        var data = [];
        jwt.verify(token, JWT_KEY, function(err,decoded){
            if(!err){
                data.push(decoded);
            }
        })
        return data;
    }
}
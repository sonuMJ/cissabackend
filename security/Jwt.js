const jwt = require("jsonwebtoken");

module.exports = {
    JWTSign : function(user_id, username, role,csrf_token){
        var token = jwt.sign({ _i: user_id, _u:username, role:role, csrf : csrf_token }, 'shhhhh', { expiresIn :'24h'});
        return token;
    },
    JWTVerify : function(token){
        var validToken = false;
        jwt.verify(token, 'shhhhh', function(err, decoded){
            if(err){
                console.log("err" , err);
                validToken = false;
            }else{
                console.log(decoded);
                validToken = true;
            }
        })
        return validToken;
    }
}
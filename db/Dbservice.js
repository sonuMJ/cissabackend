const db = require('./dbconnection');

module.exports = {
    UserdetailsById : function(userid){
        var r = [];
        db.query("SELECT * FROM user WHERE user_id = ?",[userid],function(err,result){
            if(!err){
                if(result){
                    r.push(result);
                }
            }
        })
        return r;
    }
}
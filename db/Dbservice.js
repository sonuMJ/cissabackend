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
    },
    OrderdetailsForemailbyOrderid: function(orderid){
        var orderId = orderid;
        var r = [];
        if(orderId != undefined){
            db.query("SELECT products.name, order_details.quantity,products.price FROM orders INNER JOIN order_details ON orders.orderid=order_details.orderid INNER JOIN products ON order_details.productid = products.product_id WHERE orders.orderid = ?", [orderId], function(err, array){
                
                if(!err){
                    //console.log(array);
                    
                    r.push(array)
                }
            })
            setTimeout(() => {
                console.log(r);  
                return r;
                }, 100);
        }
        
    }
}
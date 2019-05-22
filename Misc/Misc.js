module.exports = {
    RandomIdGen : function(){
        var randomID = "1400" + Math.floor((Math.random() * 10000000000) + 1);
        //var randomID = Math.random().toString(36).substring(2, 15) +"-"+ Math.random().toString(36).substring(2, 15)+Math.random().toString(36).substring(2, 15);
        return randomID;
    },
    RandomProductID : function(){
        var randomID = "P_"+Math.random().toString(36).substring(2, 6) +"-"+ Math.random().toString(36).substring(2, 15);
        return randomID;
    },
    RandomOrderID : function(){
        var randomID = "1800" + Math.floor((Math.random() * 1000000000) + 1);
        return randomID;
    },
    RandomUserCartID : function(){
        var randomID = Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
        return randomID;
    },
    RandomUserVerificationID : function(){
        var randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)+ Math.random().toString(36).substring(2, 15)+ Math.random().toString(36).substring(2, 15);
        return randomID;
    },
    RandomCategoryID : function(){
        var randomID = "C_"+Math.random().toString(36).substring(2, 6) +"-"+ Math.random().toString(36).substring(2, 15);
        return randomID;
    },
	RandomPermissionID : function(){
        var randomID = "p_"+Math.random().toString(36).substring(2, 6) +"-"+ Math.random().toString(36).substring(2, 15);
        return randomID;
    },
    RandomAdminID : function(){
        var randomID = "A_"+Math.random().toString(36).substring(2, 6) +"-"+ Math.random().toString(36).substring(2, 15);
        return randomID;
    }
}

// function RandomIdGen(){
//     var randomID = Math.random().toString(36).substring(2, 15) +"-"+ Math.random().toString(36).substring(2, 15)+Math.random().toString(36).substring(2, 15);
//     return randomID;
// }
module.exports = {
    RandomIdGen : function(){
        var randomID = Math.random().toString(36).substring(2, 15) +"-"+ Math.random().toString(36).substring(2, 15)+Math.random().toString(36).substring(2, 15);
        return randomID;
    },
    RandomProductID : function(){
        var randomID = "P_"+Math.random().toString(36).substring(2, 6) +"-"+ Math.random().toString(36).substring(2, 15);
        return randomID;
    },
    RandomCartID : function(){
        var randomID = "_"+Math.random().toString(36).substring(2, 10) +"-"+ Math.random().toString(36).substring(2, 15)+""+Math.random().toString(36).substring(2, 15);
        return randomID;
    }
}

// function RandomIdGen(){
//     var randomID = Math.random().toString(36).substring(2, 15) +"-"+ Math.random().toString(36).substring(2, 15)+Math.random().toString(36).substring(2, 15);
//     return randomID;
// }
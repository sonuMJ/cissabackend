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
        var randomID = Math.floor((Math.random() * 1000000000) + 1);
        return randomID;
    },
    RandomUserCartID : function(){
        var randomID = Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
        return randomID;
    }
}

// function RandomIdGen(){
//     var randomID = Math.random().toString(36).substring(2, 15) +"-"+ Math.random().toString(36).substring(2, 15)+Math.random().toString(36).substring(2, 15);
//     return randomID;
// }
const qr = require('qr-image');
const fs = require('fs');

module.exports = {
    CreateQRcode:function(id){
        var fileWritten = false;
        qr.image(id, {type:'png', size:15})
        .pipe(fs.createWriteStream("./Mail/qr/"+id+".png"));
        setTimeout(() => {
            fs.exists("./Mail/qr/"+id+".png", function(exists){
                if(exists){
                    fileWritten = true
                }else{
                    fileWritten = false;
                }
            })
            return fileWritten;
        }, 1000);
    },
    DeleteQRcode:function(id){
        fs.exists("./Mail/qr/"+id+".png", function(exists){
            if(exists){
                fs.unlink("./Mail/qr/"+id+".png", function(err){
                    if(err){
                        console.log("Something went wrong!!");
                    }
                    console.log("File successfully deleted!!");
                    
                })
            }
        })
    }

}
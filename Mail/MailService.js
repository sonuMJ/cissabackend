const nodemailer = require('nodemailer');
const Hogan = require('hogan.js');
const fs = require('fs');
const ejs = require('ejs');
const handlebars = require('handlebars');

//https://webapplog.com/handlebars/

var template = fs.readFileSync("../cissabackend/Mail/resetpwd.html", "utf-8");
var compileTemplate = handlebars.compile(template);

module.exports = {
    
    SentEmail : function(){
        var tags  = ['express', 'node', 'javascript'];
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            tls: {rejectUnauthorized: false},
            auth: {
                user: 'sonu.sowibo@gmail.com', // generated ethereal user
                pass: '********' // generated ethereal password
            }
        });
        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Fred Foo 👻" <sonu.sowibo.com>', // sender address
            to: "sonu.sowibo@gmail.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
           // html: "<b>Hello world?</b>" // html body
            //html:compileTemplate({company:"Cissa organics",tags:tags})
            html:compileTemplate()
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + JSON.stringify(response));
            }
            //smtpTransport.close(); // shut down the connection pool, no more messages
        });
    } 
}
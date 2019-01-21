const nodemailer = require('nodemailer');
const Hogan = require('hogan.js');
const fs = require('fs');
const ejs = require('ejs');
const handlebars = require('handlebars');
require('dotenv/config');

//https://webapplog.com/handlebars/

var template = fs.readFileSync("../cissabackend/Mail/emailverification.html", "utf-8");
var emailVerificationTemplate = fs.readFileSync("../cissabackend/Mail/emailverification.html", "utf-8");
var orderpurchaseTemplate = fs.readFileSync("../cissabackend/Mail/purchasedetails.html", "utf-8");

var orderPurchasecompileTemplate = handlebars.compile(orderpurchaseTemplate);
var compileTemplate = handlebars.compile(template);
var emailVerifycompileTemplate = handlebars.compile(emailVerificationTemplate);


// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    tls: {rejectUnauthorized: false},
    auth: {
        user: process.env.EMAIL_ID, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD // generated ethereal password
    }
});
module.exports = {
    
    SentEmail : function(){
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
    },
    EmailVerification : function(toAddress, userName, v_id){
        var URL = "http://localhost:3000/verifyaccount/"+v_id;
        let mailOptions = {
            from: '"Cissa Organics👻" <sonu.sowibo.com>', // sender address
            to: toAddress, // list of receivers
            subject: "[Cissa organics Email Verification]", // Subject line
            text: "cissa organics", // plain text body
           // html: "<b>Hello world?</b>" // html body
            //html:compileTemplate({company:"Cissa organics",tags:tags})
            html:emailVerifycompileTemplate({url: URL,username: userName})
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
    },
    Orderpurchase : function(toAddress,userName,orderId, time){
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            tls: {rejectUnauthorized: false},
            auth: {
                user: process.env.EMAIL_ID, // generated ethereal user
                pass: process.env.EMAIL_PASSWORD // generated ethereal password
            }
        });

        let mailOptions = {
            from: '"Cissa Organics👻" <sonu.sowibo.com>', // sender address
            to: toAddress, // list of receivers
            subject: "[Cissa organics Email Verification]", // Subject line
            text: "cissa organics", // plain text body
           // html: "<b>Hello world?</b>" // html body
            //html:compileTemplate({company:"Cissa organics",tags:tags})
            html:orderPurchasecompileTemplate({orderid:orderId,username:userName,orderid:orderId,Time:time})
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, response){
            if(error){
                console.log('====================================');
                console.log("mail error");
                console.log('====================================');
                console.log(error);
            }else{
                console.log('====================================');
                console.log("mailed");
                console.log('====================================');
                console.log("Message sent: " + JSON.stringify(response));
            }
            smtpTransport.close(); // shut down the connection pool, no more messages
        });
    }
}
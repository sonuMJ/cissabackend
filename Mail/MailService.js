const nodemailer = require('nodemailer');
const Hogan = require('hogan.js');
const fs = require('fs');
const ejs = require('ejs');
const handlebars = require('handlebars');
const smtpTransport = require('nodemailer-smtp-transport');
require('dotenv/config');

//https://webapplog.com/handlebars/

var data = {tags: ['express', 'node', 'javascript']};
var data1 = 
[
    {
        "name": "Onion",
        "quantity": "4",
        "price": "36"
    },
    {
        "name": "Beans",
        "quantity": "12",
        "price": "24"
    }
];

var template = fs.readFileSync("./Mail/emailverification.html", "utf-8");
var emailVerificationTemplate = fs.readFileSync("./Mail/email_verify.html", "utf-8");
var resetpasswordTemplate = fs.readFileSync("./Mail/resetpassword.html", "utf-8");  // reset password
var orderpurchaseTemplate = fs.readFileSync("./Mail/purchasedetails.html", "utf-8");
var orderCancelTemplate = fs.readFileSync("./Mail/Ordercancelmail.html", "utf-8");
var orderStatusTemplate = fs.readFileSync("./Mail/OrderStatus.html", "utf-8"); // admin
var adminSignupTemplate = fs.readFileSync("./Mail/adminsignup.html", "utf-8"); // admin

var orderPurchasecompileTemplate = handlebars.compile(orderpurchaseTemplate);
var orderCancelcompileTemplate = handlebars.compile(orderCancelTemplate);
var orderStatuscompileTemplate = handlebars.compile(orderStatusTemplate);
var compileTemplate = handlebars.compile(template);
var emailVerifycompileTemplate = handlebars.compile(emailVerificationTemplate);
var resetpasswordcompileTemplate = handlebars.compile(resetpasswordTemplate); // reset password temp
var adminsignupcompileTemplate = handlebars.compile(adminSignupTemplate); // admin

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
	port: 587,
	secure: false, // true for 465, false for other ports
	tls: {rejectUnauthorized: false},
    auth: {
        user: 'sonu.sowibo@gmail.com', // generated ethereal user
        pass: 'sonu@sowibo' // generated ethereal password
    }
	
}));
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
        var URL = "http://18.222.209.138:3000/verifyaccount/"+v_id;
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
    resetPassword : function(toAddress, v_id){
        var URL = "http://18.222.209.138:3000/resetpassword/"+v_id+"/"+toAddress;
        let mailOptions = {
            from: '"Cissa Organics👻" <sonu.sowibo.com>', // sender address
            to: toAddress, // list of receivers
            subject: "[Cissa organics Reset password]", // Subject line
            text: "cissa organics", // plain text body
           // html: "<b>Hello world?</b>" // html body
            //html:compileTemplate({company:"Cissa organics",tags:tags})
            html:resetpasswordcompileTemplate({url: URL})
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
    Orderpurchase : function(toAddress,userName,orderId, time, s_date,data,total,store_name,store_address){
		
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail',
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
            subject: "[Cissa organics Order purchase]", // Subject line
            text: "cissa organics", // plain text body
           // html: "<b>Hello world?</b>" // html body
            //html:compileTemplate({company:"Cissa organics",tags:tags})
            html:orderPurchasecompileTemplate({orderid:orderId,username:userName,orderid:orderId,Time:time,data:data,s_date:s_date,productData:data,totalPrice:total,Store_name:store_name,Store_address:store_address}),
			attachments: [{
                filename: 'logo.png',
                path: __dirname + '/images/logo.png',
                cid: 'CissaLogo' //same cid value as in the html img src
                },
                {
                    filename: orderId+'.png',
                    path: __dirname + '/qr/'+orderId+'.png',
                    cid: 'qrcode' //same cid value as in the html img src
                }
            ]
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
            //smtpTransport.close(); // shut down the connection pool, no more messages
        });
    },
	OrdercancelMail : function(toAddress,userName,orderId,data,total){
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
            from: '"Cissa Organics??" <sonu.sowibo.com>', // sender address
            to: toAddress, // list of receivers
            subject: "[Cissa organics cancel order]", // Subject line
            text: "cissa organics", // plain text body
           // html: "<b>Hello world?</b>" // html body
            //html:compileTemplate({company:"Cissa organics",tags:tags})
            html:orderCancelcompileTemplate({orderid:orderId,username:userName,orderid:orderId,productData:data,totalPrice:total}),
			attachments:[{
                filename: 'logo.png',
                path: __dirname + '/images/logo.png',
                cid: 'CissaLogo' //same cid value as in the html img src
            }]
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
    },
	//admin
	orderStatus : function(toAddress,userName,orderId, time, s_date,data,total,status,status_past){
        console.log(data);
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
            from: '"Cissa Organics" <sonu.sowibo.com>', // sender address
            to: toAddress, // list of receivers
            subject: "[Cissa organics order confirm]", // Subject line
            text: "cissa organics", // plain text body
           // html: "<b>Hello world?</b>" // html body
            //html:compileTemplate({company:"Cissa organics",tags:tags})
            html:orderStatuscompileTemplate({orderid:orderId,username:userName,Time:time,s_date:s_date,productData:data,priceTotal:total,status:status,status_past:status_past})
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
    },
	    adminSignup : function(toAddress, v_id){
        var URL = "http://18.222.209.138:4000/signup/"+v_id+"/"+toAddress;
        let mailOptions = {
            from: '"Cissa Organics👻" <sonu.sowibo.com>', // sender address
            to: toAddress, // list of receivers
            subject: "[Cissa organics Admin Invitation]", // Subject line
			attachments: [{
				filename: 'logo.png',
				path: './Mail/logo.png',
				cid: 'logo@cissaorganics.com' //same cid value as in the html img src
			}],
            text: "cissa organics", // plain text body
           // html: "<b>Hello world?</b>" // html body
            //html:compileTemplate({company:"Cissa organics",tags:tags})
            html:adminsignupcompileTemplate({url: URL})
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
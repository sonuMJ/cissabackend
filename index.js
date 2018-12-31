const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const product = require('./modules/Product');
const user = require('./modules/User');
const admin = require('./modules/Admin');
const cart = require('./modules/Cart');

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(express.static('public'));

//cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, x-csrf-token, X-Requested-With, Content-Type, Accept");
    next();
})

app.use("/product", product);
app.use("/user", user);
app.use("/admin", admin);
app.use("/api/cart", cart);

//admin html page 
app.get("/adminlogin", function(req, res){
    res.sendFile('admin_login.html', { root: path.join(__dirname, '/public/') });
})

//port
app.listen(5000);
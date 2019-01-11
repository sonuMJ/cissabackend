const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const product = require('./modules/Product');
const user = require('./modules/User');
const admin = require('./modules/Admin');
const cart = require('./modules/Cart');
const category = require('./modules/ProductCategory');
const orders = require('./modules/Orders');

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
    res.header("Access-Control-Allow-Headers", "Origin, x-csrf-token, X-Requested-With, Content-Type, Accept,_cid,token,sessionid");
    next();
})

app.use("/product", product);
app.use("/user", user);
app.use("/admin", admin);
app.use("/api/cart", cart);
app.use("/api/category", category);
app.use("/api/order", orders);

//admin html page 
app.get("/adminlogin", function(req, res){
    res.sendFile('admin_login.html', { root: path.join(__dirname, '/public/') });
})

//port
app.listen(5000);
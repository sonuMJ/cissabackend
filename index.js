const express = require('express');
const app = express();
const appAdmin = express();
const bodyParser = require('body-parser');
const path = require('path');

const product = require('./modules/Product');
const user = require('./modules/User');
const admin = require('./modules/Admin');
const cart = require('./modules/Cart');
const category = require('./modules/ProductCategory');
const orders = require('./modules/Orders');
const home = require('./modules/Home');
const books = require('./modules/Books');
const store = require('./modules/Store');
require('dotenv/config');


//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}))

appAdmin.use(bodyParser.json());
appAdmin.use(bodyParser.urlencoded({
    extended:true
}))
//app.use(express.static('public'));

//cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, x-csrf-token, X-Requested-With, Content-Type, Accept,_cid,token,sessionid");
    next();
})
appAdmin.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, x-csrf-token, X-Requested-With, Content-Type, Accept,_cid,token,sessionid");
    next();
})

app.use("/api/product", product);
app.use("/api/user", user);
app.use("/api/admin", admin);
app.use("/api/cart", cart);
app.use("/api/category", category);
app.use("/api/order", orders);
app.use('/api/store', store);

//admin
appAdmin.use("/api/product", product);
appAdmin.use("/api/user", user);
appAdmin.use("/api/admin", admin);
appAdmin.use("/api/cart", cart);
appAdmin.use("/api/category", category);
appAdmin.use("/api/order", orders);
appAdmin.use("/api/home", home);
app.use("/api/books", books);




// Serve any static files
appAdmin.use(express.static(path.join(__dirname, '/admin_build/build')));
app.use(express.static(path.join(__dirname, '/client_build/build')));

//Serve images
appAdmin.use(express.static(path.join(__dirname, '/data/images')));
app.use(express.static(path.join(__dirname, '/data/images')));
//server books images
app.use(express.static(path.join(__dirname, '/data/books')));

//handle admin requests
//app.get('/client', function(req, res) {
  //res.sendFile(path.join(__dirname, '/build/client', 'index.html'));
//});
// Handle React routing, return all requests to React app
appAdmin.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, '/admin_build/build', 'index.html'));
});
appAdmin.all('*', function(req, res) {
  res.sendFile(path.join(__dirname, '/admin_build/build', 'index.html'));
});
app.all('*', function(req, res) {
  res.sendFile(path.join(__dirname, '/client_build/build', 'index.html'));
});
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/client_build/build', 'index.html'));
});
//verifyaccount/sozax1fr54zpv7bsfxfwjjp0539dtjs2q9czu0vpj
app.get('/verifyaccount/:verificationCode', function(req, res) {
  res.sendFile(path.join(__dirname, '/client_build/build', 'index.html'));
});
app.get('/resetpassword/:verificationCode/:emailid', function(req, res) {
  res.sendFile(path.join(__dirname, '/client_build/build', 'index.html'));
});
appAdmin.get('/signup/:verif_code/:email', function(req, res) {
  res.sendFile(path.join(__dirname, '/admin_build/build', 'index.html'));
});

//port
app.listen(3000);
appAdmin.listen(4000);
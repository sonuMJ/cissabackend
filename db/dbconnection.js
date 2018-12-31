const mysql = require("mysql");

const connection = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"",
    database:"cissa"
});

module.exports = connection;
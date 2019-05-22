const express = require("express");
const router = express.Router();
const db = require("../db/dbconnection");
const analytics = require('../Analytics/analytics');

router.get("/getcountall", function(req, res){
    db.query("SELECT (SELECT COUNT(*) FROM products) as product_count,(SELECT COUNT(*) FROM product_category WHERE category_id !='NONE') as category_count,(SELECT COUNT(*) FROM orders INNER JOIN user ON orders.userid = user.user_id) as order_count,(SELECT COUNT(*) FROM user) as user_count", function(err, result){
        if(err){
            console.log(err);
        }
        res.status(200).json(result);
    })
})
router.get("/getanalyticsbybrowser", async function(req, res){
        var result = await analytics.getDataByBrowser();
        res.status(200).json(result);
})
router.get("/getanalyticsbypath", async function(req, res){
        var result = await analytics.getDataByPath();
        res.status(200).json(result);
})
router.get("/getanalyticsbysource", async function(req, res){
        var result = await analytics.getDataBySource();
        res.status(200).json(result);
})
router.get("/getanalyticsbycity", async function(req, res){
        var result = await analytics.getDataByCity();
        res.status(200).json(result);
})

module.exports = router;
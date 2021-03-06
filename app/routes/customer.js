var express = require('express');
var router = express.Router();
var io  = require('./io').io;

const adminCtrl = require('../controllers/admin.js');
const orderCtrl = require('../controllers/order.js');
const accountingCtrl = require('../controllers/accounting.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    adminCtrl.getTableNum(function (rtn) {
        res.render('customer/index', { table_num: rtn.num, booth_id: 1 });
    });
});

router.get('/order', function(req, res, next) {
    adminCtrl.getMenuList(function (data) {
        res.render('customer/order',{ table_num: req.query.tnum, items:data});
    });
});

router.put('/order', function(req, res, next) {
    orderCtrl.order(req.body,function (result) {
        if(result) {
            orderCtrl.getOrderMenu(function(data){
                io.sockets.in('booth-cook1').emit('order:cook', data);
            });

            accountingCtrl.getStockList(function (data) {
                io.sockets.in('booth-accounting1').emit('getStock:accounting', data);
            });

            accountingCtrl.getSalesList(function (data){
                io.sockets.in('booth-accounting1').emit('getSales:accounting', data);
            })
          res.status(200).send();
        }
        else res.status(403).send();
    });
});

module.exports = router;

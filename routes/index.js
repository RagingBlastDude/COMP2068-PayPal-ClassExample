var express = require('express');
var router = express.Router();
const paypalSdk = require('paypal-rest-sdk');
const config = require('../config/global');

paypalSdk.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': config.paypal.client_id,
  'client_secret': config.paypal.client_secret
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/pay', function(req, res, next) {
  const payment = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success",
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Paypal Lessons",
          "sku": "00000",
          "price": "49.99",
          "currency": "CAD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "CAD",
        "total": "49.99"
      },
      "description": "The best Paypal integration guide available for COMP2068 JavaScript Frameworks!"
    }]
  }
  paypalSdk.payment.create(payment, function(error, payment) {
    if (error) {
      throw error;
    } else {
      for(let i = 0; i < payment.links.length; i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});


router.get('/success', function(req, res, next) {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;


  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "CAD",
        "total": "49.99"
      }
    }]
  };


  paypalSdk.payment.execute(paymentId, execute_payment_json,  function(error, payment){
    if(error){
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.status(200).json(payment);
    }
  });
});

router.get('/cancel', function(req, res, next) {
  res.redirect('/');
});


module.exports = router;

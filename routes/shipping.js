const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

// Public or Authenticated (Here open for cart validations)
router.get('/validate-pincode/:pincode', shippingController.validatePincode);

module.exports = router;

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Protected Routes
router.post('/create', authMiddleware, orderController.createOrder);
router.post('/verify-payment', authMiddleware, orderController.verifyPayment);
router.get('/my-orders', authMiddleware, orderController.getMyOrders);
router.get('/track/:orderId', authMiddleware, orderController.trackOrder);

module.exports = router;

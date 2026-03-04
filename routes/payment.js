const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// Route to create a Razorpay order (MOCKED for testing without keys)
router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body; // Amount expected in INR

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        console.log(`[MOCK] Creating order for amount: ${amount}`);
        const mockOrderId = `order_mock_${Date.now()}`;

        // Save order to MongoDB
        const newOrder = new Order({
            orderId: mockOrderId,
            amount: amount * 100,
            currency: 'INR',
            status: 'created'
        });
        await newOrder.save();

        // Mock successful order creation
        res.status(200).json({
            success: true,
            id: mockOrderId,
            amount: amount * 100,
            currency: 'INR'
        });
    } catch (error) {
        console.error('Error in /create-order:', error);
        const errorMsg = error.error ? error.error.description : error.message;
        res.status(500).json({ message: errorMsg || 'Internal Server Error', error: error });
    }
});

// Route to verify Razorpay payment signature (MOCKED for testing without keys)
router.post('/verify-payment', authMiddleware, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        console.log(`[MOCK] Verifying payment for order: ${razorpay_order_id}`);

        // Update order status in MongoDB
        const order = await Order.findOne({ orderId: razorpay_order_id });
        if (order) {
            order.status = 'paid';
            order.paymentId = razorpay_payment_id;
            await order.save();
        }

        // Automatically succeed for mocked tests
        return res.status(200).json({ success: true, message: "Payment verified successfully (MOCKED)" });

    } catch (error) {
        console.error('Error in /verify-payment:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

module.exports = router;

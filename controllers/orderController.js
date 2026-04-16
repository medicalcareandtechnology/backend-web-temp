const Order = require('../models/Order');
const razorpayService = require('../services/razorpayService');
const logisticsService = require('../services/logisticsService');
const emailService = require('../services/emailService');

exports.createOrder = async (req, res) => {
    try {
        let { amount, shippingAddress } = req.body;
        const userId = req.user.id; // Provided by authMiddleware

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required.' });
        }

        // Backward compatibility for legacy frontend without shipping details yet
        if (!shippingAddress) {
             shippingAddress = {
                  fullName: "Legacy User",
                  phone: "0000000000",
                  addressLine1: "Legacy Address",
                  city: "Legacy",
                  state: "Legacy",
                  pincode: "000000"
             };
        }

        // Validate Pincode locally
        if (!/^\d{6}$/.test(shippingAddress.pincode)) {
            return res.status(400).json({ message: 'Invalid pincode format.' });
        }

        const mongoose = require('mongoose');
        const newOrderId = new mongoose.Types.ObjectId();

        // Create Razorpay Order
        const receiptId = `receipt_${newOrderId}`;
        const rpOrder = await razorpayService.createRazorpayOrder(amount, receiptId);

        // Create initial DB record (PENDING)
        const newOrder = new Order({
            _id: newOrderId,
            userId,
            amount,
            status: 'PENDING',
            shippingAddress,
            orderId: rpOrder.id
        });
        await newOrder.save();

        res.status(201).json({
            success: true,
            order: newOrder,
            id: rpOrder.id,                  // Legacy frontend support
            razorpayOrderId: rpOrder.id,     // Future frontend support
            amount: rpOrder.amount, // in paisa
            currency: rpOrder.currency
        });

    } catch (error) {
        console.error('[orderController.createOrder]', error);
        res.status(500).json({ message: error.message || 'Server error during order creation.' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment details for verification.' });
        }

        const isValid = razorpayService.verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment signature.' });
        }

        const order = await Order.findOne({ orderId: razorpay_order_id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found for verification.' });
        }

        // Idempotency check: don't process if already paid
        if (order.status !== 'PENDING') {
            return res.status(200).json({ message: 'Payment already verified.', order });
        }

        order.status = 'CONFIRMED';
        order.paymentId = razorpay_payment_id;
        await order.save();

        // Queue Confirmation Email
        // Assuming user email is part of req.user if populated, or hardcoded for mock. 
        const userEmail = req.user.email || 'user@example.com';
        await emailService.queueEmail(userEmail, 'Order Confirmation', `Your order ${order._id} was successful.`);

        res.status(200).json({ success: true, message: 'Payment verified successfully', order });
    } catch (error) {
        console.error('[orderController.verifyPayment]', error);
        res.status(500).json({ message: error.message || 'Server error during payment verification.' });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('[orderController.getMyOrders]', error);
        res.status(500).json({ message: 'Server error fetching user orders.' });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Return local tracking data + external data if shipped
        let trackingDetails = {
            status: order.status,
            logistics: order.logistics || {}
        };

        if (order.logistics && order.logistics.trackingId) {
            const externalData = await logisticsService.trackOrder(order.logistics.trackingId);
            trackingDetails = { ...trackingDetails, ...externalData };
        }

        res.status(200).json({ success: true, tracking: trackingDetails });
    } catch (error) {
        console.error('[orderController.trackOrder]', error);
        res.status(500).json({ message: 'Server error checking track info.' });
    }
};

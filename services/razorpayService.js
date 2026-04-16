const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

/**
 * Creates a Razorpay Order
 * @param {Number} amount - Amount in INR (not in paisa, will be converted internally) 
 * @param {String} receipt - Internal receipt string
 * @returns {Promise<Object>} Razorpay Order Object
 */
exports.createRazorpayOrder = async (amount, receipt) => {
    try {
        const options = {
            amount: amount * 100, // Razorpay works in paisa
            currency: 'INR',
            receipt: receipt
        };
        
        try {
            const order = await razorpay.orders.create(options);
            return order;
        } catch (apiError) {
            console.log('[MOCK] Razorpay API failed (possibly dummy keys). Generating mocked Order.');
            return {
                id: `order_mock_${Date.now()}`,
                amount: amount * 100,
                currency: 'INR',
                receipt: receipt,
                status: 'created'
            };
        }
    } catch (error) {
        throw new Error(`Razorpay Order Creation Failed: ${error.message || (error.error && error.error.description)}`);
    }
};

/**
 * Verifies Razorpay signature using HMAC SHA256
 * @param {String} orderId 
 * @param {String} paymentId 
 * @param {String} signature 
 * @returns {Boolean}
 */
exports.verifyRazorpaySignature = (orderId, paymentId, signature) => {
    try {
        const body = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
            .update(body.toString())
            .digest('hex');
            
        return expectedSignature === signature;
    } catch (error) {
        throw new Error(`Signature Verification Failed: ${error.message}`);
    }
};

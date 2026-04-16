const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentId: { type: String }, // Razorpay Payment ID
    orderId: { type: String }, // Mostly Internal / Razorpay Order ID combo
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED'],
        default: 'PENDING'
    },
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true, match: [/^\d{10}$/, 'Phone number must be strictly 10 digits.'] },
        alternatePhone: { type: String, match: [/^\d{10}$/, 'Phone number must be strictly 10 digits.'] },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        landmark: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true, match: [/^\d{6}$/, 'Pincode must be strictly 6 digits.'] }
    },
    logistics: {
        trackingId: { type: String },
        courierPartnerName: { type: String },
        estimatedDeliveryDate: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);

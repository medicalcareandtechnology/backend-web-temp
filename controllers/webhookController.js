const Order = require('../models/Order');

exports.handleLogisticsWebhook = async (req, res) => {
    try {
        // e.g., Shiprocket or Delhivery payload usually contains tracking ID and status string
        const payload = req.body; 
        
        console.log('[WEBHOOK] Received logistics event:', payload);

        // Ideally verify a webhook signature token here.
        // const signature = req.headers['x-webhook-signature'];
        // if (!verifySignature(signature, payload)) return res.status(401).send();

        // Assume payload mapping provides robust tracking abstraction
        const trackingId = payload.tracking_id || payload.awb;
        const newStatusData = payload.current_status; // e.g. 'DELIVERED', 'OUT_FOR_DELIVERY'

        if (!trackingId || !newStatusData) {
            return res.status(400).send('Invalid payload structure.');
        }

        // Map external status to internal Enum logic
        let internalStatus = null;
        const normalizedStatus = newStatusData.toUpperCase();

        if (normalizedStatus.includes('DELIVERED')) internalStatus = 'DELIVERED';
        else if (normalizedStatus.includes('OUT FOR DELIVERY')) internalStatus = 'OUT_FOR_DELIVERY';
        else if (normalizedStatus.includes('SHIPPED') || normalizedStatus.includes('IN TRANSIT')) internalStatus = 'SHIPPED';
        else if (normalizedStatus.includes('RETURN') || normalizedStatus.includes('RTO')) internalStatus = 'RETURN_REQUESTED';

        if (internalStatus) {
            // Update order idempotently: only if it's currently logically backwards 
            const order = await Order.findOne({ 'logistics.trackingId': trackingId });
            
            if (order && order.status !== internalStatus) {
                // E.g., don't set to SHIPPED if already DELIVERED
                if (order.status === 'DELIVERED') return res.status(200).send();
                
                order.status = internalStatus;
                await order.save();
                console.log(`[WEBHOOK] Order ${order._id} status updated to ${internalStatus}`);
            }
        }

        res.status(200).send('Webhook Processed');
    } catch (error) {
        console.error('[webhookController.handleLogisticsWebhook]', error);
        res.status(500).send('Internal Server Error');
    }
};

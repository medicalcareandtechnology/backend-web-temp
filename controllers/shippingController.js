const logisticsService = require('../services/logisticsService');

exports.validatePincode = async (req, res) => {
    try {
        const { pincode } = req.params;

        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({ message: 'Invalid pincode format. Must be 6 digits.' });
        }

        const data = await logisticsService.validatePincode(pincode);
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[shippingController.validatePincode]', error);
        res.status(500).json({ message: 'Server error during pincode validation.' });
    }
};

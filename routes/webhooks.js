const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Public Webhook route for courier partner API sync
router.post('/logistics', webhookController.handleLogisticsWebhook);

module.exports = router;

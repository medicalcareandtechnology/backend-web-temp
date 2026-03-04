const Razorpay = require('razorpay');
const rzp = new Razorpay({ key_id: 'dummy_key_id', key_secret: 'dummy_key_secret' });
rzp.orders.create({ amount: 199900, currency: 'INR', receipt: 'receipt_order' })
  .then(console.log)
  .catch(console.error);

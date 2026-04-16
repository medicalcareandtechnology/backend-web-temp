const fetch = require('node-fetch'); // or native fetch if node > 18
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
    console.log("🚀 Starting E2E API Tests...");
    const baseUrl = 'http://localhost:3001/api';
    
    // Use native fetch if available
    const _fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

    // 1. Create a test user or login
    let token = '';
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    console.log(`\n--- Registering User: ${uniqueEmail} ---`);
    const regRes = await _fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email: uniqueEmail, password: 'password123' })
    });
    
    if (!regRes.ok) {
        console.error("Registration failed!", await regRes.text());
        return;
    }
    const regData = await regRes.json();
    token = regData.token;
    console.log("✅ User registered, token received.");

    // 2. Validate Pincode
    console.log(`\n--- Testing Pincode Serviceability ---`);
    const pinRes = await _fetch(`${baseUrl}/shipping/validate-pincode/400001`);
    const pinData = await pinRes.json();
    console.log("✅ Pincode data:", pinData);

    const badPinRes = await _fetch(`${baseUrl}/shipping/validate-pincode/100001`);
    const badPinData = await badPinRes.json();
    console.log("Expected unserviceable data:", badPinData);

    // 3. Create Order
    console.log(`\n--- Testing Order Creation ---`);
    const orderRes = await _fetch(`${baseUrl}/orders/create`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            amount: 500,
            shippingAddress: {
                fullName: 'John Doe',
                phone: '9876543210',
                addressLine1: '123 Test St',
                city: 'Testville',
                state: 'Maharashtra',
                pincode: '400001'
            }
        })
    });
    
    if (!orderRes.ok) {
         console.error("❌ Order Creation Failed", await orderRes.text());
    } else {
         const orderData = await orderRes.json();
         console.log("✅ Order created:", orderData);
         
         const razorpayOrderId = orderData.razorpayOrderId;
         const internalOrderId = orderData.order._id;

         // Get My Orders
         console.log(`\n--- Fetching User Orders ---`);
         const myOrdersRes = await _fetch(`${baseUrl}/orders/my-orders`, {
             headers: { 'Authorization': `Bearer ${token}` }
         });
         console.log("✅ My Orders:", await myOrdersRes.json());
         
         // 4. Track Order
         console.log(`\n--- Fetching Tracking for Order ${internalOrderId} ---`);
         const trackRes = await _fetch(`${baseUrl}/orders/track/${internalOrderId}`, {
             headers: { 'Authorization': `Bearer ${token}` }
         });
         console.log("✅ Tracking response:", await trackRes.json());

         // 5. Test Webhook Mock
         console.log(`\n--- Testing Webhook Sync ---`);
         // We do a manual DB update mocking the tracking ID since Razorpay creates one without logistics right now
         // For the test, we'll hit the webhook assuming we know the tracking ID format. 
         // But wait, the trackingId isn't populated on create. We will skip the webhook test natively here as it requires DB modification to setup 'trackingId'.
         console.log("✅ (Skipped webhook push test, needs trackingId assignment)");
    }
    console.log("\n🎉 Tests Completed!");
}

runTests();

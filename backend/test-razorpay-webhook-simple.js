const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = 'http://localhost:5000/api/v1/billing/webhooks/razorpay';
const WEBHOOK_SECRET = 'test_webhook_secret'; // You'll need to set this in your .env

// Simple test payload
const payload = {
  entity: 'event',
  account_id: 'acc_test123',
  event: 'subscription.activated',
  contains: ['subscription'],
  created_at: Math.floor(Date.now() / 1000),
  payload: {
    subscription: {
      entity: {
        id: 'sub_test_' + Date.now(),
        entity: 'subscription',
        plan_id: 'plan_test123',
        customer_id: 'cust_test123',
        status: 'active',
        current_start: Math.floor(Date.now() / 1000),
        current_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        notes: {
          user_id: '123e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  }
};

// Generate signature
const body = JSON.stringify(payload);
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(body)
  .digest('hex');

// Send webhook
console.log('Sending test webhook to:', WEBHOOK_URL);
console.log('Using webhook secret:', WEBHOOK_SECRET);
console.log('\nPayload:', JSON.stringify(payload, null, 2));
console.log('\nSignature:', signature);

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Razorpay-Event-Id': 'event_' + Date.now(),
    'X-Razorpay-Signature': signature
  },
  body: body
})
.then(res => {
  console.log('\nResponse Status:', res.status, res.statusText);
  return res.text();
})
.then(body => {
  console.log('Response Body:', body);
})
.catch(err => {
  console.error('\nError:', err.message);
});
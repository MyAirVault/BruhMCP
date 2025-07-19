const crypto = require('crypto');
const axios = require('axios');

// Test configuration
const WEBHOOK_URL = 'http://localhost:5000/api/v1/billing/webhooks/razorpay';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';

// Sample webhook payloads for different events
const webhookPayloads = {
  subscriptionActivated: {
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
          charge_at: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          start_at: Math.floor(Date.now() / 1000),
          end_at: null,
          auth_attempts: 0,
          total_count: 0,
          paid_count: 1,
          customer_notify: true,
          created_at: Math.floor(Date.now() / 1000),
          expire_by: null,
          notes: {
            user_id: '123e4567-e89b-12d3-a456-426614174000'
          }
        }
      }
    }
  },
  subscriptionCharged: {
    entity: 'event',
    account_id: 'acc_test123',
    event: 'subscription.charged',
    contains: ['subscription', 'payment'],
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
          paid_count: 2,
          notes: {
            user_id: '123e4567-e89b-12d3-a456-426614174000'
          }
        }
      },
      payment: {
        entity: {
          id: 'pay_test_' + Date.now(),
          entity: 'payment',
          amount: 99900,
          currency: 'INR',
          status: 'captured',
          order_id: null,
          invoice_id: null,
          international: false,
          method: 'card',
          amount_refunded: 0,
          captured: true,
          description: 'Subscription payment',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },
  paymentFailed: {
    entity: 'event',
    account_id: 'acc_test123',
    event: 'payment.failed',
    contains: ['payment'],
    created_at: Math.floor(Date.now() / 1000),
    payload: {
      payment: {
        entity: {
          id: 'pay_test_failed_' + Date.now(),
          entity: 'payment',
          amount: 99900,
          currency: 'INR',
          status: 'failed',
          order_id: null,
          invoice_id: null,
          international: false,
          method: 'card',
          amount_refunded: 0,
          captured: false,
          description: 'Subscription payment',
          error_code: 'BAD_REQUEST_ERROR',
          error_description: 'Card declined',
          created_at: Math.floor(Date.now() / 1000),
          notes: {
            user_id: '123e4567-e89b-12d3-a456-426614174000'
          }
        }
      }
    }
  }
};

async function sendWebhook(eventType) {
  const payload = webhookPayloads[eventType];
  if (!payload) {
    console.error(`Unknown event type: ${eventType}`);
    return;
  }

  // Generate webhook signature
  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  try {
    console.log(`\nSending ${payload.event} webhook...`);
    console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
    
    const response = await axios.post(WEBHOOK_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Event-Id': 'event_' + Date.now(),
        'X-Razorpay-Signature': signature
      }
    });

    console.log(`✓ Success: ${response.status} ${response.statusText}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.error(`✗ Error: ${error.response?.status} ${error.response?.statusText}`);
    console.error(`Response: ${JSON.stringify(error.response?.data, null, 2)}`);
  }
}

async function testAllWebhooks() {
  console.log('Testing Razorpay webhooks...');
  console.log('Using webhook URL:', WEBHOOK_URL);
  console.log('Using webhook secret:', WEBHOOK_SECRET ? 'Set' : 'Not set (using default)');
  
  // Test each webhook event type
  await sendWebhook('subscriptionActivated');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await sendWebhook('subscriptionCharged');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await sendWebhook('paymentFailed');
}

// Run tests
testAllWebhooks().catch(console.error);
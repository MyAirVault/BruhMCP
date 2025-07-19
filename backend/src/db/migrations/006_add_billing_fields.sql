-- Add billing fields to support Stripe/Razorpay payment integration
-- Adds subscription tracking and webhook event handling

BEGIN;

-- Add billing-related columns to existing user_plans table
ALTER TABLE user_plans 
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255), -- Stripe/Razorpay subscription ID
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'none' CHECK (payment_status IN ('none', 'active', 'cancelled', 'failed', 'past_due'));

-- Create webhook_events table for deduplication and tracking
CREATE TABLE IF NOT EXISTS webhook_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_event_id VARCHAR(255) NOT NULL UNIQUE, -- Stripe/Razorpay event ID
    event_type VARCHAR(100) NOT NULL, -- subscription.created, subscription.cancelled, etc.
    payment_gateway VARCHAR(20) NOT NULL CHECK (payment_gateway IN ('stripe', 'razorpay')),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payload JSONB NOT NULL, -- Full webhook payload
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed', 'skipped')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_plans_subscription_id ON user_plans(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_payment_status ON user_plans(payment_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_external_id ON webhook_events(external_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_gateway_type ON webhook_events(payment_gateway, event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(processing_status);

-- Add comments for documentation
COMMENT ON COLUMN user_plans.subscription_id IS 'External subscription ID from Stripe or Razorpay';
COMMENT ON COLUMN user_plans.payment_status IS 'Current payment status: none (free plan), active (paid), cancelled, failed, past_due';
COMMENT ON TABLE webhook_events IS 'Webhook events from payment gateways for deduplication and processing tracking';
COMMENT ON COLUMN webhook_events.external_event_id IS 'Unique event ID from payment gateway to prevent duplicate processing';

COMMIT;
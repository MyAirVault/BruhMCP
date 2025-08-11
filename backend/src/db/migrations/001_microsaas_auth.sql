-- Migration: MicroSAAS Authentication System
-- Description: Complete authentication system with users, tokens, and subscriptions
-- Date: 2025

-- Drop existing tables if they exist (cascading to handle foreign keys)
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_transactions CASCADE;
DROP TABLE IF EXISTS account_credits CASCADE;
DROP TABLE IF EXISTS auth_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create new users table with MicroSAAS schema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Hashed password (bcrypt)
    email_verified BOOLEAN DEFAULT false,
    razorpay_customer_id VARCHAR(255), -- For payment integration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Auth tokens table for OTP, password reset, refresh tokens
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email_otp', 'password_reset', 'email_verification', 'refresh', 'email_change_pending')),
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions table (for future subscription system)
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_code VARCHAR(50) NOT NULL CHECK (plan_code IN ('free', 'pro', 'plus')) DEFAULT 'free',
    razorpay_subscription_id VARCHAR(255) UNIQUE,
    razorpay_customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('created', 'authenticated', 'active', 'past_due', 'cancelled', 'completed', 'paused', 'halted', 'upgraded', 'replaced')) DEFAULT 'active',
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
    current_period_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    cancellation_feedback TEXT,
    pause_count INTEGER DEFAULT 0,
    paused_at TIMESTAMP,
    resume_at TIMESTAMP,
    next_billing_date TIMESTAMP,
    proration_amount INTEGER DEFAULT 0, -- Amount in paise
    discount_amount INTEGER DEFAULT 0, -- Amount in paise
    tax_amount INTEGER DEFAULT 0, -- Amount in paise
    total_amount INTEGER NOT NULL DEFAULT 0, -- Amount in paise
    auto_renewal BOOLEAN DEFAULT true,
    grace_period_days INTEGER DEFAULT 3,
    failed_payment_count INTEGER DEFAULT 0,
    last_payment_attempt TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (current_period_end > current_period_start),
    CHECK (trial_end IS NULL OR trial_end > trial_start),
    CHECK (total_amount >= 0),
    CHECK (pause_count >= 0),
    CHECK (failed_payment_count >= 0)
);

-- Subscription transactions table (for payment tracking)
CREATE TABLE subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    razorpay_payment_id VARCHAR(255) UNIQUE,
    razorpay_order_id VARCHAR(255),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('subscription', 'addon', 'refund', 'adjustment', 'fee')) DEFAULT 'subscription',
    amount INTEGER NOT NULL, -- Amount in paise
    tax_amount INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    fee_amount INTEGER DEFAULT 0,
    net_amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    exchange_rate NUMERIC(10,4) DEFAULT 1.0,
    status VARCHAR(50) NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed', 'cancelled')),
    gateway_status VARCHAR(255),
    method VARCHAR(50), -- Payment method (card, upi, netbanking, etc.)
    method_details_json TEXT, -- JSON string of payment method details
    description TEXT,
    receipt_number VARCHAR(255) UNIQUE,
    invoice_id VARCHAR(255),
    failure_reason TEXT,
    failure_code VARCHAR(50),
    gateway_response_json TEXT, -- JSON string of gateway response
    retry_count INTEGER DEFAULT 0,
    parent_transaction_id UUID REFERENCES subscription_transactions(id),
    processed_at TIMESTAMP,
    settled_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (amount > 0 OR transaction_type = 'refund'),
    CHECK (net_amount >= 0 OR transaction_type = 'refund'),
    CHECK (retry_count >= 0),
    CHECK (exchange_rate > 0)
);

-- Account credits table (for refunds and adjustments)
CREATE TABLE account_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Amount in paise (can be negative for debits)
    currency VARCHAR(10) DEFAULT 'INR',
    description TEXT,
    source_type VARCHAR(50) CHECK (source_type IN ('refund', 'adjustment', 'promotion', 'downgrade')),
    source_id VARCHAR(255), -- Reference to the source transaction or adjustment
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_razorpay_customer_id ON users(razorpay_customer_id);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_email_verified ON users(email_verified, is_active);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_type_user ON auth_tokens(type, user_id);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at) WHERE is_used = false;

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_razorpay_subscription_id ON user_subscriptions(razorpay_subscription_id);
CREATE INDEX idx_user_subscriptions_next_billing ON user_subscriptions(next_billing_date) WHERE status = 'active';

CREATE INDEX idx_subscription_transactions_user_id ON subscription_transactions(user_id);
CREATE INDEX idx_subscription_transactions_subscription_id ON subscription_transactions(subscription_id);
CREATE INDEX idx_subscription_transactions_status ON subscription_transactions(status);
CREATE INDEX idx_subscription_transactions_created_at ON subscription_transactions(created_at DESC);
CREATE INDEX idx_subscription_transactions_razorpay_payment_id ON subscription_transactions(razorpay_payment_id);

CREATE INDEX idx_account_credits_user_id ON account_credits(user_id);
CREATE INDEX idx_account_credits_is_used ON account_credits(is_used, expires_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_transactions_updated_at BEFORE UPDATE ON subscription_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_credits_updated_at BEFORE UPDATE ON account_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription for existing users (if any)
-- This ensures all users have at least a free plan subscription
INSERT INTO user_subscriptions (user_id, plan_code, status, billing_cycle, current_period_start, current_period_end, total_amount)
SELECT 
    id,
    'free',
    'active',
    'monthly',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    0
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_subscriptions.user_id = users.id
);

-- Grant permissions if needed (adjust based on your database user)
-- GRANT ALL ON users TO your_app_user;
-- GRANT ALL ON auth_tokens TO your_app_user;
-- GRANT ALL ON user_subscriptions TO your_app_user;
-- GRANT ALL ON subscription_transactions TO your_app_user;
-- GRANT ALL ON account_credits TO your_app_user;

-- Migration complete
-- To rollback: DROP TABLE account_credits, subscription_transactions, user_subscriptions, auth_tokens, users CASCADE;
-- Add user billing details table for payment information
-- Supports billing address and card management for upgrade plans

BEGIN;

-- Create user_billing_details table
CREATE TABLE IF NOT EXISTS user_billing_details (
    billing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Billing address fields
    address_line1 VARCHAR(255) NOT NULL, -- Required billing address line 1
    address_line2 VARCHAR(255), -- Optional billing address line 2
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    
    -- Card management fields
    cards JSONB DEFAULT '[]', -- Array of card objects with encrypted/tokenized data
    default_card_id VARCHAR(255), -- ID of the default card from payment gateway
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one billing details record per user
    CONSTRAINT unique_user_billing UNIQUE (user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_billing_details_user_id ON user_billing_details(user_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_details_default_card ON user_billing_details(default_card_id);

-- Create trigger to update updated_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_billing_details_updated_at') THEN
        CREATE TRIGGER update_user_billing_details_updated_at BEFORE UPDATE ON user_billing_details
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE user_billing_details IS 'User billing information including address and card management for payment processing';
COMMENT ON COLUMN user_billing_details.address_line1 IS 'Required first line of billing address';
COMMENT ON COLUMN user_billing_details.address_line2 IS 'Optional second line of billing address';
COMMENT ON COLUMN user_billing_details.cards IS 'JSON array of card objects with tokenized payment method data';
COMMENT ON COLUMN user_billing_details.default_card_id IS 'Payment gateway ID of the default card for transactions';

COMMIT;
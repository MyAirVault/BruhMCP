-- Add missing fields to account_credits table to match MicroSAASTemplate exactly
-- This migration adds the required fields for full template compatibility

-- Add missing columns to account_credits table
ALTER TABLE account_credits ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES user_subscriptions(id);
ALTER TABLE account_credits ADD COLUMN IF NOT EXISTS credit_amount INTEGER;
ALTER TABLE account_credits ADD COLUMN IF NOT EXISTS remaining_amount INTEGER;
ALTER TABLE account_credits ADD COLUMN IF NOT EXISTS credit_type VARCHAR(50);
ALTER TABLE account_credits ADD COLUMN IF NOT EXISTS source_transaction_id UUID REFERENCES subscription_transactions(id);
ALTER TABLE account_credits ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE account_credits ADD COLUMN IF NOT EXISTS applied_count INTEGER DEFAULT 0;
ALTER TABLE account_credits ADD COLUMN IF NOT EXISTS last_applied_at TIMESTAMP;

-- Update existing data to populate new fields
UPDATE account_credits SET 
    credit_amount = CASE WHEN amount > 0 THEN amount ELSE 0 END,
    remaining_amount = CASE WHEN amount > 0 AND NOT is_used THEN amount ELSE 0 END,
    credit_type = CASE 
        WHEN source_type = 'refund' THEN 'refund'
        WHEN source_type = 'adjustment' THEN 'adjustment'
        WHEN source_type = 'promotion' THEN 'promotional'
        WHEN source_type = 'downgrade' THEN 'downgrade'
        ELSE 'adjustment'
    END,
    is_active = NOT is_used,
    applied_count = CASE WHEN is_used THEN 1 ELSE 0 END,
    last_applied_at = CASE WHEN is_used THEN used_at ELSE NULL END
WHERE credit_amount IS NULL;

-- Make required fields NOT NULL after populating data
ALTER TABLE account_credits ALTER COLUMN credit_amount SET NOT NULL;
ALTER TABLE account_credits ALTER COLUMN remaining_amount SET NOT NULL;
ALTER TABLE account_credits ALTER COLUMN credit_type SET NOT NULL;

-- Drop old constraint and add new one for credit_type
ALTER TABLE account_credits DROP CONSTRAINT IF EXISTS account_credits_source_type_check;
ALTER TABLE account_credits ADD CONSTRAINT account_credits_credit_type_check 
    CHECK (credit_type IN ('downgrade', 'refund', 'adjustment', 'promotional'));

-- Add new constraints from template
ALTER TABLE account_credits ADD CONSTRAINT account_credits_credit_amount_positive 
    CHECK (credit_amount > 0);
ALTER TABLE account_credits ADD CONSTRAINT account_credits_remaining_amount_valid 
    CHECK (remaining_amount >= 0);
ALTER TABLE account_credits ADD CONSTRAINT account_credits_remaining_amount_limit 
    CHECK (remaining_amount <= credit_amount);
ALTER TABLE account_credits ADD CONSTRAINT account_credits_applied_count_valid 
    CHECK (applied_count >= 0);

-- Create indexes for performance (matching template)
CREATE INDEX IF NOT EXISTS idx_account_credits_active ON account_credits(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_account_credits_subscription ON account_credits(subscription_id);
CREATE INDEX IF NOT EXISTS idx_account_credits_expires ON account_credits(expires_at) WHERE is_active = true AND expires_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN account_credits.credit_amount IS 'Original credit amount in paise (matches MicroSAASTemplate)';
COMMENT ON COLUMN account_credits.remaining_amount IS 'Remaining unused credit amount in paise';
COMMENT ON COLUMN account_credits.credit_type IS 'Type of credit: downgrade, refund, adjustment, promotional';
COMMENT ON COLUMN account_credits.applied_count IS 'Number of times this credit has been applied';
COMMENT ON COLUMN account_credits.subscription_id IS 'Related subscription (optional)';
COMMENT ON COLUMN account_credits.source_transaction_id IS 'Source transaction reference (optional)';
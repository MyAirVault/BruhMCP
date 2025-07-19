-- Add User Plans Table with Active Instance Limits
-- Free users: 1 active instance maximum
-- Pro users: Unlimited active instances

BEGIN;

-- Create user_plans table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS user_plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('free', 'pro')),
    max_instances INTEGER, -- NULL for unlimited (pro), 1 for free
    features JSONB DEFAULT '{}', -- Extensible for future plan features
    expires_at TIMESTAMP, -- For subscription management (NULL = never expires)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one plan per user
    CONSTRAINT unique_user_plan UNIQUE (user_id),
    
    -- Validate max_instances based on plan_type (active instance limits)
    CONSTRAINT check_max_instances_for_plan CHECK (
        (plan_type = 'free' AND max_instances = 1) OR
        (plan_type = 'pro' AND max_instances IS NULL)
    )
);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_plan_type ON user_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_user_plans_expires_at ON user_plans(expires_at);

-- Create trigger to update updated_at timestamp (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_plans_updated_at') THEN
        CREATE TRIGGER update_user_plans_updated_at BEFORE UPDATE ON user_plans
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create function to automatically assign free plan to new users
CREATE OR REPLACE FUNCTION assign_default_plan()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_plans (user_id, plan_type, max_instances, features)
    VALUES (NEW.id, 'free', 1, '{"plan_name": "Free Plan", "description": "1 active MCP instance maximum"}');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-assign free plan to new users (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_assign_free_plan') THEN
        CREATE TRIGGER auto_assign_free_plan
            AFTER INSERT ON users
            FOR EACH ROW
            EXECUTE FUNCTION assign_default_plan();
    END IF;
END $$;

-- Backfill existing users with free plan (active instance limits)
INSERT INTO user_plans (user_id, plan_type, max_instances, features)
SELECT 
    id,
    'free',
    1,
    '{"plan_name": "Free Plan", "description": "1 active MCP instance maximum", "backfilled": true}'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_plans);

-- Add comments for documentation
COMMENT ON TABLE user_plans IS 'User subscription plans with active instance limits and features';
COMMENT ON COLUMN user_plans.plan_type IS 'Plan type: free (1 active instance max), pro (unlimited)';
COMMENT ON COLUMN user_plans.max_instances IS 'Maximum active MCP instances allowed (NULL = unlimited for pro)';
COMMENT ON COLUMN user_plans.features IS 'JSON object containing plan-specific features and metadata';
COMMENT ON COLUMN user_plans.expires_at IS 'When the plan expires (NULL = never expires, mainly for pro subscriptions)';

COMMIT;
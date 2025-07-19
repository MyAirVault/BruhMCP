-- Add User Plans Table for Plan-Based Instance Limits
-- Replaces hard-coded MCP_MAX_INSTANCES with plan-based limits

BEGIN;

-- Create user_plans table
CREATE TABLE user_plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('free', 'pro')),
    max_instances INTEGER, -- NULL for unlimited (pro), 3 for free
    features JSONB DEFAULT '{}', -- Extensible for future plan features
    expires_at TIMESTAMP, -- For subscription management (NULL = never expires)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one plan per user
    CONSTRAINT unique_user_plan UNIQUE (user_id),
    
    -- Validate max_instances based on plan_type
    CONSTRAINT check_max_instances_for_plan CHECK (
        (plan_type = 'free' AND max_instances = 3) OR
        (plan_type = 'pro' AND max_instances IS NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_user_plans_plan_type ON user_plans(plan_type);
CREATE INDEX idx_user_plans_expires_at ON user_plans(expires_at);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_user_plans_updated_at BEFORE UPDATE ON user_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically assign free plan to new users
CREATE OR REPLACE FUNCTION assign_default_plan()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_plans (user_id, plan_type, max_instances, features)
    VALUES (NEW.id, 'free', 3, '{"plan_name": "Free Plan", "description": "Up to 3 MCP instances"}');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-assign free plan to new users
CREATE TRIGGER auto_assign_free_plan
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_plan();

-- Backfill existing users with free plan
INSERT INTO user_plans (user_id, plan_type, max_instances, features)
SELECT 
    id,
    'free',
    3,
    '{"plan_name": "Free Plan", "description": "Up to 3 MCP instances", "backfilled": true}'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_plans);

-- Add comments for documentation
COMMENT ON TABLE user_plans IS 'User subscription plans with instance limits and features';
COMMENT ON COLUMN user_plans.plan_type IS 'Plan type: free (3 instances max), pro (unlimited)';
COMMENT ON COLUMN user_plans.max_instances IS 'Maximum MCP instances allowed (NULL = unlimited for pro)';
COMMENT ON COLUMN user_plans.features IS 'JSON object containing plan-specific features and metadata';
COMMENT ON COLUMN user_plans.expires_at IS 'When the plan expires (NULL = never expires, mainly for pro subscriptions)';

COMMIT;
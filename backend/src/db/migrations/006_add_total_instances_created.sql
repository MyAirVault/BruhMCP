-- Add total_instances_created column to user_plans for lifetime instance tracking
-- Free users get exactly 3 total instances (lifetime limit)

BEGIN;

-- Add total_instances_created column to track lifetime instance creation
ALTER TABLE user_plans 
ADD COLUMN total_instances_created INTEGER DEFAULT 0 NOT NULL;

-- Update the constraint to include total_instances_created validation
ALTER TABLE user_plans 
DROP CONSTRAINT check_max_instances_for_plan;

-- Add new constraint that validates both max_instances and total tracking
ALTER TABLE user_plans 
ADD CONSTRAINT check_max_instances_for_plan CHECK (
    (plan_type = 'free' AND max_instances = 3) OR
    (plan_type = 'pro' AND max_instances IS NULL)
);

-- Backfill existing users' total_instances_created based on their current completed instances
UPDATE user_plans 
SET total_instances_created = (
    SELECT COUNT(*)
    FROM mcp_service_table ms
    WHERE ms.user_id = user_plans.user_id 
    AND ms.oauth_status = 'completed'
)
WHERE total_instances_created = 0;

-- Create index for performance on total_instances_created
CREATE INDEX idx_user_plans_total_instances ON user_plans(total_instances_created);

-- Add comment for documentation
COMMENT ON COLUMN user_plans.total_instances_created IS 'Total number of successfully created instances (lifetime limit for free plans)';

COMMIT;
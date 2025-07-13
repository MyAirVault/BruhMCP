-- Remove port allocation system from MCP instances
-- Migration: 007_remove_port_allocation.sql

-- Drop port-related constraints
ALTER TABLE mcp_instances DROP CONSTRAINT IF EXISTS check_port_range;

-- Remove the assigned_port column entirely
ALTER TABLE mcp_instances DROP COLUMN IF EXISTS assigned_port;

-- Drop any indexes related to assigned_port (if they exist)
-- Note: Unique constraint on assigned_port will be automatically dropped with the column

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Migration 007: Removed port allocation system from MCP instances';
    RAISE NOTICE 'Migration 007: Dropped assigned_port column and related constraints';
END $$;
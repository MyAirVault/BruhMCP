-- Update port range constraint to use new dynamic port range 49160-49999
-- Migration: 006_update_port_range.sql

-- Drop existing port range constraint
ALTER TABLE mcp_instances DROP CONSTRAINT IF EXISTS check_port_range;

-- Add new port range constraint for dynamic ports
ALTER TABLE mcp_instances ADD CONSTRAINT check_port_range 
    CHECK (assigned_port BETWEEN 49160 AND 49999);

-- Update any existing instances with old port assignments (if any exist)
-- This will set them to NULL so they get reassigned new ports
UPDATE mcp_instances 
SET assigned_port = NULL 
WHERE assigned_port IS NOT NULL 
  AND (assigned_port < 49160 OR assigned_port > 49999);

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Migration 006: Updated port range constraint to 49160-49999';
    RAISE NOTICE 'Migration 006: Reset any existing port assignments outside new range';
END $$;
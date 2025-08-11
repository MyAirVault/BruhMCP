-- Cleanup migration: Remove old conflicting tables before new auth system
-- This runs FIRST to ensure a clean slate for the MicroSAAS auth system
-- Run this migration to clean up any existing tables that conflict with the new auth

BEGIN;

-- Drop old/conflicting tables if they exist
-- These will be recreated with proper schema in subsequent migrations

-- Drop old users table with wrong schema (if exists from old system)
DROP TABLE IF EXISTS users CASCADE;

-- Drop old auth-related tables that might conflict
DROP TABLE IF EXISTS auth_tokens CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_transactions CASCADE;
DROP TABLE IF EXISTS account_credits CASCADE;

-- Drop MCP-related tables (will be recreated properly)
DROP TABLE IF EXISTS mcp_credentials CASCADE;
DROP TABLE IF EXISTS mcp_service_table CASCADE;
DROP TABLE IF EXISTS mcp_table CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;

-- Drop billing-related tables (will be recreated properly)
DROP TABLE IF EXISTS user_plans CASCADE;
DROP TABLE IF EXISTS user_billing_details CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;

-- Drop audit tables (will be recreated if needed)
DROP TABLE IF EXISTS token_audit_log CASCADE;
DROP VIEW IF EXISTS token_audit_summary CASCADE;

-- Drop any legacy tables that might exist
DROP TABLE IF EXISTS magic_links CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;

-- Clean up any existing functions that might conflict
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

COMMIT;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Cleanup migration completed: All conflicting tables removed';
END $$;
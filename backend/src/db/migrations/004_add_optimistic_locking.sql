-- Migration 004: Add optimistic locking for concurrent token updates
-- This migration adds version columns to prevent race conditions during token updates

-- Add version column to mcp_credentials table for optimistic locking
ALTER TABLE mcp_credentials 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Add version column to mcp_service_table for instance updates
ALTER TABLE mcp_service_table 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Create index for faster version-based queries
CREATE INDEX IF NOT EXISTS idx_mcp_credentials_version ON mcp_credentials(instance_id, version);
CREATE INDEX IF NOT EXISTS idx_mcp_service_version ON mcp_service_table(instance_id, version);

-- Add last_modified timestamp for better tracking
ALTER TABLE mcp_credentials 
ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP DEFAULT NOW();

ALTER TABLE mcp_service_table 
ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP DEFAULT NOW();

-- Create function to update version and timestamp automatically
CREATE OR REPLACE FUNCTION update_version_and_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically increment version on updates
DROP TRIGGER IF EXISTS update_mcp_credentials_version ON mcp_credentials;
CREATE TRIGGER update_mcp_credentials_version
    BEFORE UPDATE ON mcp_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_version_and_timestamp();

DROP TRIGGER IF EXISTS update_mcp_service_version ON mcp_service_table;
CREATE TRIGGER update_mcp_service_version
    BEFORE UPDATE ON mcp_service_table
    FOR EACH ROW
    EXECUTE FUNCTION update_version_and_timestamp();

-- Insert a test entry to verify the versioning works
DO $$
DECLARE
    test_instance_id UUID := gen_random_uuid();
    test_user_id UUID := gen_random_uuid();
    test_service_id UUID;
    initial_version INTEGER;
    updated_version INTEGER;
BEGIN
    -- Get a service ID for testing
    SELECT mcp_service_id INTO test_service_id FROM mcp_table LIMIT 1;
    
    -- If no service exists, create a temporary one
    IF test_service_id IS NULL THEN
        INSERT INTO mcp_table (mcp_service_name, display_name, type, port)
        VALUES ('test-service', 'Test Service', 'oauth', 3000)
        RETURNING mcp_service_id INTO test_service_id;
    END IF;
    
    -- Create test users table entry if needed
    INSERT INTO users (id, email, first_name, last_name, password_hash) VALUES (test_user_id, 'test@example.com', 'Test', 'User', 'dummy_hash_for_testing');
    
    -- Create test instance
    INSERT INTO mcp_service_table (
        instance_id, 
        user_id, 
        mcp_service_id, 
        custom_name, 
        status, 
        oauth_status
    ) VALUES (
        test_instance_id, 
        test_user_id, 
        test_service_id, 
        'Test Instance', 
        'active', 
        'pending'
    );
    
    -- Create test credentials
    INSERT INTO mcp_credentials (
        instance_id,
        client_id,
        client_secret,
        oauth_status
    ) VALUES (
        test_instance_id,
        'test-client-id',
        'test-client-secret',
        'pending'
    );
    
    -- Get initial version
    SELECT version INTO initial_version FROM mcp_credentials WHERE instance_id = test_instance_id;
    
    -- Update credentials to test version increment
    UPDATE mcp_credentials 
    SET access_token = 'test-token', oauth_status = 'completed', oauth_completed_at = NOW()
    WHERE instance_id = test_instance_id;
    
    -- Get updated version
    SELECT version INTO updated_version FROM mcp_credentials WHERE instance_id = test_instance_id;
    
    -- Verify version was incremented
    IF updated_version != initial_version + 1 THEN
        RAISE EXCEPTION 'Version increment failed: expected %, got %', initial_version + 1, updated_version;
    END IF;
    
    -- Clean up test data
    DELETE FROM mcp_credentials WHERE instance_id = test_instance_id;
    DELETE FROM mcp_service_table WHERE instance_id = test_instance_id;
    DELETE FROM users WHERE id = test_user_id;
    
    -- Clean up test service if we created it
    IF test_service_id IS NOT NULL THEN
        DELETE FROM mcp_table WHERE mcp_service_id = test_service_id AND mcp_service_name = 'test-service';
    END IF;
    
    RAISE NOTICE 'Optimistic locking test passed: version incremented from % to %', initial_version, updated_version;
END $$;

-- Grant permissions to application users
DO $$
BEGIN
    -- Grant permissions to app_user role if it exists
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
        GRANT SELECT, UPDATE ON mcp_credentials TO app_user;
        GRANT SELECT, UPDATE ON mcp_service_table TO app_user;
    END IF;
    
    -- Grant permissions to app_admin role if it exists
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_admin') THEN
        GRANT ALL PRIVILEGES ON mcp_credentials TO app_admin;
        GRANT ALL PRIVILEGES ON mcp_service_table TO app_admin;
        GRANT EXECUTE ON FUNCTION update_version_and_timestamp() TO app_admin;
    END IF;
END $$;

COMMIT;
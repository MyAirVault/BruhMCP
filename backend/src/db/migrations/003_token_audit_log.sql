-- Migration 003: Create token audit log table
-- This table tracks OAuth token operations for monitoring and debugging

CREATE TABLE IF NOT EXISTS token_audit_log (
    audit_id SERIAL PRIMARY KEY,
    instance_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    operation VARCHAR(50) NOT NULL, -- refresh, revoke, validate, etc.
    status VARCHAR(20) NOT NULL, -- success, failure, pending
    method VARCHAR(50), -- oauth_service, direct_oauth, etc.
    error_type VARCHAR(100), -- INVALID_REFRESH_TOKEN, NETWORK_ERROR, etc.
    error_message TEXT,
    metadata JSONB, -- Additional operation metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for common queries
    INDEX idx_token_audit_instance (instance_id),
    INDEX idx_token_audit_operation (operation),
    INDEX idx_token_audit_status (status),
    INDEX idx_token_audit_created (created_at),
    INDEX idx_token_audit_instance_created (instance_id, created_at)
);

-- Add foreign key constraint if mcp_service_table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mcp_service_table') THEN
        ALTER TABLE token_audit_log 
        ADD CONSTRAINT fk_token_audit_instance 
        FOREIGN KEY (instance_id) REFERENCES mcp_service_table(instance_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Create a function to automatically clean up old audit logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_token_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM token_audit_log 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup action
    RAISE NOTICE 'Cleaned up % old token audit log entries', deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view for common audit queries
CREATE OR REPLACE VIEW token_audit_summary AS
SELECT 
    instance_id,
    operation,
    status,
    method,
    COUNT(*) as operation_count,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
    COUNT(CASE WHEN status = 'failure' THEN 1 END) as failure_count,
    ROUND(
        COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as success_rate,
    MAX(created_at) as last_operation,
    MIN(created_at) as first_operation
FROM token_audit_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY instance_id, operation, status, method
ORDER BY instance_id, operation, success_rate DESC;

-- Grant permissions (if roles exist)
DO $$
BEGIN
    -- Grant SELECT, INSERT to application role if it exists
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
        GRANT SELECT, INSERT, DELETE ON token_audit_log TO app_user;
        GRANT USAGE ON SEQUENCE token_audit_log_audit_id_seq TO app_user;
        GRANT SELECT ON token_audit_summary TO app_user;
    END IF;
    
    -- Grant additional permissions to admin role if it exists
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_admin') THEN
        GRANT ALL PRIVILEGES ON token_audit_log TO app_admin;
        GRANT ALL PRIVILEGES ON SEQUENCE token_audit_log_audit_id_seq TO app_admin;
        GRANT ALL PRIVILEGES ON token_audit_summary TO app_admin;
        GRANT EXECUTE ON FUNCTION cleanup_old_token_audit_logs() TO app_admin;
    END IF;
END $$;

-- Insert a test entry to verify the table works
INSERT INTO token_audit_log (
    instance_id, 
    operation, 
    status, 
    method, 
    metadata
) VALUES (
    'migration-test', 
    'table_creation', 
    'success', 
    'migration', 
    '{"migration": "003_token_audit_log", "timestamp": "' || NOW() || '"}'
);

-- Clean up the test entry
DELETE FROM token_audit_log WHERE instance_id = 'migration-test';

COMMIT;
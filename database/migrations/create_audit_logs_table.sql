-- Create audit_logs table for tracking critical system actions
-- Implements partitioning by month for better performance and easier archival

-- Create parent audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success, timestamp DESC);

-- Create partitions for current and upcoming months
-- Note: In production, these should be created dynamically or via scheduled job

-- Current month partition (example for 2024-01)
CREATE TABLE IF NOT EXISTS audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m03 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m04 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m05 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m06 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m07 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m08 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m09 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m10 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m11 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m12 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- 2025 partitions
CREATE TABLE IF NOT EXISTS audit_logs_y2025m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m03 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m04 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m05 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m06 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m07 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m08 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m09 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m10 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m11 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m12 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Function to create new partition for upcoming month
CREATE OR REPLACE FUNCTION create_audit_log_partition(partition_date DATE)
RETURNS void AS $
DECLARE
    partition_name TEXT;
    start_date TEXT;
    end_date TEXT;
BEGIN
    -- Generate partition name (e.g., audit_logs_y2024m01)
    partition_name := 'audit_logs_y' || 
                     TO_CHAR(partition_date, 'YYYY') || 
                     'm' || 
                     TO_CHAR(partition_date, 'MM');
    
    -- Calculate date range
    start_date := TO_CHAR(DATE_TRUNC('month', partition_date), 'YYYY-MM-DD');
    end_date := TO_CHAR(DATE_TRUNC('month', partition_date) + INTERVAL '1 month', 'YYYY-MM-DD');
    
    -- Create partition if it doesn't exist
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_logs FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        start_date,
        end_date
    );
    
    RAISE NOTICE 'Created partition % for range % to %', partition_name, start_date, end_date;
END;
$ LANGUAGE plpgsql;

-- Function to archive old audit logs (older than 90 days)
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS TABLE(archived_count BIGINT) AS $
DECLARE
    cutoff_date TIMESTAMPTZ;
    total_archived BIGINT := 0;
BEGIN
    -- Calculate cutoff date (90 days ago)
    cutoff_date := NOW() - INTERVAL '90 days';
    
    -- In a real implementation, this would move data to cold storage
    -- For now, we'll just count the records that would be archived
    SELECT COUNT(*) INTO total_archived
    FROM audit_logs
    WHERE timestamp < cutoff_date;
    
    -- Log the archival action
    RAISE NOTICE 'Would archive % audit log records older than %', total_archived, cutoff_date;
    
    RETURN QUERY SELECT total_archived;
END;
$ LANGUAGE plpgsql;

-- Function to check if audit logs exceed threshold and trigger archival
CREATE OR REPLACE FUNCTION check_audit_log_threshold()
RETURNS TABLE(should_archive BOOLEAN, total_records BIGINT) AS $
DECLARE
    record_count BIGINT;
    threshold BIGINT := 1000000; -- 1 million records
BEGIN
    -- Count total audit log records
    SELECT COUNT(*) INTO record_count FROM audit_logs;
    
    -- Return whether archival should be triggered
    RETURN QUERY SELECT (record_count > threshold), record_count;
END;
$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Audit log table for tracking critical system actions with monthly partitioning';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., data_export, file_upload, login_failure)';
COMMENT ON COLUMN audit_logs.resource IS 'Resource type affected by the action';
COMMENT ON COLUMN audit_logs.resource_id IS 'Specific resource identifier';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context data in JSON format';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the client making the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string from the client';
COMMENT ON COLUMN audit_logs.timestamp IS 'When the action occurred';
COMMENT ON COLUMN audit_logs.success IS 'Whether the action completed successfully';
COMMENT ON COLUMN audit_logs.error_message IS 'Error details if action failed';

COMMENT ON FUNCTION create_audit_log_partition IS 'Creates a new monthly partition for audit logs';
COMMENT ON FUNCTION archive_old_audit_logs IS 'Archives audit logs older than 90 days';
COMMENT ON FUNCTION check_audit_log_threshold IS 'Checks if audit logs exceed 1 million records threshold';

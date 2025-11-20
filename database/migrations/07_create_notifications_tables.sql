-- Create notifications and notification_preferences tables
-- Fixed to work with existing schema (TEXT IDs instead of UUID)
-- Implements notification system with threshold monitoring for student attendance

-- ============================================================================
-- Notifications Table
-- ============================================================================

-- Create notifications table for storing student notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'attendance_warning',
        'mahroom_alert',
        'tasdiq_alert',
        'file_approved',
        'file_rejected',
        'system_announcement'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'success')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB,
    
    -- Delivery tracking fields
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN (
        'pending',
        'sent',
        'failed',
        'retrying'
    )),
    delivery_attempts INTEGER DEFAULT 0,
    last_delivery_attempt TIMESTAMPTZ,
    delivery_error TEXT
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(student_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_status ON notifications(delivery_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread_by_student ON notifications(student_id, read) WHERE read = false;

-- ============================================================================
-- Notification Preferences Table
-- ============================================================================

-- Create notification_preferences table for managing student notification settings
CREATE TABLE IF NOT EXISTS notification_preferences (
    student_id TEXT PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    attendance_alerts BOOLEAN NOT NULL DEFAULT true,
    file_updates BOOLEAN NOT NULL DEFAULT true,
    system_announcements BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_student_id ON notification_preferences(student_id);

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to insert default notification preferences for a new student
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (student_id)
    VALUES (NEW.id)
    ON CONFLICT (student_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create default preferences for new students
DROP TRIGGER IF EXISTS trigger_create_default_notification_preferences ON students;
CREATE TRIGGER trigger_create_default_notification_preferences
    AFTER INSERT ON students
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

-- Function to update the updated_at timestamp on notification_preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamp on preference changes
DROP TRIGGER IF EXISTS trigger_update_notification_preferences_timestamp ON notification_preferences;
CREATE TRIGGER trigger_update_notification_preferences_timestamp
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_timestamp();

-- Function to mark notification as read and set read_at timestamp
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET read = true,
        read_at = NOW()
    WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count for a student
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_student_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO unread_count
    FROM notifications
    WHERE student_id = p_student_id
    AND read = false;
    
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old read notifications (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    cutoff_date TIMESTAMPTZ;
    total_deleted BIGINT := 0;
BEGIN
    -- Calculate cutoff date (90 days ago)
    cutoff_date := NOW() - INTERVAL '90 days';
    
    -- Delete old read notifications
    DELETE FROM notifications
    WHERE read = true
    AND read_at < cutoff_date;
    
    GET DIAGNOSTICS total_deleted = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % old read notifications', total_deleted;
    
    RETURN QUERY SELECT total_deleted;
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed notification deliveries
CREATE OR REPLACE FUNCTION get_notifications_for_retry(max_attempts INTEGER DEFAULT 3)
RETURNS TABLE(
    id TEXT,
    student_id TEXT,
    type VARCHAR,
    title VARCHAR,
    message TEXT,
    delivery_attempts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.student_id,
        n.type,
        n.title,
        n.message,
        n.delivery_attempts
    FROM notifications n
    WHERE n.delivery_status IN ('failed', 'retrying')
    AND n.delivery_attempts < max_attempts
    AND (
        n.last_delivery_attempt IS NULL 
        OR n.last_delivery_attempt < NOW() - INTERVAL '5 minutes'
    )
    ORDER BY n.created_at ASC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Seed Default Preferences for Existing Students
-- ============================================================================

-- Insert default preferences for all existing students who don't have preferences yet
INSERT INTO notification_preferences (student_id)
SELECT id FROM students
WHERE id NOT IN (SELECT student_id FROM notification_preferences)
ON CONFLICT (student_id) DO NOTHING;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE notifications IS 'Stores notifications for students including attendance alerts and system announcements';
COMMENT ON COLUMN notifications.student_id IS 'ID of the student receiving the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification (attendance_warning, mahroom_alert, tasdiq_alert, etc.)';
COMMENT ON COLUMN notifications.title IS 'Short notification title';
COMMENT ON COLUMN notifications.message IS 'Full notification message';
COMMENT ON COLUMN notifications.severity IS 'Severity level (info, warning, error, success)';
COMMENT ON COLUMN notifications.created_at IS 'When the notification was created';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read';
COMMENT ON COLUMN notifications.read_at IS 'When the notification was marked as read';
COMMENT ON COLUMN notifications.action_url IS 'Optional URL for notification action';
COMMENT ON COLUMN notifications.metadata IS 'Additional notification data in JSON format';
COMMENT ON COLUMN notifications.delivery_status IS 'Current delivery status (pending, sent, failed, retrying)';
COMMENT ON COLUMN notifications.delivery_attempts IS 'Number of delivery attempts made';
COMMENT ON COLUMN notifications.last_delivery_attempt IS 'Timestamp of last delivery attempt';
COMMENT ON COLUMN notifications.delivery_error IS 'Error message from last failed delivery attempt';

COMMENT ON TABLE notification_preferences IS 'Stores notification preferences for each student';
COMMENT ON COLUMN notification_preferences.student_id IS 'ID of the student';
COMMENT ON COLUMN notification_preferences.email_enabled IS 'Whether email notifications are enabled';
COMMENT ON COLUMN notification_preferences.in_app_enabled IS 'Whether in-app notifications are enabled';
COMMENT ON COLUMN notification_preferences.attendance_alerts IS 'Whether attendance threshold alerts are enabled';
COMMENT ON COLUMN notification_preferences.file_updates IS 'Whether file upload status notifications are enabled';
COMMENT ON COLUMN notification_preferences.system_announcements IS 'Whether system announcements are enabled';
COMMENT ON COLUMN notification_preferences.updated_at IS 'When preferences were last updated';

COMMENT ON FUNCTION create_default_notification_preferences IS 'Automatically creates default notification preferences for new students';
COMMENT ON FUNCTION update_notification_preferences_timestamp IS 'Updates the updated_at timestamp when preferences change';
COMMENT ON FUNCTION mark_notification_read IS 'Marks a notification as read and sets read_at timestamp';
COMMENT ON FUNCTION get_unread_notification_count IS 'Returns the count of unread notifications for a student';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Deletes read notifications older than 90 days';
COMMENT ON FUNCTION get_notifications_for_retry IS 'Returns notifications that need retry delivery (max 3 attempts)';

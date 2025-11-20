-- ============================================================================
-- CREATE MISSING TABLES ONLY
-- Run this if medical_certificates, notifications, and audit_logs are missing
-- ============================================================================

-- Temporarily disable RLS checks
SET session_replication_role = replica;

-- ============================================================================
-- Create medical_certificates table
-- ============================================================================

CREATE TABLE IF NOT EXISTS medical_certificates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL,
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    reason TEXT NOT NULL,
    certificate_url TEXT,
    file_path TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    doctor_name VARCHAR(255),
    hospital_clinic VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    scan_status VARCHAR(20) DEFAULT 'pending' CHECK (scan_status IN ('pending', 'scanning', 'clean', 'infected')),
    scan_result JSONB,
    quarantined BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (end_date >= start_date)
);

-- Add foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'medical_certificates_student_id_fkey') THEN
        ALTER TABLE medical_certificates ADD CONSTRAINT medical_certificates_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'medical_certificates_reviewed_by_fkey') THEN
        ALTER TABLE medical_certificates ADD CONSTRAINT medical_certificates_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES office_staff(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_medical_cert_student_id ON medical_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_medical_cert_status ON medical_certificates(status);
CREATE INDEX IF NOT EXISTS idx_medical_cert_submission_date ON medical_certificates(submission_date);

-- ============================================================================
-- Create notifications table
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('attendance_warning', 'mahroom_alert', 'tasdiq_alert', 'file_approved', 'file_rejected', 'system_announcement')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'success')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'retrying')),
    delivery_attempts INTEGER DEFAULT 0,
    last_delivery_attempt TIMESTAMPTZ,
    delivery_error TEXT
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_student_id_fkey') THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(student_id, read, created_at DESC);

-- ============================================================================
-- Create notification_preferences table
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    student_id TEXT PRIMARY KEY,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    attendance_alerts BOOLEAN NOT NULL DEFAULT true,
    file_updates BOOLEAN NOT NULL DEFAULT true,
    system_announcements BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notification_preferences_student_id_fkey') THEN
        ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- Create notification functions
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_notification_read(notification_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE notifications SET read = true, read_at = NOW() WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_student_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unread_count FROM notifications WHERE student_id = p_student_id AND read = false;
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- Seed default preferences for existing students
INSERT INTO notification_preferences (student_id)
SELECT id FROM students
WHERE id NOT IN (SELECT student_id FROM notification_preferences)
ON CONFLICT (student_id) DO NOTHING;

-- ============================================================================
-- Create audit_logs table (simplified - no partitioning for now)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'audit_logs_user_id_fkey') THEN
        ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Re-enable RLS
SET session_replication_role = DEFAULT;

-- ============================================================================
-- Verify tables were created
-- ============================================================================

SELECT 
    'medical_certificates' as table_name, COUNT(*) as row_count FROM medical_certificates
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'notification_preferences', COUNT(*) FROM notification_preferences
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

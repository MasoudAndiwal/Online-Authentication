-- ============================================================================
-- MASTER MIGRATION FILE - FIXED FOR SUPABASE RLS
-- Run this file in Supabase SQL Editor to create all tables
-- ============================================================================
-- 
-- This file executes all migrations in the correct order.
-- It's safe to run multiple times (uses IF NOT EXISTS checks).
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- ============================================================================

-- Temporarily disable RLS checks for migration
SET session_replication_role = replica;

-- Migration 01: Create classes table
-- ============================================================================

CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    section VARCHAR(20) NOT NULL UNIQUE,
    department VARCHAR(100),
    semester VARCHAR(20),
    academic_year VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_classes_section ON classes(section);
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department);

CREATE OR REPLACE FUNCTION update_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS classes_updated_at_trigger ON classes;
CREATE TRIGGER classes_updated_at_trigger
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_classes_updated_at();

-- Migration 02: Create schedule_entries table
-- ============================================================================

CREATE TABLE IF NOT EXISTS schedule_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    class_section VARCHAR(20) NOT NULL,
    teacher_id TEXT,
    subject VARCHAR(100) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (end_time > start_time)
);

-- Add foreign key constraint separately
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'schedule_entries_teacher_id_fkey'
    ) THEN
        ALTER TABLE schedule_entries 
        ADD CONSTRAINT schedule_entries_teacher_id_fkey 
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_schedule_class_section ON schedule_entries(class_section);
CREATE INDEX IF NOT EXISTS idx_schedule_teacher_id ON schedule_entries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_day_of_week ON schedule_entries(day_of_week);

CREATE OR REPLACE FUNCTION update_schedule_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS schedule_entries_updated_at_trigger ON schedule_entries;
CREATE TRIGGER schedule_entries_updated_at_trigger
    BEFORE UPDATE ON schedule_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_schedule_entries_updated_at();

-- Migration 03: Create attendance_records table
-- ============================================================================

CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL,
    class_section VARCHAR(20) NOT NULL,
    schedule_entry_id TEXT,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'EXCUSED', 'NOT_MARKED')),
    marked_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id, class_section, date)
);

-- Add foreign key constraints separately
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'attendance_records_student_id_fkey'
    ) THEN
        ALTER TABLE attendance_records 
        ADD CONSTRAINT attendance_records_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'attendance_records_schedule_entry_id_fkey'
    ) THEN
        ALTER TABLE attendance_records 
        ADD CONSTRAINT attendance_records_schedule_entry_id_fkey 
        FOREIGN KEY (schedule_entry_id) REFERENCES schedule_entries(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'attendance_records_marked_by_fkey'
    ) THEN
        ALTER TABLE attendance_records 
        ADD CONSTRAINT attendance_records_marked_by_fkey 
        FOREIGN KEY (marked_by) REFERENCES teachers(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_section ON attendance_records(class_section);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_marked_by ON attendance_records(marked_by);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date DESC);

CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS attendance_updated_at_trigger ON attendance_records;
CREATE TRIGGER attendance_updated_at_trigger
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_updated_at();

-- Migration 04: Create medical_certificates table
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

-- Add foreign key constraints separately
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'medical_certificates_student_id_fkey'
    ) THEN
        ALTER TABLE medical_certificates 
        ADD CONSTRAINT medical_certificates_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'medical_certificates_reviewed_by_fkey'
    ) THEN
        ALTER TABLE medical_certificates 
        ADD CONSTRAINT medical_certificates_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES office_staff(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_medical_cert_student_id ON medical_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_medical_cert_status ON medical_certificates(status);
CREATE INDEX IF NOT EXISTS idx_medical_cert_submission_date ON medical_certificates(submission_date);
CREATE INDEX IF NOT EXISTS idx_medical_cert_date_range ON medical_certificates(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_medical_cert_scan_status ON medical_certificates(scan_status);
CREATE INDEX IF NOT EXISTS idx_medical_cert_quarantined ON medical_certificates(quarantined) WHERE quarantined = true;

CREATE OR REPLACE FUNCTION update_medical_cert_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS medical_cert_updated_at_trigger ON medical_certificates;
CREATE TRIGGER medical_cert_updated_at_trigger
    BEFORE UPDATE ON medical_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_medical_cert_updated_at();

CREATE OR REPLACE FUNCTION set_medical_cert_reviewed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != 'pending' AND OLD.status = 'pending' THEN
        NEW.reviewed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS medical_cert_reviewed_at_trigger ON medical_certificates;
CREATE TRIGGER medical_cert_reviewed_at_trigger
    BEFORE UPDATE ON medical_certificates
    FOR EACH ROW
    WHEN (NEW.status IS DISTINCT FROM OLD.status)
    EXECUTE FUNCTION set_medical_cert_reviewed_at();

-- Migration 05: Create audit_logs table (with partitioning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
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

-- Add foreign key constraint separately
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'audit_logs_user_id_fkey'
    ) THEN
        ALTER TABLE audit_logs 
        ADD CONSTRAINT audit_logs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success, timestamp DESC);

-- Create partitions for 2025
CREATE TABLE IF NOT EXISTS audit_logs_y2025m01 PARTITION OF audit_logs FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m02 PARTITION OF audit_logs FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m03 PARTITION OF audit_logs FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m04 PARTITION OF audit_logs FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m05 PARTITION OF audit_logs FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m06 PARTITION OF audit_logs FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m07 PARTITION OF audit_logs FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m08 PARTITION OF audit_logs FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m09 PARTITION OF audit_logs FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m10 PARTITION OF audit_logs FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m11 PARTITION OF audit_logs FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_y2025m12 PARTITION OF audit_logs FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Migration 06: Create notifications tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL,
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
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'retrying')),
    delivery_attempts INTEGER DEFAULT 0,
    last_delivery_attempt TIMESTAMPTZ,
    delivery_error TEXT
);

-- Add foreign key constraint separately
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_student_id_fkey'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(student_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_status ON notifications(delivery_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread_by_student ON notifications(student_id, read) WHERE read = false;

CREATE TABLE IF NOT EXISTS notification_preferences (
    student_id TEXT PRIMARY KEY,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    attendance_alerts BOOLEAN NOT NULL DEFAULT true,
    file_updates BOOLEAN NOT NULL DEFAULT true,
    system_announcements BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint separately
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notification_preferences_student_id_fkey'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD CONSTRAINT notification_preferences_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notification_preferences_student_id ON notification_preferences(student_id);

-- Notification functions
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (student_id)
    VALUES (NEW.id)
    ON CONFLICT (student_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_default_notification_preferences ON students;
CREATE TRIGGER trigger_create_default_notification_preferences
    AFTER INSERT ON students
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notification_preferences_timestamp ON notification_preferences;
CREATE TRIGGER trigger_update_notification_preferences_timestamp
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_timestamp();

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

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    cutoff_date TIMESTAMPTZ;
    total_deleted BIGINT := 0;
BEGIN
    cutoff_date := NOW() - INTERVAL '90 days';
    DELETE FROM notifications WHERE read = true AND read_at < cutoff_date;
    GET DIAGNOSTICS total_deleted = ROW_COUNT;
    RETURN QUERY SELECT total_deleted;
END;
$$ LANGUAGE plpgsql;

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
    AND (n.last_delivery_attempt IS NULL OR n.last_delivery_attempt < NOW() - INTERVAL '5 minutes')
    ORDER BY n.created_at ASC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Seed default preferences for existing students
INSERT INTO notification_preferences (student_id)
SELECT id FROM students
WHERE id NOT IN (SELECT student_id FROM notification_preferences)
ON CONFLICT (student_id) DO NOTHING;

-- Re-enable RLS checks
SET session_replication_role = DEFAULT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables were created
SELECT 
    'classes' as table_name, COUNT(*) as row_count FROM classes
UNION ALL
SELECT 'schedule_entries', COUNT(*) FROM schedule_entries
UNION ALL
SELECT 'attendance_records', COUNT(*) FROM attendance_records
UNION ALL
SELECT 'medical_certificates', COUNT(*) FROM medical_certificates
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'notification_preferences', COUNT(*) FROM notification_preferences;

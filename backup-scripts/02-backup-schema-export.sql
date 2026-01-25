-- ============================================
-- SUPABASE DATABASE SCHEMA EXPORT
-- Date: January 25, 2026
-- Project: sgcoinewybdlnjibuatf
-- ============================================

-- This file contains the complete database schema
-- Run this BEFORE restoring data

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE IF NOT EXISTS student_status AS ENUM ('ACTIVE', 'SICK', 'INACTIVE');
CREATE TYPE IF NOT EXISTS teacher_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE IF NOT EXISTS office_role AS ENUM ('ADMIN', 'STAFF', 'MANAGER');

-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE USER TABLES
-- ============================================

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    father_name VARCHAR NOT NULL,
    grandfather_name VARCHAR NOT NULL,
    student_id VARCHAR UNIQUE NOT NULL,
    date_of_birth TIMESTAMPTZ,
    phone VARCHAR UNIQUE NOT NULL,
    father_phone VARCHAR,
    address TEXT NOT NULL,
    programs VARCHAR NOT NULL,
    semester VARCHAR NOT NULL,
    enrollment_year VARCHAR NOT NULL,
    class_section VARCHAR NOT NULL,
    time_slot VARCHAR NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    student_id_ref VARCHAR,
    password VARCHAR NOT NULL,
    status student_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    father_name VARCHAR NOT NULL,
    grandfather_name VARCHAR NOT NULL,
    teacher_id VARCHAR UNIQUE NOT NULL,
    date_of_birth TIMESTAMPTZ,
    phone VARCHAR UNIQUE NOT NULL,
    secondary_phone VARCHAR,
    address TEXT NOT NULL,
    departments TEXT[] DEFAULT ARRAY[]::TEXT[],
    qualification VARCHAR NOT NULL,
    experience VARCHAR NOT NULL,
    specialization VARCHAR NOT NULL,
    subjects TEXT[] DEFAULT ARRAY[]::TEXT[],
    classes TEXT[] DEFAULT ARRAY[]::TEXT[],
    username VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    status teacher_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Office Staff Table
CREATE TABLE IF NOT EXISTS office_staff (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    phone VARCHAR UNIQUE NOT NULL,
    role office_role DEFAULT 'STAFF',
    supabase_user_id TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    username VARCHAR UNIQUE,
    password VARCHAR
);

-- ============================================
-- ACADEMIC TABLES
-- ============================================

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    session VARCHAR NOT NULL CHECK (session IN ('MORNING', 'AFTERNOON')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    major VARCHAR,
    semester INTEGER DEFAULT 1 CHECK (semester >= 1 AND semester <= 8),
    student_count INTEGER DEFAULT 0 CHECK (student_count >= 0)
);

-- Schedule Entries Table
CREATE TABLE IF NOT EXISTS schedule_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id),
    teacher_name VARCHAR NOT NULL,
    subject VARCHAR NOT NULL,
    hours INTEGER NOT NULL CHECK (hours >= 1 AND hours <= 8),
    day_of_week VARCHAR NOT NULL CHECK (day_of_week IN ('saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    teacher_id TEXT REFERENCES teachers(id)
);

-- Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR NOT NULL,
    class_id UUID NOT NULL,
    date DATE NOT NULL,
    period_1_status VARCHAR DEFAULT 'NOT_MARKED',
    period_2_status VARCHAR DEFAULT 'NOT_MARKED',
    period_3_status VARCHAR DEFAULT 'NOT_MARKED',
    period_4_status VARCHAR DEFAULT 'NOT_MARKED',
    period_5_status VARCHAR DEFAULT 'NOT_MARKED',
    period_6_status VARCHAR DEFAULT 'NOT_MARKED',
    period_1_teacher VARCHAR,
    period_2_teacher VARCHAR,
    period_3_teacher VARCHAR,
    period_4_teacher VARCHAR,
    period_5_teacher VARCHAR,
    period_6_teacher VARCHAR,
    period_1_subject VARCHAR,
    period_2_subject VARCHAR,
    period_3_subject VARCHAR,
    period_4_subject VARCHAR,
    period_5_subject VARCHAR,
    period_6_subject VARCHAR,
    marked_by VARCHAR,
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- ============================================
-- MESSAGING SYSTEM TABLES
-- ============================================

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::JSONB,
    conversation_type VARCHAR DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'broadcast')),
    group_name VARCHAR,
    group_description TEXT,
    group_avatar TEXT,
    created_by_id TEXT,
    created_by_type VARCHAR CHECK (created_by_type IN ('teacher', 'office')),
    class_id TEXT
);

COMMENT ON TABLE conversations IS 'Stores conversation metadata between users';

-- Conversation Participants Table
CREATE TABLE IF NOT EXISTS conversation_participants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    user_id TEXT NOT NULL,
    user_type VARCHAR NOT NULL CHECK (user_type IN ('student', 'teacher', 'office')),
    user_name VARCHAR NOT NULL,
    user_avatar TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,
    is_muted BOOLEAN DEFAULT FALSE
);

COMMENT ON TABLE conversation_participants IS 'Links users to conversations with their read status';

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    sender_id TEXT NOT NULL,
    sender_type VARCHAR NOT NULL CHECK (sender_type IN ('student', 'teacher', 'office', 'system')),
    sender_name VARCHAR NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR DEFAULT 'user' CHECK (message_type IN ('user', 'system', 'voice')),
    category VARCHAR DEFAULT 'general' CHECK (category IN ('general', 'attendance_inquiry', 'documentation', 'urgent', 'system_alert', 'system_info')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::JSONB,
    reply_to_id TEXT REFERENCES messages(id),
    is_forwarded BOOLEAN DEFAULT FALSE,
    forwarded_from_id TEXT REFERENCES messages(id),
    original_sender_name VARCHAR,
    search_vector TSVECTOR
);

COMMENT ON TABLE messages IS 'Stores all messages including user and system messages';

-- Message Read Status Table
CREATE TABLE IF NOT EXISTS message_read_status (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    message_id TEXT NOT NULL REFERENCES messages(id),
    user_id TEXT NOT NULL,
    user_type VARCHAR NOT NULL CHECK (user_type IN ('student', 'teacher', 'office')),
    read_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE message_read_status IS 'Tracks which users have read which messages';

-- Message Attachments Table
CREATE TABLE IF NOT EXISTS message_attachments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    message_id TEXT NOT NULL REFERENCES messages(id),
    filename VARCHAR NOT NULL,
    original_filename VARCHAR NOT NULL,
    file_type VARCHAR NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    storage_bucket VARCHAR DEFAULT 'message-attachments',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by_id TEXT NOT NULL,
    uploaded_by_type VARCHAR NOT NULL CHECK (uploaded_by_type IN ('student', 'teacher', 'office')),
    scan_status VARCHAR DEFAULT 'pending' CHECK (scan_status IN ('pending', 'clean', 'infected', 'error')),
    scanned_at TIMESTAMPTZ,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

COMMENT ON TABLE message_attachments IS 'Stores file attachments for messages';

-- Broadcast Messages Table
CREATE TABLE IF NOT EXISTS broadcast_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    sender_id TEXT NOT NULL,
    sender_type VARCHAR NOT NULL CHECK (sender_type IN ('teacher', 'office')),
    sender_name VARCHAR NOT NULL,
    class_id TEXT NOT NULL,
    class_name VARCHAR,
    content TEXT NOT NULL,
    category VARCHAR DEFAULT 'announcement',
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

COMMENT ON TABLE broadcast_messages IS 'Tracks broadcast messages sent to entire classes';

-- Broadcast Recipients Table
CREATE TABLE IF NOT EXISTS broadcast_recipients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    broadcast_id TEXT NOT NULL REFERENCES broadcast_messages(id),
    student_id TEXT NOT NULL,
    student_name VARCHAR,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    message_id TEXT REFERENCES messages(id)
);

COMMENT ON TABLE broadcast_recipients IS 'Tracks delivery status for each broadcast recipient';

-- ============================================
-- NOTIFICATION TABLES
-- ============================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    student_id TEXT NOT NULL REFERENCES students(id),
    type VARCHAR NOT NULL CHECK (type IN ('attendance_warning', 'mahroom_alert', 'tasdiq_alert', 'file_approved', 'file_rejected', 'system_announcement')),
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'success')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB,
    delivery_status VARCHAR DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'retrying')),
    delivery_attempts INTEGER DEFAULT 0,
    last_delivery_attempt TIMESTAMPTZ,
    delivery_error TEXT
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
    student_id TEXT PRIMARY KEY REFERENCES students(id),
    email_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    attendance_alerts BOOLEAN DEFAULT TRUE,
    file_updates BOOLEAN DEFAULT TRUE,
    system_announcements BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Messages Table
CREATE TABLE IF NOT EXISTS system_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    target_user_id TEXT NOT NULL,
    target_user_type VARCHAR NOT NULL CHECK (target_user_type IN ('student', 'teacher', 'office')),
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR NOT NULL CHECK (category IN ('attendance_alert', 'schedule_change', 'announcement', 'reminder', 'warning', 'info')),
    severity VARCHAR DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    action_url TEXT,
    action_label VARCHAR,
    metadata JSONB DEFAULT '{}'::JSONB
);

COMMENT ON TABLE system_messages IS 'Stores automated system notifications for users';

-- ============================================
-- ADDITIONAL TABLES
-- ============================================

-- Medical Certificates Table
CREATE TABLE IF NOT EXISTS medical_certificates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    student_id TEXT NOT NULL REFERENCES students(id),
    submission_date DATE DEFAULT CURRENT_DATE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER GENERATED ALWAYS AS ((end_date - start_date) + 1) STORED,
    reason TEXT NOT NULL,
    certificate_url TEXT,
    file_path TEXT,
    file_name VARCHAR,
    file_size INTEGER,
    doctor_name VARCHAR,
    hospital_clinic VARCHAR,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by TEXT REFERENCES office_staff(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    scan_status VARCHAR DEFAULT 'pending' CHECK (scan_status IN ('pending', 'scanning', 'clean', 'infected')),
    scan_result JSONB,
    quarantined BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email VARCHAR NOT NULL,
    reset_code VARCHAR NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens for office staff with expiration';

-- Scheduled Messages Table
CREATE TABLE IF NOT EXISTS scheduled_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    sender_id TEXT NOT NULL,
    sender_type VARCHAR NOT NULL CHECK (sender_type IN ('teacher', 'office')),
    sender_name VARCHAR NOT NULL,
    conversation_id TEXT REFERENCES conversations(id),
    class_id TEXT,
    content TEXT NOT NULL,
    category VARCHAR DEFAULT 'general',
    attachment_ids JSONB DEFAULT '[]'::JSONB,
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR DEFAULT 'Asia/Kabul',
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

COMMENT ON TABLE scheduled_messages IS 'Stores messages scheduled for future delivery';

-- Voice Messages Table
CREATE TABLE IF NOT EXISTS voice_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    message_id TEXT UNIQUE NOT NULL REFERENCES messages(id),
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR DEFAULT 'audio/webm',
    waveform_data JSONB,
    transcription TEXT,
    transcription_status VARCHAR DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE voice_messages IS 'Stores voice message audio files and metadata';

-- Allowed File Types Table
CREATE TABLE IF NOT EXISTS allowed_file_types (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_type VARCHAR NOT NULL CHECK (user_type IN ('student', 'teacher', 'office')),
    mime_type VARCHAR NOT NULL,
    extension VARCHAR NOT NULL,
    max_size_bytes INTEGER DEFAULT 10485760,
    description VARCHAR,
    is_active BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE allowed_file_types IS 'Configuration for allowed file types per user role';

-- ============================================
-- INDEXES (Recommended for Performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_class_section ON students(class_section);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records_new(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records_new(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================
-- COMPLETION
-- ============================================

-- Schema export complete
-- Next steps:
-- 1. Restore user data from 01-backup-users.sql
-- 2. Restore student data (if available)
-- 3. Restore messaging and attendance data
-- 4. Verify all foreign key relationships

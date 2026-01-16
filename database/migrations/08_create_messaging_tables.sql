-- ============================================================================
-- Messaging System Tables
-- ============================================================================
-- This migration creates the complete messaging system for:
-- 1. System messages (automated notifications)
-- 2. User-to-user messages (student <-> teacher, teacher <-> office, office <-> student)
--
-- Message Types:
-- - system: Automated system notifications
-- - user: Direct messages between users
--
-- Permissions:
-- - Students can ONLY message teachers (not office)
-- - Teachers can message students and office
-- - Office can message students and teachers
--
-- File Restrictions:
-- - Students: text, images (jpg, png), pdf, word, excel, powerpoint
-- - Teachers/Office: any file type
-- ============================================================================

-- ============================================================================
-- Conversations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for sorting by last message
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- ============================================================================
-- Conversation Participants Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'office')),
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    unread_count INTEGER NOT NULL DEFAULT 0,
    is_muted BOOLEAN NOT NULL DEFAULT false,
    
    -- Ensure unique participant per conversation
    UNIQUE(conversation_id, user_id, user_type)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_unread ON conversation_participants(user_id, user_type, unread_count) WHERE unread_count > 0;

-- ============================================================================
-- Messages Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Sender information
    sender_id TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('student', 'teacher', 'office', 'system')),
    sender_name VARCHAR(255) NOT NULL,
    
    -- Message content
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (message_type IN ('user', 'system')),
    category VARCHAR(30) NOT NULL DEFAULT 'general' CHECK (category IN (
        'general',
        'attendance_inquiry',
        'documentation',
        'urgent',
        'system_alert',
        'system_info'
    )),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    -- Status
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    
    -- Metadata for system messages
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted ON messages(conversation_id, created_at DESC) WHERE is_deleted = false;

-- ============================================================================
-- Message Read Status Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS message_read_status (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'office')),
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique read status per user per message
    UNIQUE(message_id, user_id, user_type)
);

-- Index for checking read status
CREATE INDEX IF NOT EXISTS idx_message_read_status_message ON message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user ON message_read_status(user_id, user_type);

-- ============================================================================
-- Message Attachments Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS message_attachments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    
    -- File information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    
    -- Storage information
    storage_path TEXT NOT NULL,
    storage_bucket VARCHAR(100) NOT NULL DEFAULT 'message-attachments',
    
    -- Metadata
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    uploaded_by_id TEXT NOT NULL,
    uploaded_by_type VARCHAR(20) NOT NULL CHECK (uploaded_by_type IN ('student', 'teacher', 'office')),
    
    -- Virus scan status
    scan_status VARCHAR(20) DEFAULT 'pending' CHECK (scan_status IN ('pending', 'clean', 'infected', 'error')),
    scanned_at TIMESTAMPTZ,
    
    -- Thumbnail for images
    thumbnail_url TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_uploader ON message_attachments(uploaded_by_id, uploaded_by_type);

-- ============================================================================
-- System Messages Table (for automated notifications that appear in messaging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Target user
    target_user_id TEXT NOT NULL,
    target_user_type VARCHAR(20) NOT NULL CHECK (target_user_type IN ('student', 'teacher', 'office')),
    
    -- Message content
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'attendance_alert',
        'schedule_change',
        'announcement',
        'reminder',
        'warning',
        'info'
    )),
    severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Status
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    is_dismissed BOOLEAN NOT NULL DEFAULT false,
    dismissed_at TIMESTAMPTZ,
    
    -- Action
    action_url TEXT,
    action_label VARCHAR(100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_system_messages_target ON system_messages(target_user_id, target_user_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_messages_unread ON system_messages(target_user_id, target_user_type, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_system_messages_category ON system_messages(category, created_at DESC);

-- ============================================================================
-- Allowed File Types Configuration Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS allowed_file_types (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'office')),
    mime_type VARCHAR(100) NOT NULL,
    extension VARCHAR(20) NOT NULL,
    max_size_bytes INTEGER NOT NULL DEFAULT 10485760, -- 10MB default
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    UNIQUE(user_type, mime_type)
);

-- Insert default allowed file types for students
INSERT INTO allowed_file_types (user_type, mime_type, extension, max_size_bytes, description) VALUES
    -- Text
    ('student', 'text/plain', '.txt', 5242880, 'Plain text files'),
    -- Images
    ('student', 'image/jpeg', '.jpg', 10485760, 'JPEG images'),
    ('student', 'image/png', '.png', 10485760, 'PNG images'),
    -- PDF
    ('student', 'application/pdf', '.pdf', 20971520, 'PDF documents'),
    -- Word
    ('student', 'application/msword', '.doc', 20971520, 'Word documents'),
    ('student', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx', 20971520, 'Word documents'),
    -- Excel
    ('student', 'application/vnd.ms-excel', '.xls', 20971520, 'Excel spreadsheets'),
    ('student', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx', 20971520, 'Excel spreadsheets'),
    -- PowerPoint
    ('student', 'application/vnd.ms-powerpoint', '.ppt', 52428800, 'PowerPoint presentations'),
    ('student', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', '.pptx', 52428800, 'PowerPoint presentations')
ON CONFLICT (user_type, mime_type) DO NOTHING;

-- Teachers and Office can send any file type (we'll handle this in application logic)
-- But we add common types for reference
INSERT INTO allowed_file_types (user_type, mime_type, extension, max_size_bytes, description) VALUES
    ('teacher', '*/*', '.*', 104857600, 'All file types allowed'),
    ('office', '*/*', '.*', 104857600, 'All file types allowed')
ON CONFLICT (user_type, mime_type) DO NOTHING;

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to update conversation's last_message_at and preview
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    -- Update unread count for other participants
    UPDATE conversation_participants
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
      AND NOT (user_id = NEW.sender_id AND user_type = NEW.sender_type);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating conversation on new message
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Function to reset unread count when messages are read
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversation_participants
    SET 
        unread_count = 0,
        last_read_at = NOW()
    WHERE conversation_id = (SELECT conversation_id FROM messages WHERE id = NEW.message_id)
      AND user_id = NEW.user_id
      AND user_type = NEW.user_type;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for resetting unread count
DROP TRIGGER IF EXISTS trigger_reset_unread_count ON message_read_status;
CREATE TRIGGER trigger_reset_unread_count
    AFTER INSERT ON message_read_status
    FOR EACH ROW
    EXECUTE FUNCTION reset_unread_count();

-- ============================================================================
-- Views
-- ============================================================================

-- View for getting conversation list with participant info
CREATE OR REPLACE VIEW conversation_list_view AS
SELECT 
    c.id AS conversation_id,
    c.last_message_at,
    c.last_message_preview,
    c.is_archived,
    cp.user_id,
    cp.user_type,
    cp.unread_count,
    cp.is_muted,
    cp.last_read_at,
    -- Get other participant info
    other_cp.user_id AS other_user_id,
    other_cp.user_type AS other_user_type,
    other_cp.user_name AS other_user_name,
    other_cp.user_avatar AS other_user_avatar
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
JOIN conversation_participants other_cp ON c.id = other_cp.conversation_id 
    AND (other_cp.user_id != cp.user_id OR other_cp.user_type != cp.user_type)
WHERE c.is_archived = false;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_messages ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your authentication system
-- Example policies (adjust based on your auth setup):

-- Policy for conversation_participants: users can only see their own participations
-- CREATE POLICY "Users can view own participations" ON conversation_participants
--     FOR SELECT USING (user_id = auth.uid()::text);

-- Policy for messages: users can only see messages in their conversations
-- CREATE POLICY "Users can view messages in their conversations" ON messages
--     FOR SELECT USING (
--         conversation_id IN (
--             SELECT conversation_id FROM conversation_participants 
--             WHERE user_id = auth.uid()::text
--         )
--     );

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE conversations IS 'Stores conversation metadata between users';
COMMENT ON TABLE conversation_participants IS 'Links users to conversations with their read status';
COMMENT ON TABLE messages IS 'Stores all messages including user and system messages';
COMMENT ON TABLE message_read_status IS 'Tracks which users have read which messages';
COMMENT ON TABLE message_attachments IS 'Stores file attachments for messages';
COMMENT ON TABLE system_messages IS 'Stores automated system notifications for users';
COMMENT ON TABLE allowed_file_types IS 'Configuration for allowed file types per user role';

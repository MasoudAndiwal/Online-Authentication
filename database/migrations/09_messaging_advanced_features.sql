-- ============================================================================
-- Advanced Messaging Features Migration
-- ============================================================================
-- This migration adds:
-- 1. Group Messages (Teacher to all students in a class)
-- 2. Reply/Forward functionality
-- 3. Voice Messages support
-- 4. Full-text search in messages
-- 5. Scheduled messages
-- ============================================================================

-- ============================================================================
-- 1. GROUP CONVERSATIONS SUPPORT
-- ============================================================================

-- Add conversation type to support group chats
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS conversation_type VARCHAR(20) DEFAULT 'direct' 
CHECK (conversation_type IN ('direct', 'group', 'broadcast'));

-- Add group-specific fields
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS group_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS group_description TEXT,
ADD COLUMN IF NOT EXISTS group_avatar TEXT,
ADD COLUMN IF NOT EXISTS created_by_id TEXT,
ADD COLUMN IF NOT EXISTS created_by_type VARCHAR(20) CHECK (created_by_type IN ('teacher', 'office'));

-- Add class reference for class-based groups
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS class_id TEXT;

-- Index for class-based conversations
CREATE INDEX IF NOT EXISTS idx_conversations_class ON conversations(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);

-- ============================================================================
-- 2. REPLY AND FORWARD SUPPORT
-- ============================================================================

-- Add reply_to field to messages
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS reply_to_id TEXT REFERENCES messages(id) ON DELETE SET NULL;

-- Add forward information
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS is_forwarded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS forwarded_from_id TEXT REFERENCES messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS original_sender_name VARCHAR(255);

-- Index for replies
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- ============================================================================
-- 3. VOICE MESSAGES SUPPORT
-- ============================================================================

-- Create voice messages table
CREATE TABLE IF NOT EXISTS voice_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    
    -- Audio file information
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(50) NOT NULL DEFAULT 'audio/webm',
    
    -- Waveform data for visualization (stored as JSON array of amplitudes)
    waveform_data JSONB,
    
    -- Transcription (optional - for accessibility)
    transcription TEXT,
    transcription_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(message_id)
);

-- Index for voice messages
CREATE INDEX IF NOT EXISTS idx_voice_messages_message ON voice_messages(message_id);

-- Add voice message type to messages
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_message_type_check;

ALTER TABLE messages
ADD CONSTRAINT messages_message_type_check 
CHECK (message_type IN ('user', 'system', 'voice'));

-- ============================================================================
-- 4. FULL-TEXT SEARCH SUPPORT
-- ============================================================================

-- Add search vector column to messages
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('simple', COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
DROP TRIGGER IF EXISTS trigger_update_message_search_vector ON messages;
CREATE TRIGGER trigger_update_message_search_vector
    BEFORE INSERT OR UPDATE OF content ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_message_search_vector();

-- Update existing messages
UPDATE messages SET search_vector = to_tsvector('simple', COALESCE(content, ''))
WHERE search_vector IS NULL;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_messages_search ON messages USING GIN(search_vector);

-- Create search function
CREATE OR REPLACE FUNCTION search_messages(
    p_user_id TEXT,
    p_user_type VARCHAR(20),
    p_search_query TEXT,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    message_id TEXT,
    conversation_id TEXT,
    content TEXT,
    sender_name VARCHAR(255),
    created_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS message_id,
        m.conversation_id,
        m.content,
        m.sender_name,
        m.created_at,
        ts_rank(m.search_vector, plainto_tsquery('simple', p_search_query)) AS rank
    FROM messages m
    JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE cp.user_id = p_user_id
      AND cp.user_type = p_user_type
      AND m.is_deleted = false
      AND m.search_vector @@ plainto_tsquery('simple', p_search_query)
    ORDER BY rank DESC, m.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. SCHEDULED MESSAGES
-- ============================================================================

-- Create scheduled messages table
CREATE TABLE IF NOT EXISTS scheduled_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Sender information
    sender_id TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('teacher', 'office')),
    sender_name VARCHAR(255) NOT NULL,
    
    -- Target (can be conversation or broadcast to class)
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    class_id TEXT, -- For broadcast to class
    
    -- Message content
    content TEXT NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'general',
    
    -- Attachments stored as JSON array of attachment IDs (uploaded beforehand)
    attachment_ids JSONB DEFAULT '[]'::jsonb,
    
    -- Schedule information
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Kabul',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    -- Ensure either conversation_id or class_id is set
    CONSTRAINT scheduled_message_target CHECK (
        (conversation_id IS NOT NULL AND class_id IS NULL) OR
        (conversation_id IS NULL AND class_id IS NOT NULL)
    )
);

-- Indexes for scheduled messages
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_sender ON scheduled_messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_pending ON scheduled_messages(scheduled_at, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_class ON scheduled_messages(class_id) WHERE class_id IS NOT NULL;

-- ============================================================================
-- 6. BROADCAST MESSAGES (Teacher to all students in class)
-- ============================================================================

-- Create broadcast messages table for tracking
CREATE TABLE IF NOT EXISTS broadcast_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Sender (teacher or office)
    sender_id TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('teacher', 'office')),
    sender_name VARCHAR(255) NOT NULL,
    
    -- Target class
    class_id TEXT NOT NULL,
    class_name VARCHAR(255),
    
    -- Message content
    content TEXT NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'announcement',
    
    -- Statistics
    total_recipients INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    read_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Track individual delivery status
CREATE TABLE IF NOT EXISTS broadcast_recipients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    broadcast_id TEXT NOT NULL REFERENCES broadcast_messages(id) ON DELETE CASCADE,
    
    -- Recipient student
    student_id TEXT NOT NULL,
    student_name VARCHAR(255),
    
    -- Delivery status
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    
    -- The actual message created for this recipient
    message_id TEXT REFERENCES messages(id) ON DELETE SET NULL,
    
    UNIQUE(broadcast_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_sender ON broadcast_messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_class ON broadcast_messages(class_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_broadcast ON broadcast_recipients(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_student ON broadcast_recipients(student_id);

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to create a group conversation for a class
CREATE OR REPLACE FUNCTION create_class_group_conversation(
    p_class_id TEXT,
    p_class_name VARCHAR(255),
    p_teacher_id TEXT,
    p_teacher_name VARCHAR(255)
)
RETURNS TEXT AS $$
DECLARE
    v_conversation_id TEXT;
    v_student RECORD;
BEGIN
    -- Check if group already exists for this class
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE class_id = p_class_id AND conversation_type = 'group';
    
    IF v_conversation_id IS NOT NULL THEN
        RETURN v_conversation_id;
    END IF;
    
    -- Create new group conversation
    INSERT INTO conversations (
        conversation_type,
        group_name,
        group_description,
        class_id,
        created_by_id,
        created_by_type
    ) VALUES (
        'group',
        p_class_name,
        'گروه کلاس ' || p_class_name,
        p_class_id,
        p_teacher_id,
        'teacher'
    ) RETURNING id INTO v_conversation_id;
    
    -- Add teacher as participant
    INSERT INTO conversation_participants (
        conversation_id,
        user_id,
        user_type,
        user_name
    ) VALUES (
        v_conversation_id,
        p_teacher_id,
        'teacher',
        p_teacher_name
    );
    
    -- Add all students in the class as participants
    FOR v_student IN 
        SELECT s.id, s.name 
        FROM students s
        JOIN classes c ON s.class_id = c.id
        WHERE c.id = p_class_id
    LOOP
        INSERT INTO conversation_participants (
            conversation_id,
            user_id,
            user_type,
            user_name
        ) VALUES (
            v_conversation_id,
            v_student.id,
            'student',
            v_student.name
        );
    END LOOP;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send broadcast message to all students in a class
CREATE OR REPLACE FUNCTION send_broadcast_to_class(
    p_sender_id TEXT,
    p_sender_type VARCHAR(20),
    p_sender_name VARCHAR(255),
    p_class_id TEXT,
    p_content TEXT,
    p_category VARCHAR(30) DEFAULT 'announcement'
)
RETURNS TEXT AS $$
DECLARE
    v_broadcast_id TEXT;
    v_class_name VARCHAR(255);
    v_student RECORD;
    v_conversation_id TEXT;
    v_message_id TEXT;
    v_total_recipients INTEGER := 0;
BEGIN
    -- Get class name
    SELECT name INTO v_class_name FROM classes WHERE id = p_class_id;
    
    -- Create broadcast record
    INSERT INTO broadcast_messages (
        sender_id,
        sender_type,
        sender_name,
        class_id,
        class_name,
        content,
        category
    ) VALUES (
        p_sender_id,
        p_sender_type,
        p_sender_name,
        p_class_id,
        v_class_name,
        p_content,
        p_category
    ) RETURNING id INTO v_broadcast_id;
    
    -- Send to each student in the class
    FOR v_student IN 
        SELECT s.id, s.name 
        FROM students s
        WHERE s.class_id = p_class_id
    LOOP
        -- Get or create direct conversation with student
        SELECT c.id INTO v_conversation_id
        FROM conversations c
        JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
        JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
        WHERE c.conversation_type = 'direct'
          AND cp1.user_id = p_sender_id AND cp1.user_type = p_sender_type
          AND cp2.user_id = v_student.id AND cp2.user_type = 'student';
        
        IF v_conversation_id IS NULL THEN
            -- Create new conversation
            INSERT INTO conversations (conversation_type)
            VALUES ('direct')
            RETURNING id INTO v_conversation_id;
            
            -- Add participants
            INSERT INTO conversation_participants (conversation_id, user_id, user_type, user_name)
            VALUES 
                (v_conversation_id, p_sender_id, p_sender_type, p_sender_name),
                (v_conversation_id, v_student.id, 'student', v_student.name);
        END IF;
        
        -- Create message
        INSERT INTO messages (
            conversation_id,
            sender_id,
            sender_type,
            sender_name,
            content,
            category,
            metadata
        ) VALUES (
            v_conversation_id,
            p_sender_id,
            p_sender_type,
            p_sender_name,
            p_content,
            p_category,
            jsonb_build_object('broadcast_id', v_broadcast_id, 'is_broadcast', true)
        ) RETURNING id INTO v_message_id;
        
        -- Track recipient
        INSERT INTO broadcast_recipients (
            broadcast_id,
            student_id,
            student_name,
            message_id,
            delivered_at
        ) VALUES (
            v_broadcast_id,
            v_student.id,
            v_student.name,
            v_message_id,
            NOW()
        );
        
        v_total_recipients := v_total_recipients + 1;
    END LOOP;
    
    -- Update total recipients count
    UPDATE broadcast_messages
    SET total_recipients = v_total_recipients,
        delivered_count = v_total_recipients
    WHERE id = v_broadcast_id;
    
    RETURN v_broadcast_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. VIEWS FOR ADVANCED FEATURES
-- ============================================================================

-- View for group conversations
CREATE OR REPLACE VIEW group_conversations_view AS
SELECT 
    c.id AS conversation_id,
    c.group_name,
    c.group_description,
    c.class_id,
    c.created_by_id,
    c.created_by_type,
    c.last_message_at,
    c.last_message_preview,
    cp.user_id,
    cp.user_type,
    cp.unread_count,
    (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id) AS member_count
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE c.conversation_type = 'group'
  AND c.is_archived = false;

-- View for broadcast message statistics
CREATE OR REPLACE VIEW broadcast_stats_view AS
SELECT 
    bm.id AS broadcast_id,
    bm.sender_id,
    bm.sender_name,
    bm.class_id,
    bm.class_name,
    bm.content,
    bm.created_at,
    bm.total_recipients,
    bm.delivered_count,
    bm.read_count,
    CASE 
        WHEN bm.total_recipients > 0 
        THEN ROUND((bm.read_count::NUMERIC / bm.total_recipients) * 100, 1)
        ELSE 0 
    END AS read_percentage
FROM broadcast_messages bm;

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON TABLE voice_messages IS 'Stores voice message audio files and metadata';
COMMENT ON TABLE scheduled_messages IS 'Stores messages scheduled for future delivery';
COMMENT ON TABLE broadcast_messages IS 'Tracks broadcast messages sent to entire classes';
COMMENT ON TABLE broadcast_recipients IS 'Tracks delivery status for each broadcast recipient';

COMMENT ON FUNCTION search_messages IS 'Full-text search across user messages';
COMMENT ON FUNCTION create_class_group_conversation IS 'Creates a group conversation for a class with all students';
COMMENT ON FUNCTION send_broadcast_to_class IS 'Sends a message to all students in a class';

-- ============================================================================
-- 10. ALLOWED VOICE MESSAGE TYPES
-- ============================================================================

-- Add voice message types to allowed file types
INSERT INTO allowed_file_types (user_type, mime_type, extension, max_size_bytes, description) VALUES
    ('student', 'audio/webm', '.webm', 10485760, 'Voice messages'),
    ('student', 'audio/mp4', '.m4a', 10485760, 'Voice messages'),
    ('student', 'audio/mpeg', '.mp3', 10485760, 'Voice messages'),
    ('teacher', 'audio/webm', '.webm', 52428800, 'Voice messages'),
    ('teacher', 'audio/mp4', '.m4a', 52428800, 'Voice messages'),
    ('teacher', 'audio/mpeg', '.mp3', 52428800, 'Voice messages'),
    ('office', 'audio/webm', '.webm', 52428800, 'Voice messages'),
    ('office', 'audio/mp4', '.m4a', 52428800, 'Voice messages'),
    ('office', 'audio/mpeg', '.mp3', 52428800, 'Voice messages')
ON CONFLICT (user_type, mime_type) DO NOTHING;

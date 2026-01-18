-- Fix the send_broadcast_to_class function to handle UUID/TEXT type mismatch
-- This ensures proper type casting when comparing IDs

DROP FUNCTION IF EXISTS send_broadcast_to_class(TEXT, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR);

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
    -- Get class name with explicit type casting
    SELECT name INTO v_class_name 
    FROM classes 
    WHERE id::text = p_class_id;
    
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
    
    -- Send to each student in the class with explicit type casting
    FOR v_student IN 
        SELECT s.id::text as id, s.name 
        FROM students s
        WHERE s.class_id::text = p_class_id
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

COMMENT ON FUNCTION send_broadcast_to_class IS 'Sends a message to all students in a class with proper UUID/TEXT type casting';

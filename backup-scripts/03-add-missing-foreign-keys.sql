-- =====================================================
-- ADD MISSING FOREIGN KEY CONSTRAINTS
-- =====================================================
-- Project: sgcoinewybdlnjibuatf
-- Date: January 25, 2026
-- Purpose: Add all missing foreign key constraints
-- =====================================================

-- EXISTING FOREIGN KEYS (16 total - DO NOT ADD):
-- ✅ broadcast_recipients → broadcast_messages (broadcast_id)
-- ✅ broadcast_recipients → messages (message_id)
-- ✅ conversation_participants → conversations (conversation_id)
-- ✅ medical_certificates → office_staff (reviewed_by)
-- ✅ medical_certificates → students (student_id)
-- ✅ message_attachments → messages (message_id)
-- ✅ message_read_status → messages (message_id)
-- ✅ messages → conversations (conversation_id)
-- ✅ messages → messages (forwarded_from_id)
-- ✅ messages → messages (reply_to_id)
-- ✅ notification_preferences → students (student_id)
-- ✅ notifications → students (student_id)
-- ✅ schedule_entries → classes (class_id)
-- ✅ schedule_entries → teachers (teacher_id)
-- ✅ scheduled_messages → conversations (conversation_id)
-- ✅ voice_messages → messages (message_id)

-- =====================================================
-- MISSING FOREIGN KEYS TO ADD
-- =====================================================

-- 1. ATTENDANCE RECORDS → STUDENTS
-- Purpose: Ensure attendance records reference valid students
ALTER TABLE attendance_records_new
ADD CONSTRAINT attendance_records_student_id_fkey
FOREIGN KEY (student_id) 
REFERENCES students(id)
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- 2. ATTENDANCE RECORDS → CLASSES
-- Purpose: Ensure attendance records reference valid classes
ALTER TABLE attendance_records_new
ADD CONSTRAINT attendance_records_class_id_fkey
FOREIGN KEY (class_id) 
REFERENCES classes(id)
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- 3. ATTENDANCE RECORDS → OFFICE STAFF (marked_by)
-- Purpose: Track who marked the attendance
-- Note: marked_by can be NULL (system-generated)
ALTER TABLE attendance_records_new
ADD CONSTRAINT attendance_records_marked_by_fkey
FOREIGN KEY (marked_by) 
REFERENCES office_staff(id)
ON DELETE SET NULL
ON UPDATE NO ACTION;

-- 4. BROADCAST MESSAGES → STUDENTS (sender_id when sender_type = 'student')
-- Note: This is polymorphic - sender can be student, teacher, or office
-- We'll add a check constraint instead of FK for flexibility
-- (No FK added - polymorphic relationship)

-- 5. BROADCAST MESSAGES → CLASSES
-- Purpose: Link broadcasts to specific classes
ALTER TABLE broadcast_messages
ADD CONSTRAINT broadcast_messages_class_id_fkey
FOREIGN KEY (class_id) 
REFERENCES classes(id)
ON DELETE SET NULL
ON UPDATE NO ACTION;

-- 6. BROADCAST RECIPIENTS → STUDENTS
-- Purpose: Ensure recipients are valid students
ALTER TABLE broadcast_recipients
ADD CONSTRAINT broadcast_recipients_student_id_fkey
FOREIGN KEY (student_id) 
REFERENCES students(id)
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- 7. CLASSES → AUTH.USERS (created_by)
-- Purpose: Track who created the class
-- Note: References Supabase auth.users table
ALTER TABLE classes
ADD CONSTRAINT classes_created_by_fkey
FOREIGN KEY (created_by) 
REFERENCES auth.users(id)
ON DELETE SET NULL
ON UPDATE NO ACTION;

-- 8. CONVERSATIONS → CLASSES (class_id)
-- Purpose: Link group conversations to classes
ALTER TABLE conversations
ADD CONSTRAINT conversations_class_id_fkey
FOREIGN KEY (class_id) 
REFERENCES classes(id)
ON DELETE SET NULL
ON UPDATE NO ACTION;

-- 9. MESSAGE ATTACHMENTS → STUDENTS/TEACHERS/OFFICE (uploaded_by_id)
-- Note: Polymorphic relationship - no FK added
-- (No FK added - polymorphic relationship)

-- 10. MESSAGE READ STATUS → STUDENTS/TEACHERS/OFFICE (user_id)
-- Note: Polymorphic relationship - no FK added
-- (No FK added - polymorphic relationship)

-- 11. MESSAGES → STUDENTS/TEACHERS/OFFICE (sender_id)
-- Note: Polymorphic relationship - no FK added
-- (No FK added - polymorphic relationship)

-- 12. CONVERSATION PARTICIPANTS → STUDENTS/TEACHERS/OFFICE (user_id)
-- Note: Polymorphic relationship - no FK added
-- (No FK added - polymorphic relationship)

-- 13. CONVERSATIONS → STUDENTS/TEACHERS/OFFICE (created_by_id)
-- Note: Polymorphic relationship - no FK added
-- (No FK added - polymorphic relationship)

-- 14. SCHEDULED MESSAGES → CLASSES
-- Purpose: Link scheduled messages to classes
ALTER TABLE scheduled_messages
ADD CONSTRAINT scheduled_messages_class_id_fkey
FOREIGN KEY (class_id) 
REFERENCES classes(id)
ON DELETE SET NULL
ON UPDATE NO ACTION;

-- 15. SCHEDULED MESSAGES → STUDENTS/TEACHERS/OFFICE (sender_id)
-- Note: Polymorphic relationship - no FK added
-- (No FK added - polymorphic relationship)

-- 16. SYSTEM MESSAGES → STUDENTS/TEACHERS/OFFICE (target_user_id)
-- Note: Polymorphic relationship - no FK added
-- (No FK added - polymorphic relationship)

-- 17. OFFICE STAFF → AUTH.USERS (supabase_user_id)
-- Purpose: Link office staff to Supabase auth users
ALTER TABLE office_staff
ADD CONSTRAINT office_staff_supabase_user_id_fkey
FOREIGN KEY (supabase_user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- =====================================================
-- CREATE INDEXES FOR FOREIGN KEY COLUMNS
-- =====================================================
-- Indexes improve query performance on FK columns

-- Attendance Records
CREATE INDEX IF NOT EXISTS idx_attendance_student_id 
ON attendance_records_new(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_class_id 
ON attendance_records_new(class_id);

CREATE INDEX IF NOT EXISTS idx_attendance_marked_by 
ON attendance_records_new(marked_by);

-- Broadcast Messages
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_class_id 
ON broadcast_messages(class_id);

CREATE INDEX IF NOT EXISTS idx_broadcast_messages_sender_id 
ON broadcast_messages(sender_id);

-- Broadcast Recipients
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_student_id 
ON broadcast_recipients(student_id);

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_broadcast_id 
ON broadcast_recipients(broadcast_id);

-- Classes
CREATE INDEX IF NOT EXISTS idx_classes_created_by 
ON classes(created_by);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_class_id 
ON conversations(class_id);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by_id 
ON conversations(created_by_id);

-- Conversation Participants
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id 
ON conversation_participants(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id 
ON conversation_participants(user_id);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id 
ON messages(reply_to_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- Message Attachments
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id 
ON message_attachments(message_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_uploaded_by_id 
ON message_attachments(uploaded_by_id);

-- Message Read Status
CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id 
ON message_read_status(message_id);

CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id 
ON message_read_status(user_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_student_id 
ON notifications(student_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON notifications(created_at DESC);

-- Notification Preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_student_id 
ON notification_preferences(student_id);

-- Schedule Entries
CREATE INDEX IF NOT EXISTS idx_schedule_entries_class_id 
ON schedule_entries(class_id);

CREATE INDEX IF NOT EXISTS idx_schedule_entries_teacher_id 
ON schedule_entries(teacher_id);

-- Scheduled Messages
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_conversation_id 
ON scheduled_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_messages_class_id 
ON scheduled_messages(class_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_messages_sender_id 
ON scheduled_messages(sender_id);

-- System Messages
CREATE INDEX IF NOT EXISTS idx_system_messages_target_user_id 
ON system_messages(target_user_id);

CREATE INDEX IF NOT EXISTS idx_system_messages_created_at 
ON system_messages(created_at DESC);

-- Medical Certificates
CREATE INDEX IF NOT EXISTS idx_medical_certificates_student_id 
ON medical_certificates(student_id);

CREATE INDEX IF NOT EXISTS idx_medical_certificates_reviewed_by 
ON medical_certificates(reviewed_by);

-- Office Staff
CREATE INDEX IF NOT EXISTS idx_office_staff_supabase_user_id 
ON office_staff(supabase_user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify all foreign keys were added

-- Check all foreign keys
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Check for orphaned records in attendance_records_new
SELECT 'attendance → students' as relationship, COUNT(*) as orphaned_records
FROM attendance_records_new a
LEFT JOIN students s ON a.student_id = s.id
WHERE s.id IS NULL

UNION ALL

SELECT 'attendance → classes', COUNT(*)
FROM attendance_records_new a
LEFT JOIN classes c ON a.class_id = c.id
WHERE c.id IS NULL

UNION ALL

SELECT 'broadcast_recipients → students', COUNT(*)
FROM broadcast_recipients br
LEFT JOIN students s ON br.student_id = s.id
WHERE s.id IS NULL;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total Foreign Keys Added: 9
-- 1. attendance_records_new → students (student_id)
-- 2. attendance_records_new → classes (class_id)
-- 3. attendance_records_new → office_staff (marked_by)
-- 4. broadcast_messages → classes (class_id)
-- 5. broadcast_recipients → students (student_id)
-- 6. classes → auth.users (created_by)
-- 7. conversations → classes (class_id)
-- 8. scheduled_messages → classes (class_id)
-- 9. office_staff → auth.users (supabase_user_id)
--
-- Total Indexes Created: 30+
-- 
-- Polymorphic Relationships (No FK): 8
-- - broadcast_messages.sender_id (student/teacher/office)
-- - message_attachments.uploaded_by_id (student/teacher/office)
-- - message_read_status.user_id (student/teacher/office)
-- - messages.sender_id (student/teacher/office)
-- - conversation_participants.user_id (student/teacher/office)
-- - conversations.created_by_id (student/teacher/office)
-- - scheduled_messages.sender_id (student/teacher/office)
-- - system_messages.target_user_id (student/teacher/office)
-- =====================================================

-- END OF SCRIPT

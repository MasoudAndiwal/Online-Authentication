-- Create attendance_records table for tracking student attendance
-- Fixed to work with existing schema (TEXT IDs instead of UUID)

CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_section VARCHAR(20) NOT NULL,
    schedule_entry_id TEXT REFERENCES schedule_entries(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'EXCUSED', 'NOT_MARKED')),
    marked_by TEXT REFERENCES teachers(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one record per student per class per day
    UNIQUE(student_id, class_section, date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_section ON attendance_records(class_section);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_marked_by ON attendance_records(marked_by);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS attendance_updated_at_trigger ON attendance_records;
CREATE TRIGGER attendance_updated_at_trigger
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_updated_at();

COMMENT ON TABLE attendance_records IS 'Stores daily attendance records for students';
COMMENT ON COLUMN attendance_records.status IS 'Attendance status: PRESENT, ABSENT, SICK, LEAVE, EXCUSED, NOT_MARKED';
COMMENT ON COLUMN attendance_records.class_section IS 'References the class section from students.classSection';

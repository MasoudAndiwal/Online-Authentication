-- Create schedule_entries table if it doesn't exist
-- This table stores class schedule information

CREATE TABLE IF NOT EXISTS schedule_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    class_section VARCHAR(20) NOT NULL,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
    subject VARCHAR(100) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (end_time > start_time)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_schedule_class_section ON schedule_entries(class_section);
CREATE INDEX IF NOT EXISTS idx_schedule_teacher_id ON schedule_entries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_day_of_week ON schedule_entries(day_of_week);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_schedule_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS schedule_entries_updated_at_trigger ON schedule_entries;
CREATE TRIGGER schedule_entries_updated_at_trigger
    BEFORE UPDATE ON schedule_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_schedule_entries_updated_at();

COMMENT ON TABLE schedule_entries IS 'Stores class schedule entries';
COMMENT ON COLUMN schedule_entries.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';

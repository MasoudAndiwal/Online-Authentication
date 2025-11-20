-- Create classes table if it doesn't exist
-- This table stores class information referenced by students

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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_classes_section ON classes(section);
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS classes_updated_at_trigger ON classes;
CREATE TRIGGER classes_updated_at_trigger
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_classes_updated_at();

COMMENT ON TABLE classes IS 'Stores class/section information';
COMMENT ON COLUMN classes.section IS 'Unique section identifier that matches students.classSection';

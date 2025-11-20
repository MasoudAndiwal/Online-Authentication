-- Create medical_certificates table for tracking sick leave requests
-- Fixed to work with existing schema (TEXT IDs instead of UUID)

CREATE TABLE IF NOT EXISTS medical_certificates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
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
    reviewed_by TEXT REFERENCES office_staff(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    scan_status VARCHAR(20) DEFAULT 'pending' CHECK (scan_status IN ('pending', 'scanning', 'clean', 'infected')),
    scan_result JSONB,
    quarantined BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure end_date is after or equal to start_date
    CHECK (end_date >= start_date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_medical_cert_student_id ON medical_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_medical_cert_status ON medical_certificates(status);
CREATE INDEX IF NOT EXISTS idx_medical_cert_submission_date ON medical_certificates(submission_date);
CREATE INDEX IF NOT EXISTS idx_medical_cert_date_range ON medical_certificates(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_medical_cert_scan_status ON medical_certificates(scan_status);
CREATE INDEX IF NOT EXISTS idx_medical_cert_quarantined ON medical_certificates(quarantined) WHERE quarantined = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medical_cert_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS medical_cert_updated_at_trigger ON medical_certificates;
CREATE TRIGGER medical_cert_updated_at_trigger
    BEFORE UPDATE ON medical_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_medical_cert_updated_at();

-- Create function to automatically set reviewed_at when status changes
CREATE OR REPLACE FUNCTION set_medical_cert_reviewed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != 'pending' AND OLD.status = 'pending' THEN
        NEW.reviewed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reviewed_at
DROP TRIGGER IF EXISTS medical_cert_reviewed_at_trigger ON medical_certificates;
CREATE TRIGGER medical_cert_reviewed_at_trigger
    BEFORE UPDATE ON medical_certificates
    FOR EACH ROW
    WHEN (NEW.status IS DISTINCT FROM OLD.status)
    EXECUTE FUNCTION set_medical_cert_reviewed_at();

COMMENT ON TABLE medical_certificates IS 'Stores medical certificates and sick leave requests from students';
COMMENT ON COLUMN medical_certificates.status IS 'Review status: pending, approved, rejected';
COMMENT ON COLUMN medical_certificates.total_days IS 'Auto-calculated number of days covered by certificate';
COMMENT ON COLUMN medical_certificates.scan_status IS 'Virus scan status: pending, scanning, clean, infected';
COMMENT ON COLUMN medical_certificates.scan_result IS 'JSON object containing scan results: {clean: boolean, threats: string[], scannedAt: timestamp}';
COMMENT ON COLUMN medical_certificates.quarantined IS 'Flag indicating if file has been quarantined due to security concerns';
COMMENT ON COLUMN medical_certificates.file_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN medical_certificates.file_name IS 'Original sanitized file name';
COMMENT ON COLUMN medical_certificates.file_size IS 'File size in bytes';

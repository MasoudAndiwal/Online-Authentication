-- Add virus scanning columns to medical_certificates table
-- Requirements: 7.1, 7.5 - File upload security and virus scanning

-- Add scan_status column
ALTER TABLE medical_certificates 
ADD COLUMN IF NOT EXISTS scan_status VARCHAR(20) DEFAULT 'pending' 
CHECK (scan_status IN ('pending', 'scanning', 'clean', 'infected'));

-- Add scan_result column for storing scan details
ALTER TABLE medical_certificates 
ADD COLUMN IF NOT EXISTS scan_result JSONB;

-- Add quarantined flag
ALTER TABLE medical_certificates 
ADD COLUMN IF NOT EXISTS quarantined BOOLEAN DEFAULT false;

-- Add file_path column if it doesn't exist (for Supabase Storage path)
ALTER TABLE medical_certificates 
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Add file_name column if it doesn't exist
ALTER TABLE medical_certificates 
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

-- Add file_size column if it doesn't exist
ALTER TABLE medical_certificates 
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Create index for scan_status queries
CREATE INDEX IF NOT EXISTS idx_medical_cert_scan_status ON medical_certificates(scan_status);

-- Create index for quarantined files
CREATE INDEX IF NOT EXISTS idx_medical_cert_quarantined ON medical_certificates(quarantined) WHERE quarantined = true;

-- Add comments
COMMENT ON COLUMN medical_certificates.scan_status IS 'Virus scan status: pending, scanning, clean, infected';
COMMENT ON COLUMN medical_certificates.scan_result IS 'JSON object containing scan results: {clean: boolean, threats: string[], scannedAt: timestamp}';
COMMENT ON COLUMN medical_certificates.quarantined IS 'Flag indicating if file has been quarantined due to security concerns';
COMMENT ON COLUMN medical_certificates.file_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN medical_certificates.file_name IS 'Original sanitized file name';
COMMENT ON COLUMN medical_certificates.file_size IS 'File size in bytes';

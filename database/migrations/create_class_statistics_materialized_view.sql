-- Create materialized view for class statistics
-- This view pre-computes aggregated class metrics for faster dashboard queries
-- Requirements: 1.3, 3.1, 3.3

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS class_statistics CASCADE;

-- Create materialized view with aggregated class metrics
CREATE MATERIALIZED VIEW class_statistics AS
SELECT 
  c.id as class_id,
  c.name as class_name,
  c.section as class_section,
  COUNT(DISTINCT s.id) as total_students,
  
  -- Calculate average attendance rate across all students in the class
  AVG(
    CASE 
      WHEN ar.total_classes > 0 
      THEN (ar.present_count::float / ar.total_classes::float) * 100 
      ELSE 0 
    END
  ) as average_attendance,
  
  -- Calculate median attendance rate
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY (ar.present_count::float / NULLIF(ar.total_classes, 0)::float) * 100
  ) as median_attendance,
  
  -- Find highest attendance rate in the class
  MAX(
    (ar.present_count::float / NULLIF(ar.total_classes, 0)::float) * 100
  ) as highest_attendance,
  
  -- Find lowest attendance rate in the class
  MIN(
    (ar.present_count::float / NULLIF(ar.total_classes, 0)::float) * 100
  ) as lowest_attendance,
  
  -- Count students at risk (below 75% attendance)
  COUNT(
    CASE 
      WHEN (ar.present_count::float / NULLIF(ar.total_classes, 0)::float) * 100 < 75 
      THEN 1 
    END
  ) as students_at_risk,
  
  -- Count students with warning status (below 80% attendance)
  COUNT(
    CASE 
      WHEN (ar.present_count::float / NULLIF(ar.total_classes, 0)::float) * 100 < 80 
      THEN 1 
    END
  ) as students_with_warning,
  
  -- Timestamp of last calculation
  NOW() as last_calculated
FROM classes c
LEFT JOIN students s ON s."classSection" = c.section
LEFT JOIN LATERAL (
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('present', 'absent', 'sick', 'leave', 'excused')) as total_classes,
    COUNT(*) FILTER (WHERE status = 'present') as present_count,
    COUNT(*) FILTER (WHERE status = 'absent') as absent_count,
    COUNT(*) FILTER (WHERE status = 'sick') as sick_count,
    COUNT(*) FILTER (WHERE status = 'leave') as leave_count
  FROM attendance_records ar
  WHERE ar.student_id = s.id
) ar ON true
GROUP BY c.id, c.name, c.section;

-- Create unique index for concurrent refresh capability
CREATE UNIQUE INDEX idx_class_statistics_class_id ON class_statistics(class_id);

-- Create additional indexes for performance optimization
CREATE INDEX idx_class_statistics_avg_attendance ON class_statistics(average_attendance DESC);
CREATE INDEX idx_class_statistics_students_at_risk ON class_statistics(students_at_risk DESC);
CREATE INDEX idx_class_statistics_last_calculated ON class_statistics(last_calculated DESC);

-- Create function to refresh the materialized view
-- This function can be called manually or by a scheduled job
CREATE OR REPLACE FUNCTION refresh_class_statistics()
RETURNS void AS $$
BEGIN
  -- Use CONCURRENTLY to allow queries during refresh
  -- Requires unique index on class_id
  REFRESH MATERIALIZED VIEW CONCURRENTLY class_statistics;
  
  -- Log the refresh operation
  RAISE NOTICE 'Class statistics materialized view refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to get the age of the materialized view
CREATE OR REPLACE FUNCTION get_class_statistics_age()
RETURNS INTERVAL AS $$
DECLARE
  last_refresh TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT MAX(last_calculated) INTO last_refresh FROM class_statistics;
  
  IF last_refresh IS NULL THEN
    RETURN INTERVAL '999 days'; -- Return large interval if never refreshed
  END IF;
  
  RETURN NOW() - last_refresh;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if refresh is needed (older than 10 minutes)
CREATE OR REPLACE FUNCTION is_class_statistics_stale()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_class_statistics_age() > INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON MATERIALIZED VIEW class_statistics IS 'Pre-computed class statistics for fast dashboard queries. Refreshed every 10 minutes.';
COMMENT ON COLUMN class_statistics.class_id IS 'Unique identifier for the class';
COMMENT ON COLUMN class_statistics.total_students IS 'Total number of students enrolled in the class';
COMMENT ON COLUMN class_statistics.average_attendance IS 'Average attendance rate across all students (percentage)';
COMMENT ON COLUMN class_statistics.median_attendance IS 'Median attendance rate across all students (percentage)';
COMMENT ON COLUMN class_statistics.students_at_risk IS 'Number of students with attendance below 75% (mahroom threshold)';
COMMENT ON COLUMN class_statistics.students_with_warning IS 'Number of students with attendance below 80% (warning threshold)';
COMMENT ON COLUMN class_statistics.last_calculated IS 'Timestamp when the view was last refreshed';

COMMENT ON FUNCTION refresh_class_statistics() IS 'Refreshes the class_statistics materialized view. Can be called manually or by cron job.';
COMMENT ON FUNCTION get_class_statistics_age() IS 'Returns the age of the materialized view data';
COMMENT ON FUNCTION is_class_statistics_stale() IS 'Returns true if the view is older than 10 minutes and needs refresh';

-- Initial refresh to populate the view
SELECT refresh_class_statistics();

-- ============================================================================
-- Create get_students_at_risk Function
-- ============================================================================
-- This function returns students who have high absence rates in classes
-- taught by a specific teacher
-- ============================================================================

CREATE OR REPLACE FUNCTION get_students_at_risk(
  p_teacher_id UUID,
  p_threshold NUMERIC DEFAULT 75
)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  class_name TEXT,
  absence_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS student_id,
    (s.first_name || ' ' || s.last_name) AS student_name,
    c.name AS class_name,
    ROUND(
      (COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END)::NUMERIC / 
       NULLIF(COUNT(ar.id), 0)::NUMERIC * 100), 
      2
    ) AS absence_percentage
  FROM students s
  INNER JOIN classes c ON s.class_id = c.id
  INNER JOIN attendance_records ar ON ar.student_id = s.id
  WHERE c.teacher_id = p_teacher_id
    AND ar.date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY s.id, s.first_name, s.last_name, c.name
  HAVING 
    (COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END)::NUMERIC / 
     NULLIF(COUNT(ar.id), 0)::NUMERIC * 100) >= p_threshold
  ORDER BY absence_percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_students_at_risk(UUID, NUMERIC) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_students_at_risk IS 
'Returns students with high absence rates (above threshold) for a specific teacher';

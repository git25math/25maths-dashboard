-- Teacher dashboard admin functions (SECURITY DEFINER — bypass RLS)

-- Batch assign class_name to all students in a grade
CREATE OR REPLACE FUNCTION assign_class(p_grade INT, p_class TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INT;
BEGIN
  UPDATE gl_user_progress
  SET class_name = p_class, updated_at = now()
  WHERE grade = p_grade AND (class_name IS NULL OR class_name != p_class);
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Assign class_name to a single student
CREATE OR REPLACE FUNCTION assign_student_class(p_user_id UUID, p_class TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE gl_user_progress
  SET class_name = p_class, updated_at = now()
  WHERE user_id = p_user_id;
$$;

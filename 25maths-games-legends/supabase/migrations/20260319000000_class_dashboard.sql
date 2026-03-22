-- Add class_name column for grouping students by class (e.g., "7A", "7B")
ALTER TABLE gl_user_progress ADD COLUMN IF NOT EXISTS class_name TEXT;

-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_gl_progress_class ON gl_user_progress (grade, class_name);

-- RPC function: returns all students in a given grade+class (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_class_progress(p_grade INT, p_class TEXT DEFAULT NULL)
RETURNS SETOF gl_user_progress
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM gl_user_progress
  WHERE grade = p_grade
  AND (p_class IS NULL OR class_name = p_class)
  ORDER BY display_name;
$$;

-- Enable realtime on gl_user_progress for dashboard live updates
ALTER PUBLICATION supabase_realtime ADD TABLE gl_user_progress;

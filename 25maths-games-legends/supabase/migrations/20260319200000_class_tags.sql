-- Migrate class_name (single TEXT) → class_tags (TEXT array) for multi-tag support
-- e.g. a student can be in ['7B', 'EA', 'OLYMPIAD']

-- 1. Add class_tags column
ALTER TABLE gl_user_progress ADD COLUMN IF NOT EXISTS class_tags TEXT[] DEFAULT '{}';

-- 2. Migrate existing class_name data into class_tags
UPDATE gl_user_progress
SET class_tags = ARRAY[class_name]
WHERE class_name IS NOT NULL AND class_name != '' AND (class_tags IS NULL OR class_tags = '{}');

-- 3. Index for array containment queries
CREATE INDEX IF NOT EXISTS idx_gl_progress_tags ON gl_user_progress USING GIN (class_tags);

-- 4. Update get_class_progress to filter on class_tags
CREATE OR REPLACE FUNCTION get_class_progress(p_grade INT, p_class TEXT DEFAULT NULL)
RETURNS SETOF gl_user_progress
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM gl_user_progress
  WHERE grade = p_grade
  AND (p_class IS NULL OR class_tags @> ARRAY[p_class])
  ORDER BY display_name;
$$;

-- 5. Batch add a tag to all students in a grade (idempotent — skips if already tagged)
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
  SET class_tags = array_append(class_tags, p_class),
      class_name = COALESCE(class_name, p_class),
      updated_at = now()
  WHERE grade = p_grade AND NOT (class_tags @> ARRAY[p_class]);
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- 6. Add a tag to a single student (idempotent)
CREATE OR REPLACE FUNCTION assign_student_class(p_user_id UUID, p_class TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE gl_user_progress
  SET class_tags = CASE
        WHEN class_tags @> ARRAY[p_class] THEN class_tags
        ELSE array_append(class_tags, p_class)
      END,
      class_name = COALESCE(class_name, p_class),
      updated_at = now()
  WHERE user_id = p_user_id;
$$;

-- 7. Remove a tag from a single student
CREATE OR REPLACE FUNCTION remove_student_tag(p_user_id UUID, p_tag TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE gl_user_progress
  SET class_tags = array_remove(class_tags, p_tag),
      updated_at = now()
  WHERE user_id = p_user_id;
$$;

-- 8. Batch remove a tag from all students in a grade
CREATE OR REPLACE FUNCTION remove_class_tag(p_grade INT, p_tag TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INT;
BEGIN
  UPDATE gl_user_progress
  SET class_tags = array_remove(class_tags, p_tag),
      updated_at = now()
  WHERE grade = p_grade AND class_tags @> ARRAY[p_tag];
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

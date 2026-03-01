-- 25Maths Dashboard: Full Schema Migration
-- Run this in the Supabase SQL Editor

-- ============================================
-- 1. STUDENTS (existing)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id text PRIMARY KEY,
  name text NOT NULL,
  year_group text,
  class_name text,
  is_tutor_group boolean DEFAULT false,
  house_points integer DEFAULT 0,
  notes text DEFAULT '',
  weaknesses jsonb DEFAULT '[]',
  attendance_status text,
  status_records jsonb DEFAULT '[]',
  requests jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. STUDENT STATUS RECORDS (existing)
-- ============================================
CREATE TABLE IF NOT EXISTS student_status_records (
  id text PRIMARY KEY,
  student_id text REFERENCES students(id) ON DELETE CASCADE,
  date text,
  content text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 3. STUDENT REQUESTS (existing)
-- ============================================
CREATE TABLE IF NOT EXISTS student_requests (
  id text PRIMARY KEY,
  student_id text REFERENCES students(id) ON DELETE CASCADE,
  date text,
  content text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 4. TEACHING UNITS (existing)
-- ============================================
CREATE TABLE IF NOT EXISTS teaching_units (
  id text PRIMARY KEY,
  year_group text,
  title text NOT NULL,
  learning_objectives jsonb DEFAULT '[]',
  lessons jsonb DEFAULT '[]',
  typical_examples jsonb DEFAULT '[]',
  worksheet_url text,
  homework_url text,
  online_practice_url text,
  kahoot_url text,
  vocab_practice_url text,
  core_vocabulary jsonb DEFAULT '[]',
  prep_material_template text DEFAULT '',
  ai_prompt_template text DEFAULT '',
  teaching_summary text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 5. CLASSES (existing)
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
  id text PRIMARY KEY,
  name text NOT NULL,
  year_group text,
  description text DEFAULT '',
  current_unit_id text,
  completed_lesson_ids jsonb DEFAULT '[]',
  student_ids jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 6. IDEAS (new)
-- ============================================
CREATE TABLE IF NOT EXISTS ideas (
  id text PRIMARY KEY,
  title text NOT NULL,
  content text DEFAULT '',
  category text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 7. SOPS (new)
-- ============================================
CREATE TABLE IF NOT EXISTS sops (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text DEFAULT '',
  content text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 8. WORK LOGS (new)
-- ============================================
CREATE TABLE IF NOT EXISTS work_logs (
  id text PRIMARY KEY,
  timestamp text,
  content text DEFAULT '',
  category text DEFAULT 'other',
  tags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 9. GOALS (new)
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text DEFAULT 'work',
  progress integer DEFAULT 0,
  status text DEFAULT 'in-progress',
  deadline text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 10. SCHOOL EVENTS (new)
-- ============================================
CREATE TABLE IF NOT EXISTS school_events (
  id text PRIMARY KEY,
  title text NOT NULL,
  date text,
  category text DEFAULT 'school-wide',
  description text DEFAULT '',
  is_action_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 11. TIMETABLE ENTRIES (new)
-- ============================================
CREATE TABLE IF NOT EXISTS timetable_entries (
  id text PRIMARY KEY,
  day integer,
  start_time text,
  end_time text,
  subject text,
  class_name text,
  class_id text,
  room text,
  type text DEFAULT 'lesson',
  topic text,
  notes text,
  is_prepared boolean DEFAULT false,
  unit_id text,
  lesson_id text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 12. LESSON RECORDS (new)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_records (
  id text PRIMARY KEY,
  date text,
  class_name text,
  topic text,
  progress text DEFAULT '',
  homework_assigned text DEFAULT '',
  notes text DEFAULT '',
  next_lesson_plan text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_status_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: Allow anon full access (single-user app)
-- ============================================
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'students', 'student_status_records', 'student_requests',
      'teaching_units', 'classes',
      'ideas', 'sops', 'work_logs', 'goals',
      'school_events', 'timetable_entries', 'lesson_records'
    ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon select on %I" ON %I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow anon select on %I" ON %I FOR SELECT TO anon USING (true)', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon insert on %I" ON %I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow anon insert on %I" ON %I FOR INSERT TO anon WITH CHECK (true)', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon update on %I" ON %I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow anon update on %I" ON %I FOR UPDATE TO anon USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon delete on %I" ON %I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow anon delete on %I" ON %I FOR DELETE TO anon USING (true)', tbl, tbl);
  END LOOP;
END $$;

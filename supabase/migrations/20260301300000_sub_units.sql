ALTER TABLE teaching_units ADD COLUMN IF NOT EXISTS sub_units jsonb DEFAULT '[]'::jsonb;

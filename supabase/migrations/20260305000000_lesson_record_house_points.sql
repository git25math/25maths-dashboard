ALTER TABLE lesson_records ADD COLUMN IF NOT EXISTS house_point_awards jsonb DEFAULT '[]'::jsonb;

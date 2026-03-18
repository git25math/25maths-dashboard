-- Add shared_resources column to teaching_units (used for prep resource links)
ALTER TABLE teaching_units ADD COLUMN IF NOT EXISTS shared_resources jsonb DEFAULT '[]'::jsonb;

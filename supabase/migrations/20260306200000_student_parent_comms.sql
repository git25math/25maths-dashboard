-- Add parent_communications JSONB column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_communications jsonb DEFAULT '[]'::jsonb;

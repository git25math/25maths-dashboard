-- Phase 24: Add linkage fields between timetable entries and lesson records
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS recurring_id text;
ALTER TABLE lesson_records ADD COLUMN IF NOT EXISTS timetable_entry_id text;

-- Phase 18 introduced date-specific timetable entries but the column was never added
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS date text;

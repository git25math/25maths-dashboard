-- Add prep_status column (4-state: not_prepared, prepared, finished, recorded)
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS prep_status text;

-- Migrate existing is_prepared boolean values
UPDATE timetable_entries
SET prep_status = CASE WHEN is_prepared THEN 'prepared' ELSE 'not_prepared' END
WHERE prep_status IS NULL;

-- Add meeting_record_id for linking meeting-type entries to meeting_records
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS meeting_record_id text;

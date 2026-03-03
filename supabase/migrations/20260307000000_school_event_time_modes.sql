ALTER TABLE school_events ADD COLUMN IF NOT EXISTS end_date text;
ALTER TABLE school_events ADD COLUMN IF NOT EXISTS start_time text;
ALTER TABLE school_events ADD COLUMN IF NOT EXISTS end_time text;
ALTER TABLE school_events ADD COLUMN IF NOT EXISTS time_mode text DEFAULT 'all-day';

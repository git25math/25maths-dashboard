-- HP Award Logs (append-only audit log for house point awards)
CREATE TABLE IF NOT EXISTS hp_award_logs (
  id text PRIMARY KEY,
  date text NOT NULL,
  student_id text NOT NULL,
  student_name text NOT NULL,
  class_name text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  reason text DEFAULT '',
  source text NOT NULL DEFAULT 'batch',
  source_id text
);

-- Enable RLS
ALTER TABLE hp_award_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as existing tables)
CREATE POLICY "Allow all for authenticated" ON hp_award_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON hp_award_logs
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

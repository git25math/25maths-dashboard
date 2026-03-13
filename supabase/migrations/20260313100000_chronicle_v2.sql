-- DevLog status + thread support
ALTER TABLE devlogs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';
ALTER TABLE devlogs ADD COLUMN IF NOT EXISTS thread_id text;

-- Threads table
CREATE TABLE IF NOT EXISTS devlog_threads (
  id text PRIMARY KEY,
  project_id text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE devlog_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devlog_threads_all" ON devlog_threads FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_devlog_threads_project ON devlog_threads(project_id);
CREATE INDEX idx_devlogs_thread ON devlogs(thread_id);
CREATE INDEX idx_devlogs_status ON devlogs(status);

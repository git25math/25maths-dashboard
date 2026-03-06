-- Projects table for managing entrepreneurial products
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#6366f1',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  url text,
  repo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to projects"
  ON projects FOR ALL
  USING (true)
  WITH CHECK (true);

-- GTD Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text DEFAULT 'inbox',
  priority text DEFAULT 'medium',
  source_type text,
  source_id text,
  assignee text,
  due_date text,
  tags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as existing tables — allow all for authenticated users)
CREATE POLICY "Allow all for authenticated" ON tasks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow anon access for development (matching existing table patterns)
CREATE POLICY "Allow all for anon" ON tasks
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Chronicle module: milestones + devlogs + task milestone_id

-- 里程碑表
CREATE TABLE IF NOT EXISTS milestones (
  id text PRIMARY KEY,
  project_id text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'not_started',
  "order" integer NOT NULL DEFAULT 0,
  due_date text,
  completed_at timestamptz,
  review jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_all" ON milestones FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_milestones_project ON milestones(project_id);

-- 开发日志表
CREATE TABLE IF NOT EXISTS devlogs (
  id text PRIMARY KEY,
  project_id text NOT NULL,
  milestone_id text,
  task_id text,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  tags jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
ALTER TABLE devlogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devlogs_all" ON devlogs FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_devlogs_project ON devlogs(project_id);
CREATE INDEX idx_devlogs_milestone ON devlogs(milestone_id);

-- Task 增加 milestone_id
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id text;

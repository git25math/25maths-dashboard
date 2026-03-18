CREATE TABLE IF NOT EXISTS video_scripts (
  id text PRIMARY KEY,
  board text NOT NULL DEFAULT 'cie',
  section text NOT NULL,
  chapter text NOT NULL DEFAULT '',
  topic text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  title_zh text NOT NULL DEFAULT '',
  tier text NOT NULL DEFAULT 'both',
  lang jsonb NOT NULL DEFAULT '["en","zh"]',
  target_duration integer NOT NULL DEFAULT 300,
  acts jsonb NOT NULL DEFAULT '[]',
  script_yaml text,
  pipeline jsonb NOT NULL DEFAULT '{"stub_created":false,"script_written":false,"script_validated":false,"ai_enhanced":false,"rendered":false,"cover_generated":false,"meta_generated":false,"uploaded":false}',
  output_path text,
  video_duration real,
  bilibili_url text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  rendered_at timestamptz,
  uploaded_at timestamptz
);
ALTER TABLE video_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_scripts_all" ON video_scripts FOR ALL USING (true) WITH CHECK (true);

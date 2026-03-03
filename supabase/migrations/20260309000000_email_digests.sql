-- Email Digests (AI-processed school email summaries)
CREATE TABLE IF NOT EXISTS email_digests (
  id text PRIMARY KEY,
  subject text NOT NULL DEFAULT '',
  original_content text NOT NULL DEFAULT '',
  chinese_translation text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at text NOT NULL DEFAULT ''
);

-- Enable RLS
ALTER TABLE email_digests ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as existing tables)
CREATE POLICY "Allow all for authenticated" ON email_digests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON email_digests
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

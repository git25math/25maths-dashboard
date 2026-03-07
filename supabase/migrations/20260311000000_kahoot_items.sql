-- Kahoot items table for managing quiz resources
CREATE TABLE IF NOT EXISTS kahoot_items (
  id text PRIMARY KEY,
  board text NOT NULL DEFAULT 'cie0580',
  track text NOT NULL DEFAULT 'core',
  topic_code text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  cover_url text,
  page_url text,
  challenge_url text,
  creator_url text,
  website_link_id text,
  listing_path text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  upload_status text NOT NULL DEFAULT 'ai_generated' CHECK (upload_status IN ('ai_generated', 'human_review', 'uploaded')),
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_notes text DEFAULT '',
  org_type text DEFAULT 'standalone',
  org_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  ai_generated_at timestamptz,
  human_reviewed_at timestamptz,
  uploaded_at timestamptz
);

ALTER TABLE kahoot_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to kahoot_items"
  ON kahoot_items FOR ALL
  USING (true)
  WITH CHECK (true);

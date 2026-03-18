CREATE TABLE IF NOT EXISTS bookmarks (
  id text PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'external',
  internal_tab text,
  category text,
  icon text,
  pinned boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_all" ON bookmarks FOR ALL USING (true) WITH CHECK (true);

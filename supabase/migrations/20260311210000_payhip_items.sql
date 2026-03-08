CREATE TABLE IF NOT EXISTS payhip_items (
  id text PRIMARY KEY,
  sku text NOT NULL UNIQUE,
  level text NOT NULL CHECK (level IN ('L1', 'L2', 'L3', 'L4')),
  board text NOT NULL CHECK (board IN ('cie0580', 'edexcel-4ma1')),
  board_label text NOT NULL,
  tier_scope text NOT NULL,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'presale', 'live', 'archived', 'free_sample_live')),
  listing_title text NOT NULL,
  slug_candidate text,
  price_early_bird text,
  price_regular text,
  early_bird_end_date date,
  release_date date,
  payhip_url text,
  source_param text,
  unit_key text,
  unit_code text,
  unit_title text,
  section_key text,
  section_code text,
  section_title text,
  subtopic_id text,
  subtopic_code text,
  subtopic_title text,
  subtopic_count integer,
  section_count integer,
  unit_count integer,
  kahoot_url text,
  worksheet_url text,
  section_bundle_url text,
  unit_bundle_url text,
  deliver_now text,
  deliver_on_release text,
  bonus text,
  presale_notes text,
  terms_pdf_url text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  pipeline jsonb NOT NULL DEFAULT '{"matrix_ready":false,"copy_ready":false,"payhip_created":false,"url_backfilled":false,"qa_verified":false,"site_synced":false}'::jsonb,
  sync_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payhip_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to payhip_items"
  ON payhip_items FOR ALL
  USING (true)
  WITH CHECK (true);

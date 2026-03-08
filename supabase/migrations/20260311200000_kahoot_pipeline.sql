-- Add pipeline JSONB column for independent stage tracking
ALTER TABLE kahoot_items
  ADD COLUMN IF NOT EXISTS pipeline jsonb NOT NULL DEFAULT '{"ai_generated":false,"reviewed":false,"excel_exported":false,"kahoot_uploaded":false,"web_verified":false,"published":false}'::jsonb;

-- Backfill pipeline from existing upload_status
UPDATE kahoot_items SET pipeline = jsonb_build_object(
  'ai_generated', true,
  'reviewed', upload_status IN ('human_review', 'excel_exported', 'kahoot_uploaded', 'web_verified', 'published'),
  'excel_exported', upload_status IN ('excel_exported', 'kahoot_uploaded', 'web_verified', 'published'),
  'kahoot_uploaded', upload_status IN ('kahoot_uploaded', 'web_verified', 'published'),
  'web_verified', upload_status IN ('web_verified', 'published'),
  'published', upload_status = 'published'
);

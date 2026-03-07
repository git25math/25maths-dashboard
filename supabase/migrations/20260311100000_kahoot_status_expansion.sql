-- Expand upload_status to support full pipeline stages

-- 1. Drop old constraint first
ALTER TABLE kahoot_items DROP CONSTRAINT IF EXISTS kahoot_items_upload_status_check;

-- 2. Migrate old 'uploaded' status to 'published'
UPDATE kahoot_items SET upload_status = 'published' WHERE upload_status = 'uploaded';

-- 3. Add new constraint with all valid statuses
ALTER TABLE kahoot_items ADD CONSTRAINT kahoot_items_upload_status_check
  CHECK (upload_status IN ('ai_generated', 'human_review', 'excel_exported', 'kahoot_uploaded', 'web_verified', 'published'));

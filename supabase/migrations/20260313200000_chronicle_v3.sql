-- DevLog starred field
ALTER TABLE devlogs ADD COLUMN IF NOT EXISTS starred boolean NOT NULL DEFAULT false;

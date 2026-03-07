#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');
const ENV_PATH = path.join(ROOT, '.env.local');
const SEED_PATH = path.join(ROOT, 'scripts/output/kahoot-seed.json');
const TABLE = 'kahoot_items';
const CHUNK_SIZE = 50;

const dryRun = process.argv.includes('--dry-run');

dotenv.config({ path: ENV_PATH });

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(`Missing Supabase config in ${ENV_PATH}`);
  process.exit(1);
}

if (!fs.existsSync(SEED_PATH)) {
  console.error(`Seed file not found: ${SEED_PATH}`);
  process.exit(1);
}

const seedItems = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
const seedIds = new Set(seedItems.map(item => item.id));
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const chunk = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const { data: remoteItems, error: fetchError } = await supabase
  .from(TABLE)
  .select('*')
  .order('updated_at', { ascending: false });

if (fetchError) {
  console.error(fetchError.message);
  process.exit(1);
}

const remoteRows = remoteItems || [];
const extraRemoteIds = remoteRows.map(item => item.id).filter(id => !seedIds.has(id));
const matchedRemoteIds = remoteRows.map(item => item.id).filter(id => seedIds.has(id));
const missingRemoteIds = seedItems.map(item => item.id).filter(id => !remoteRows.some(row => row.id === id));

const summary = {
  dry_run: dryRun,
  remote_total_before: remoteRows.length,
  seed_total: seedItems.length,
  will_upsert: seedItems.length,
  remote_matching_seed: matchedRemoteIds.length,
  remote_missing_from_seed: extraRemoteIds.length,
  seed_missing_from_remote: missingRemoteIds.length,
  delete_ids: extraRemoteIds,
};

console.log(JSON.stringify(summary, null, 2));

if (dryRun) process.exit(0);

for (const rows of chunk(seedItems, CHUNK_SIZE)) {
  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: false });

  if (error) {
    console.error(`Upsert failed: ${error.message}`);
    process.exit(1);
  }
}

if (extraRemoteIds.length > 0) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .in('id', extraRemoteIds);

  if (error) {
    console.error(`Delete failed: ${error.message}`);
    process.exit(1);
  }
}

const { count: finalCount, error: verifyError } = await supabase
  .from(TABLE)
  .select('*', { count: 'exact', head: true });

if (verifyError) {
  console.error(`Verification failed: ${verifyError.message}`);
  process.exit(1);
}

console.log(JSON.stringify({ remote_total_after: finalCount }, null, 2));

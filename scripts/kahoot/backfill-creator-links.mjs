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

const seedItems = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const normalizeLookupValue = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const url = new URL(raw);
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return raw.toLowerCase().replace(/\s+/g, ' ').trim();
  }
};

const normalizeTitle = (value) => {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

const isCanonicalCreatorUrl = (value) => {
  return normalizeLookupValue(value).startsWith('https://create.kahoot.it/creator/');
};

const buildSeedLookup = (items) => {
  const byId = new Map();
  const byWebsiteLinkId = new Map();
  const byChallengeUrl = new Map();
  const byCompositeKey = new Map();
  const byTitle = new Map();

  for (const item of items) {
    if (item?.id) byId.set(item.id, item);

    const websiteLinkId = normalizeLookupValue(item?.website_link_id);
    if (websiteLinkId) byWebsiteLinkId.set(websiteLinkId, item);

    const challengeUrl = normalizeLookupValue(item?.challenge_url);
    if (challengeUrl) byChallengeUrl.set(challengeUrl, item);

    const compositeKey = `${item?.board || ''}|${item?.track || ''}|${normalizeLookupValue(item?.topic_code)}`;
    if (compositeKey !== '||') byCompositeKey.set(compositeKey, item);

    const title = normalizeTitle(item?.title);
    if (title) byTitle.set(title, item);
  }

  return { byId, byWebsiteLinkId, byChallengeUrl, byCompositeKey, byTitle };
};

const seedLookup = buildSeedLookup(seedItems);

const matchSeedItem = (item) => {
  return (
    seedLookup.byId.get(item.id) ||
    seedLookup.byWebsiteLinkId.get(normalizeLookupValue(item.website_link_id)) ||
    seedLookup.byChallengeUrl.get(normalizeLookupValue(item.challenge_url)) ||
    seedLookup.byCompositeKey.get(`${item.board || ''}|${item.track || ''}|${normalizeLookupValue(item.topic_code)}`) ||
    seedLookup.byTitle.get(normalizeTitle(item.title))
  );
};

const { data: remoteItems, error: fetchError } = await supabase
  .from(TABLE)
  .select('*')
  .order('updated_at', { ascending: false });

if (fetchError) {
  console.error(fetchError.message);
  process.exit(1);
}

const rows = remoteItems || [];
const missingBefore = rows.filter(item => !item.creator_url).length;
const nonCanonicalBefore = rows.filter(item => item.creator_url && !isCanonicalCreatorUrl(item.creator_url)).length;
const updates = [];
const unresolved = [];

for (const item of rows) {
  const seed = matchSeedItem(item);
  if (!seed?.creator_url) {
    if (!item.creator_url) {
      unresolved.push({
        id: item.id,
        title: item.title || '',
        challenge_url: item.challenge_url || '',
        website_link_id: item.website_link_id || '',
      });
    }
    continue;
  }

  const currentCreatorUrl = normalizeLookupValue(item.creator_url);
  const seedCreatorUrl = normalizeLookupValue(seed.creator_url);

  if (currentCreatorUrl === seedCreatorUrl && isCanonicalCreatorUrl(item.creator_url)) continue;

  updates.push({
    id: item.id,
    creator_url: seed.creator_url,
    title: item.title || '',
    challenge_url: item.challenge_url || '',
  });
}

if (!dryRun) {
  for (const update of updates) {
    const { error } = await supabase
      .from(TABLE)
      .update({ creator_url: update.creator_url })
      .eq('id', update.id);

    if (error) {
      console.error(`Failed to update ${update.id}: ${error.message}`);
      process.exit(1);
    }
  }
}

const summary = {
  dry_run: dryRun,
  remote_total: rows.length,
  seed_total: seedItems.length,
  missing_creator_before: missingBefore,
  non_canonical_creator_before: nonCanonicalBefore,
  backfilled: updates.length,
  unresolved: unresolved.length,
};

console.log(JSON.stringify(summary, null, 2));

if (updates.length > 0) {
  console.log('\nUpdated rows:');
  for (const update of updates.slice(0, 20)) {
    console.log(`- ${update.id} -> ${update.creator_url}`);
  }
  if (updates.length > 20) {
    console.log(`- ... ${updates.length - 20} more`);
  }
}

if (unresolved.length > 0) {
  const unresolvedPath = path.join(ROOT, 'scripts/output/kahoot-creator-backfill-unresolved.json');
  fs.writeFileSync(unresolvedPath, JSON.stringify(unresolved, null, 2));
  console.log(`\nUnresolved rows written to ${unresolvedPath}`);
}

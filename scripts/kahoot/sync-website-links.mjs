#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import {
  maybeResolvePath,
  normalizeBoardKey,
  normalizeTopicCode,
  normalizeTrackKey,
  parseArgs,
  parseCsv,
  resolveWebsiteRoot,
  runCommand,
  sanitizeInlineText,
  serializeCsv,
  writeJson,
} from './pipeline-lib.mjs';

const WORKING_CSV_PATH = 'payhip/presale/kahoot-subtopic-links-working.csv';
const LINKS_JSON_PATH = '_data/kahoot_subtopic_links.json';
const LISTING_ROOT = 'payhip/presale/listing-assets/l1';

function tierToTrack(tier) {
  return normalizeTrackKey(String(tier || '').trim().toLowerCase());
}

function normalizeTitle(value) {
  return sanitizeInlineText(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function walkFiles(root, matcher, acc = []) {
  if (!existsSync(root)) {
    return acc;
  }

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = resolve(root, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, matcher, acc);
      continue;
    }
    if (matcher(fullPath)) {
      acc.push(fullPath);
    }
  }

  return acc;
}

function parseListingMeta(path) {
  const text = readFileSync(path, 'utf-8');
  const board = path.toLowerCase().includes('edexcel-4ma1') ? 'edexcel-4ma1' : 'cie0580';
  const titleMatch = text.match(/##\s*Title[:：]?\s*\n+([^\n]+)/i);
  const title = titleMatch ? sanitizeInlineText(titleMatch[1]) : basename(path);
  const codeMatch = (title.match(/\b([CEFH]\d+\.\d+)\b/i) || basename(path).match(/([CEFH]\d+\.\d+)/i));
  const trackMatch = text.match(/\b(Core|Extended|Foundation|Higher)\s*Track\b/i) || title.match(/\b(Core|Extended|Foundation|Higher)\s*Track\b/i);

  return {
    path,
    board,
    title,
    topic_code: codeMatch ? normalizeTopicCode(codeMatch[1]) : '',
    track: normalizeTrackKey(trackMatch ? trackMatch[1] : ''),
  };
}

export function resolveWebsiteRecord(records, item) {
  const explicitId = sanitizeInlineText(item.website_link_id || item.id || '');
  if (explicitId) {
    const exactIndex = records.findIndex(row => sanitizeInlineText(row.id) === explicitId);
    if (exactIndex >= 0) {
      return { index: exactIndex, row: records[exactIndex], resolution: 'website_link_id' };
    }
  }

  const board = normalizeBoardKey(item.board);
  const track = normalizeTrackKey(item.track);
  const topicCode = normalizeTopicCode(item.topic_code);
  const title = normalizeTitle(item.title);

  const candidates = records
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => normalizeBoardKey(row.board) === board)
    .filter(({ row }) => tierToTrack(row.tier) === track)
    .filter(({ row }) => normalizeTopicCode(row.subtopic_code) === topicCode);

  if (candidates.length === 1) {
    return { ...candidates[0], resolution: 'board-track-topic_code' };
  }

  if (candidates.length > 1 && title) {
    const titleMatches = candidates.filter(({ row }) => normalizeTitle(row.title) === title || normalizeTitle(row.title).includes(title) || title.includes(normalizeTitle(row.title)));
    if (titleMatches.length === 1) {
      return { ...titleMatches[0], resolution: 'board-track-topic_code-title' };
    }
  }

  return {
    index: -1,
    row: null,
    resolution: candidates.length > 0 ? `ambiguous:${candidates.length}` : 'not_found',
  };
}

export function resolveListingPath(websiteRoot, item, row) {
  const candidate = maybeResolvePath(websiteRoot, item.listing_path);
  if (candidate && existsSync(candidate)) {
    return { path: candidate, resolution: 'item.listing_path' };
  }

  const listingRoot = resolve(websiteRoot, LISTING_ROOT);
  const listingFiles = walkFiles(listingRoot, path => /-Listing\.md$/i.test(path));
  const board = normalizeBoardKey(item.board || row?.board);
  const track = normalizeTrackKey(item.track || tierToTrack(row?.tier));
  const topicCode = normalizeTopicCode(item.topic_code || row?.subtopic_code);

  const candidates = listingFiles
    .map(parseListingMeta)
    .filter(meta => meta.board === board)
    .filter(meta => meta.track === track)
    .filter(meta => meta.topic_code === topicCode);

  if (candidates.length === 1) {
    return { path: candidates[0].path, resolution: 'listing-scan' };
  }

  return { path: '', resolution: candidates.length > 1 ? `listing-ambiguous:${candidates.length}` : 'listing-not-found' };
}

function updateListingContent(text, challengeUrl) {
  const sectionRegex = /(#[ \t]*Kahoot:?\s*[\s\S]*?##\s*Link[:：]?\s*\n+)(\S+)/i;
  if (sectionRegex.test(text)) {
    return text.replace(sectionRegex, `$1${challengeUrl}`);
  }

  const genericUrlRegex = /https?:\/\/(?:kahoot\.it\/challenge\/\S+|create\.kahoot\.it\/channels\/\S+|create\.kahoot\.it\/details\/\S+|create\.kahoot\.it\/creator\/\S+)/i;
  if (genericUrlRegex.test(text)) {
    return text.replace(genericUrlRegex, challengeUrl);
  }

  throw new Error('Could not locate a Kahoot link block in the listing file');
}

export async function syncWebsiteLinks({
  item,
  websiteRoot,
  challengeUrl,
  creatorUrl = '',
  dryRun = false,
  updateListing = true,
}) {
  if (!sanitizeInlineText(challengeUrl)) {
    return {
      synced: false,
      skipped: true,
      reason: 'challenge_url_missing',
      updated_listing: false,
      updated_csv: false,
      updated_json: false,
      website_link_id: sanitizeInlineText(item.website_link_id || ''),
      creator_url: creatorUrl,
      challenge_url: '',
    };
  }

  const resolvedWebsiteRoot = resolveWebsiteRoot(websiteRoot);
  const csvPath = resolve(resolvedWebsiteRoot, WORKING_CSV_PATH);
  const jsonPath = resolve(resolvedWebsiteRoot, LINKS_JSON_PATH);

  const { headers, records } = parseCsv(readFileSync(csvPath, 'utf-8'));
  const resolvedRecord = resolveWebsiteRecord(records, item);
  if (!resolvedRecord.row || resolvedRecord.index < 0) {
    throw new Error(`Website record could not be resolved (${resolvedRecord.resolution}) for ${item.title || item.topic_code}`);
  }

  const nextRow = { ...resolvedRecord.row, kahoot_url: challengeUrl };
  const nextRecords = [...records];
  nextRecords[resolvedRecord.index] = nextRow;

  const listing = resolveListingPath(resolvedWebsiteRoot, item, resolvedRecord.row);
  let listingUpdated = false;
  if (updateListing && listing.path) {
    const original = readFileSync(listing.path, 'utf-8');
    const updated = updateListingContent(original, challengeUrl);
    if (!dryRun && updated !== original) {
      writeFileSync(listing.path, updated);
    }
    listingUpdated = updated !== original;
  }

  const csvChanged = sanitizeInlineText(resolvedRecord.row.kahoot_url) !== sanitizeInlineText(challengeUrl);
  if (!dryRun && csvChanged) {
    writeFileSync(csvPath, `${serializeCsv(headers, nextRecords)}\n`);
  }

  let jsonUpdated = false;
  if (!dryRun) {
    await runCommand('python3', [
      resolve(resolvedWebsiteRoot, 'scripts/kahoot/import_subtopic_links_csv.py'),
      '--csv',
      csvPath,
      '--mode',
      'overwrite',
    ], { cwd: resolvedWebsiteRoot });
    jsonUpdated = true;
  }

  return {
    synced: !dryRun && (csvChanged || listingUpdated || jsonUpdated),
    skipped: false,
    reason: '',
    updated_listing: listingUpdated,
    updated_csv: csvChanged,
    updated_json: jsonUpdated,
    website_link_id: nextRow.id,
    resolution: resolvedRecord.resolution,
    listing_resolution: listing.resolution,
    listing_path: listing.path,
    csv_path: csvPath,
    json_path: jsonPath,
    creator_url: creatorUrl,
    challenge_url: challengeUrl,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.payload || !args.result) {
    throw new Error('Usage: node sync-website-links.mjs --payload <file> --result <file> [--website-root <dir>] [--dry-run]');
  }

  const payload = JSON.parse(readFileSync(args.payload, 'utf-8'));
  const result = await syncWebsiteLinks({
    item: payload.item,
    websiteRoot: args['website-root'],
    challengeUrl: payload.challenge_url || payload.item?.challenge_url || '',
    creatorUrl: payload.creator_url || payload.item?.creator_url || '',
    dryRun: Boolean(args['dry-run']),
    updateListing: args['update-listing'] !== 'false',
  });

  writeJson(args.result, result);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exit(1);
  });
}

#!/usr/bin/env node
/**
 * Extract Kahoot items from Listing.md files and the working CSV,
 * then output a JSON seed file for the kahoot_items table.
 *
 * Usage: node scripts/extract-kahoot-from-listings.mjs
 */

import fs from 'fs';
import path from 'path';

const LISTING_ROOT = '/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/listing-assets/l1';
const WORKING_CSV = '/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/kahoot-subtopic-links-working.csv';
const OUTPUT_JSON = path.join(import.meta.dirname, 'output/kahoot-seed.json');
const OUTPUT_CONST = path.join(import.meta.dirname, '../src/constants-kahoot.ts');

// ── helpers ──

function findListingFiles(root) {
  const results = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('-Listing.md')) results.push(full);
    }
  }
  walk(root);
  return results;
}

function parseListingMd(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(
    '/Users/zhuxingzhe/Project/ExamBoard/25maths-website',
    filePath,
  );

  // Extract Kahoot section
  const kahootSection = raw.split(/^---$/m)[0] || raw;

  // Title – line after "## Title:" or "## Title" (colon optional)
  const titleMatch = kahootSection.match(/(?:#{1,3}\s*)?Title:?\s*\n+(.+)/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Link – line after "## Link:" or "## Link" (colon optional)
  const linkMatch = kahootSection.match(/(?:#{1,3}\s*)?Link:?\s*\n+(https?:\/\/\S+)/i);
  const challengeUrl = linkMatch ? linkMatch[1].trim() : '';

  // Description & Tags
  const descMatch = kahootSection.match(/Description\s*&\s*Tags[：:]*\s*\n+([\s\S]*?)(?=\n---|\n#{1,3}\s|$)/i);
  let description = '';
  let tags = [];
  if (descMatch) {
    const block = descMatch[1].trim();
    // Split description text from hashtags
    const lines = block.split('\n');
    const descLines = [];
    const tagLine = [];
    for (const line of lines) {
      if (line.trim().startsWith('#')) {
        // Parse hashtags
        const matches = line.match(/#\w+/g);
        if (matches) tagLine.push(...matches.map(t => t.slice(1).toLowerCase()));
      } else {
        descLines.push(line);
      }
    }
    description = descLines.join(' ').trim();
    tags = tagLine;
  }

  // Derive board, track, topic_code from filename pattern like C1.1, E3.6, F1.7, H1.11
  const fname = path.basename(filePath, '-Listing.md'); // e.g. "C1.1"
  const codeMatch = fname.match(/^([CEFH])(\d+\.\d+)$/);
  let board = 'cie0580';
  let track = 'core';
  let topicCode = fname;

  if (codeMatch) {
    const prefix = codeMatch[1];
    topicCode = fname; // C1.1, E3.6, F1.7, H1.11
    switch (prefix) {
      case 'C': board = 'cie0580'; track = 'core'; break;
      case 'E': board = 'cie0580'; track = 'extended'; break;
      case 'F': board = 'edexcel-4ma1'; track = 'foundation'; break;
      case 'H': board = 'edexcel-4ma1'; track = 'higher'; break;
    }
  }

  return {
    board,
    track,
    topicCode,
    title,
    description,
    challengeUrl,
    tags,
    listingPath: relativePath,
    filePath,
  };
}

function parseWorkingCsv(csvPath) {
  if (!fs.existsSync(csvPath)) return new Map();
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());
  if (lines.length < 2) return new Map();

  const headers = lines[0].split(',');
  const map = new Map();

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parse (fields may have quoted commas)
    const row = parseCSVRow(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => { obj[h.trim()] = (row[idx] || '').trim(); });

    // Build a lookup key from section_code + subtopic_code
    // e.g. "C2" + "C2-01" → match topic_code "C2.1"
    const subtopic = obj.subtopic_code || ''; // e.g. "C2-01"
    const codeMatch = subtopic.match(/^([CEFH])(\d+)-(\d+)$/);
    if (codeMatch) {
      const prefix = codeMatch[1];
      const chapter = codeMatch[2];
      const section = String(parseInt(codeMatch[3], 10)); // strip leading zero
      const topicCode = `${prefix}${chapter}.${section}`;
      map.set(topicCode, obj);
    }
  }
  return map;
}

function parseCSVRow(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { fields.push(current); current = ''; continue; }
    current += ch;
  }
  fields.push(current);
  return fields;
}

function topicCodeToId(board, track, topicCode) {
  // e.g. kahoot-cie0580-c1-01
  const prefix = topicCode[0].toLowerCase();
  const nums = topicCode.slice(1); // "1.1"
  const [chapter, section] = nums.split('.');
  const paddedSection = section.padStart(2, '0');
  return `kahoot-${board === 'cie0580' ? 'cie0580' : 'edx4ma1'}-${prefix}${chapter}-${paddedSection}`;
}

function buildWebsiteLinkId(csvRow) {
  return csvRow?.id || undefined;
}

function buildPageUrl(board, track, topicCode) {
  // Best-effort page URL construction
  const prefix = topicCode[0].toLowerCase();
  const nums = topicCode.slice(1);
  const [chapter, section] = nums.split('.');
  const paddedSection = section.padStart(2, '0');

  if (board === 'cie0580') {
    return undefined; // We don't have enough info to construct these reliably
  }
  return undefined;
}

// ── main ──

const listingFiles = findListingFiles(LISTING_ROOT);
console.log(`Found ${listingFiles.length} Listing.md files`);

const csvLookup = parseWorkingCsv(WORKING_CSV);
console.log(`Loaded ${csvLookup.size} entries from working CSV`);

const now = new Date().toISOString();
const items = [];

for (const file of listingFiles) {
  const parsed = parseListingMd(file);
  const csvRow = csvLookup.get(parsed.topicCode);

  const item = {
    id: topicCodeToId(parsed.board, parsed.track, parsed.topicCode),
    board: parsed.board,
    track: parsed.track,
    topic_code: parsed.topicCode,
    title: parsed.title,
    description: parsed.description,
    challenge_url: parsed.challengeUrl || csvRow?.kahoot_url || undefined,
    page_url: csvRow?.worksheet_payhip_url || undefined,
    creator_url: undefined,
    website_link_id: buildWebsiteLinkId(csvRow),
    listing_path: parsed.listingPath,
    tags: parsed.tags,
    upload_status: parsed.challengeUrl ? 'uploaded' : 'draft',
    questions: [],
    review_notes: '',
    org_type: 'standalone',
    created_at: now,
    updated_at: now,
    ai_generated_at: now,
    human_reviewed_at: parsed.challengeUrl ? now : undefined,
    uploaded_at: parsed.challengeUrl ? now : undefined,
  };

  items.push(item);
}

// Sort by topic_code naturally
items.sort((a, b) => {
  if (a.board !== b.board) return a.board.localeCompare(b.board);
  if (a.track !== b.track) {
    const trackOrder = { core: 0, extended: 1, foundation: 2, higher: 3 };
    return (trackOrder[a.track] || 0) - (trackOrder[b.track] || 0);
  }
  // Natural sort topic code: C1.1 < C1.2 < C1.10 < C2.1
  const [, aCh, aSec] = a.topic_code.match(/\w(\d+)\.(\d+)/) || [];
  const [, bCh, bSec] = b.topic_code.match(/\w(\d+)\.(\d+)/) || [];
  if (aCh !== bCh) return Number(aCh) - Number(bCh);
  return Number(aSec) - Number(bSec);
});

// Write JSON
fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(items, null, 2));
console.log(`\nWrote ${items.length} items to ${OUTPUT_JSON}`);

// Write TypeScript constants file
const tsContent = `// Auto-generated from Listing.md files — do not edit manually.
// Run: node scripts/extract-kahoot-from-listings.mjs
import { KahootItem } from './types';

export const KAHOOT_SEED_ITEMS: KahootItem[] = ${JSON.stringify(items, null, 2)};
`;
fs.writeFileSync(OUTPUT_CONST, tsContent);
console.log(`Wrote TypeScript seed to ${OUTPUT_CONST}`);

// Stats
const stats = {
  total: items.length,
  cie_core: items.filter(i => i.board === 'cie0580' && i.track === 'core').length,
  cie_extended: items.filter(i => i.board === 'cie0580' && i.track === 'extended').length,
  edx_foundation: items.filter(i => i.board === 'edexcel-4ma1' && i.track === 'foundation').length,
  edx_higher: items.filter(i => i.board === 'edexcel-4ma1' && i.track === 'higher').length,
  with_challenge_url: items.filter(i => i.challenge_url).length,
  with_csv_match: items.filter(i => i.website_link_id).length,
};
console.log('\nStats:', JSON.stringify(stats, null, 2));

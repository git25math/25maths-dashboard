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
const CREATOR_MANIFEST = '/Users/zhuxingzhe/Project/ExamBoard/25maths-website/build/kahoot-import/l1-full/manifest-with-creator-urls.json';
const WEBSITE_ROOT = '/Users/zhuxingzhe/Project/ExamBoard/25maths-website';
const WEBSITE_PUBLIC_ORIGIN = 'https://www.25maths.com';
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

function normalizeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(String(value).trim());
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return String(value).trim().replace(/\/$/, '');
  }
}

function loadExistingSeed(filePath) {
  if (!fs.existsSync(filePath)) return new Map();

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return new Map(
      raw
        .filter(item => item && typeof item.id === 'string')
        .map(item => [item.id, item]),
    );
  } catch {
    return new Map();
  }
}

function loadCreatorLookup(filePath) {
  if (!fs.existsSync(filePath)) return new Map();

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return new Map(
      raw
        .map(row => [normalizeUrl(row.payhip_kahoot_link || row.challenge_url), String(row.creator_url || '').trim()])
        .filter(([challengeUrl, creatorUrl]) => challengeUrl && creatorUrl),
    );
  } catch {
    return new Map();
  }
}

function loadCoverLookup(filePath) {
  if (!fs.existsSync(filePath)) return new Map();

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return new Map(
      raw
        .map(row => {
          const challengeUrl = normalizeUrl(row.payhip_kahoot_link || row.challenge_url);
          const topicDir = String(row.topic_dir || '').trim();
          if (!challengeUrl || !topicDir) return null;

          const coverPath = path.join(topicDir, 'cover-2320x1520-kahoot-minimal.webp');
          if (!fs.existsSync(coverPath)) return null;

          const relativePath = path.relative(WEBSITE_ROOT, coverPath).replaceAll(path.sep, '/');
          return [challengeUrl, `${WEBSITE_PUBLIC_ORIGIN}/${relativePath}`];
        })
        .filter(Boolean),
    );
  } catch {
    return new Map();
  }
}

function normalizeTimeLimit(seconds) {
  const allowed = [5, 10, 20, 30, 60, 90, 120];
  const value = Number(seconds);
  if (allowed.includes(value)) return value;
  const nextSupported = allowed.find(limit => limit >= value);
  return nextSupported || allowed.at(-1);
}

function parseTableRow(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map(cell => cell.trim());
}

function parseQuestionSet(filePath, itemId) {
  if (!fs.existsSync(filePath)) return [];

  const text = fs.readFileSync(filePath, 'utf-8');
  const timerMap = new Map();

  for (const match of text.matchAll(/-\s+Q(\d+)(?:-Q?(\d+))?:\s*(\d+)s/gi)) {
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    const timeLimit = normalizeTimeLimit(match[3]);

    for (let questionNumber = start; questionNumber <= end; questionNumber += 1) {
      timerMap.set(questionNumber, timeLimit);
    }
  }

  return text
    .split(/\r?\n/)
    .filter(line => /^\|\s*\d+\s*\|/.test(line))
    .map(line => parseTableRow(line))
    .filter(columns => columns.length >= 8)
    .map(columns => {
      const questionNumber = Number(columns[0]);
      return {
        id: `${itemId}-q${String(questionNumber).padStart(2, '0')}`,
        prompt: columns[1],
        option_a: columns[2],
        option_b: columns[3],
        option_c: columns[4],
        option_d: columns[5],
        correct_option: columns[6],
        time_limit: timerMap.get(questionNumber) || 30,
      };
    });
}

function loadQuestionLookup(filePath) {
  if (!fs.existsSync(filePath)) return new Map();

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return new Map(
      raw
        .map(row => {
          const challengeUrl = normalizeUrl(row.payhip_kahoot_link || row.challenge_url);
          const topicDir = String(row.topic_dir || '').trim();
          const topicCode = String(row.topic_code || '').trim();
          const board = String(row.board_key || '').trim();
          if (!challengeUrl || !topicDir || !topicCode) return null;

          const track = topicCode.startsWith('C') ? 'core'
            : topicCode.startsWith('E') ? 'extended'
              : topicCode.startsWith('F') ? 'foundation'
                : 'higher';
          const itemId = topicCodeToId(board === 'cie0580' ? 'cie0580' : 'edexcel-4ma1', track, topicCode);
          const questionSetPath = path.join(topicDir, 'kahoot-question-set.md');
          return [challengeUrl, parseQuestionSet(questionSetPath, itemId)];
        })
        .filter(Boolean),
    );
  } catch {
    return new Map();
  }
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

const existingSeed = loadExistingSeed(OUTPUT_JSON);
console.log(`Loaded ${existingSeed.size} existing seed items`);

const creatorLookup = loadCreatorLookup(CREATOR_MANIFEST);
console.log(`Loaded ${creatorLookup.size} creator links`);

const coverLookup = loadCoverLookup(CREATOR_MANIFEST);
console.log(`Loaded ${coverLookup.size} cover URLs`);

const questionLookup = loadQuestionLookup(CREATOR_MANIFEST);
console.log(`Loaded ${questionLookup.size} question sets`);

const now = new Date().toISOString();
const items = [];

for (const file of listingFiles) {
  const parsed = parseListingMd(file);
  const csvRow = csvLookup.get(parsed.topicCode);
  const itemId = topicCodeToId(parsed.board, parsed.track, parsed.topicCode);
  const existing = existingSeed.get(itemId);
  const challengeUrl = parsed.challengeUrl || csvRow?.kahoot_url || existing?.challenge_url || undefined;
  const creatorUrl = creatorLookup.get(normalizeUrl(challengeUrl)) || existing?.creator_url || undefined;
  const coverUrl = coverLookup.get(normalizeUrl(challengeUrl)) || existing?.cover_url || undefined;
  const questions = questionLookup.get(normalizeUrl(challengeUrl)) || existing?.questions || [];

  const item = {
    id: itemId,
    board: parsed.board,
    track: parsed.track,
    topic_code: parsed.topicCode,
    title: parsed.title,
    description: parsed.description,
    challenge_url: challengeUrl,
    page_url: csvRow?.worksheet_payhip_url || undefined,
    creator_url: creatorUrl,
    website_link_id: buildWebsiteLinkId(csvRow),
    listing_path: parsed.listingPath,
    tags: parsed.tags.length > 0 ? parsed.tags : (existing?.tags || []),
    upload_status: existing?.upload_status || (challengeUrl ? 'published' : 'ai_generated'),
    pipeline: existing?.pipeline || {
      ai_generated: Boolean(questions.length > 0),
      reviewed: Boolean(challengeUrl),
      excel_exported: Boolean(challengeUrl),
      kahoot_uploaded: Boolean(challengeUrl),
      web_verified: Boolean(challengeUrl),
      published: Boolean(challengeUrl),
    },
    questions,
    review_notes: existing?.review_notes || '',
    org_type: existing?.org_type || 'standalone',
    org_name: existing?.org_name,
    cover_url: coverUrl,
    created_at: existing?.created_at || now,
    updated_at: existing?.updated_at || now,
    ai_generated_at: existing?.ai_generated_at || now,
    human_reviewed_at: existing?.human_reviewed_at || (challengeUrl ? now : undefined),
    uploaded_at: existing?.uploaded_at || (challengeUrl ? now : undefined),
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
  with_cover_url: items.filter(i => i.cover_url).length,
  with_questions: items.filter(i => i.questions.length > 0).length,
  total_questions: items.reduce((sum, item) => sum + item.questions.length, 0),
  with_csv_match: items.filter(i => i.website_link_id).length,
};
console.log('\nStats:', JSON.stringify(stats, null, 2));

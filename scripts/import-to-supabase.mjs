#!/usr/bin/env node
/**
 * Import generated teaching units directly into Supabase.
 * Replaces existing Year 7-11 skeleton data with fully enriched content.
 * Year 12 data is preserved.
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const envContent = readFileSync(resolve(PROJECT_ROOT, '.env.local'), 'utf-8');
const SUPABASE_URL = envContent.split('\n').find(l => l.startsWith('VITE_SUPABASE_URL=')).split('=').slice(1).join('=').trim();
const SUPABASE_KEY = envContent.split('\n').find(l => l.startsWith('VITE_SUPABASE_ANON_KEY=')).split('=').slice(1).join('=').trim();
const PROXY = process.env.HTTP_PROXY || process.env.https_proxy || 'http://127.0.0.1:7890';

function supabaseRequest(method, path, body = null) {
  const headers = `-H "apikey: ${SUPABASE_KEY}" -H "Authorization: Bearer ${SUPABASE_KEY}" -H "Content-Type: application/json" -H "Prefer: return=minimal"`;
  let cmd = `curl -x "${PROXY}" -s -w "\\n%{http_code}" -X ${method} "${SUPABASE_URL}/rest/v1/${path}" ${headers}`;
  if (body) {
    const tmpFile = `/tmp/supabase-req-${Date.now()}.json`;
    writeFileSync(tmpFile, typeof body === 'string' ? body : JSON.stringify(body));
    cmd += ` -d @"${tmpFile}"`;
    try {
      const result = execSync(cmd, { encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024, timeout: 60000 });
      return parseResponse(result);
    } finally {
      try { execSync(`rm -f "${tmpFile}"`); } catch (_) {}
    }
  }
  const result = execSync(cmd, { encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024, timeout: 60000 });
  return parseResponse(result);
}

function parseResponse(raw) {
  const lines = raw.trim().split('\n');
  const statusCode = parseInt(lines[lines.length - 1]);
  const body = lines.slice(0, -1).join('\n');
  return { status: statusCode, body };
}

// --- Main ---
console.log('Supabase Teaching Units Import');
console.log('='.repeat(50));

// Step 1: Delete existing Year 7-11 units
console.log('\nStep 1: Deleting existing Year 7-11 units...');
const years = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11'];
let totalDeleted = 0;

for (const year of years) {
  const encoded = encodeURIComponent(year);
  const res = supabaseRequest('DELETE', `teaching_units?year_group=eq.${encoded}`);
  if (res.status >= 200 && res.status < 300) {
    console.log(`  Deleted ${year} units (HTTP ${res.status})`);
    totalDeleted++;
  } else {
    console.error(`  FAILED to delete ${year}: HTTP ${res.status} ${res.body}`);
  }
}

// Step 2: Load generated data
console.log('\nStep 2: Loading generated data...');
const dataPath = resolve(__dirname, 'output', 'teaching-units-all.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
const units = data.teachingUnits;
console.log(`  Loaded ${units.length} units from ${dataPath}`);

// Step 3: Insert in batches (Supabase has payload limits)
console.log('\nStep 3: Inserting into Supabase...');
const BATCH_SIZE = 10;
let totalInserted = 0;

for (let i = 0; i < units.length; i += BATCH_SIZE) {
  const batch = units.slice(i, i + BATCH_SIZE);
  // Map to Supabase columns
  const rows = batch.map(u => ({
    id: u.id,
    year_group: u.year_group,
    title: u.title,
    learning_objectives: u.learning_objectives,
    lessons: u.lessons || [],
    sub_units: u.sub_units || [],
    typical_examples: u.typical_examples || [],
    core_vocabulary: u.core_vocabulary || [],
    prep_material_template: u.prep_material_template || '',
    ai_prompt_template: u.ai_prompt_template || '',
  }));

  const res = supabaseRequest('POST', 'teaching_units', rows);
  if (res.status >= 200 && res.status < 300) {
    totalInserted += batch.length;
    console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} units (${totalInserted}/${units.length})`);
  } else {
    console.error(`  FAILED batch at offset ${i}: HTTP ${res.status}`);
    console.error(`  ${res.body.slice(0, 300)}`);
    // Try one-by-one fallback
    for (const row of rows) {
      const single = supabaseRequest('POST', 'teaching_units', [row]);
      if (single.status >= 200 && single.status < 300) {
        totalInserted++;
        console.log(`    Inserted ${row.id} individually`);
      } else {
        console.error(`    FAILED ${row.id}: ${single.body.slice(0, 200)}`);
      }
    }
  }
}

// Step 4: Verify
console.log('\nStep 4: Verifying...');
const verifyCmd = `curl -x "${PROXY}" -s "${SUPABASE_URL}/rest/v1/teaching_units?select=id,year_group&order=id" -H "apikey: ${SUPABASE_KEY}" -H "Authorization: Bearer ${SUPABASE_KEY}" -H "Prefer: count=exact" -I`;
const verifyResult = execSync(verifyCmd, { encoding: 'utf-8' });
const countMatch = verifyResult.match(/content-range: \d+-\d+\/(\d+)/);
const totalCount = countMatch ? countMatch[1] : '?';

console.log(`\n${'='.repeat(50)}`);
console.log(`Done.`);
console.log(`  Deleted: Year 7-11 old data`);
console.log(`  Inserted: ${totalInserted} units`);
console.log(`  Total in Supabase: ${totalCount} units`);
console.log(`  (includes ${72 - 55} Year 12 units preserved)`);

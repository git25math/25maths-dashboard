#!/usr/bin/env node
/**
 * Retry generating content for sub-units that have empty exercises/homework.
 * Reads the intermediate cache files, regenerates failed units, and saves back.
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const OUTPUT_DIR = resolve(__dirname, 'output');

// Load API key
const envContent = readFileSync(resolve(PROJECT_ROOT, '.env.local'), 'utf-8');
const GEMINI_API_KEY = envContent.split('\n').find(l => l.startsWith('VITE_GEMINI_API_KEY=')).split('=').slice(1).join('=').trim();
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const HTTP_PROXY = process.env.HTTP_PROXY || process.env.https_proxy || 'http://127.0.0.1:7890';

function sanitizeJsonEscapes(raw) {
  let result = raw.replace(/(?<!\\)\\([a-zA-Z]{2,})/g, '\\\\$1');
  result = result.replace(/(?<!\\)\\(?!["\\/bfnrtu\\])/g, '\\\\');
  return result;
}

function callGemini(prompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 32768, responseMimeType: 'application/json' },
  };
  const tmpFile = `/tmp/gemini-retry-${Date.now()}.json`;
  writeFileSync(tmpFile, JSON.stringify(body));
  try {
    const raw = execSync(`curl -x "${HTTP_PROXY}" -s --max-time 180 -X POST "${GEMINI_URL}" -H "Content-Type: application/json" -d @"${tmpFile}"`, {
      encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024, timeout: 200000,
    });
    const data = JSON.parse(raw);
    if (data.error) throw new Error(`API: ${data.error.message}`);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response');
    const cleaned = text.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
    return JSON.parse(sanitizeJsonEscapes(cleaned));
  } finally {
    try { execSync(`rm -f "${tmpFile}"`); } catch (_) {}
  }
}

function getObjectiveTexts(subUnit) {
  if (Array.isArray(subUnit.learning_objectives) && subUnit.learning_objectives.length > 0) {
    return subUnit.learning_objectives
      .map(lo => typeof lo === 'string' ? lo : lo?.objective)
      .filter(Boolean);
  }

  return Array.isArray(subUnit.objectives) ? subUnit.objectives.filter(Boolean) : [];
}

// Process each year file
const yearFiles = ['y7', 'y8', 'y9', 'y10', 'y11'];
let totalFixed = 0;

for (const yt of yearFiles) {
  const fpath = resolve(OUTPUT_DIR, `teaching-units-${yt}.json`);
  const units = JSON.parse(readFileSync(fpath, 'utf-8'));
  let modified = false;

  for (const unit of units) {
    const emptySubs = unit.sub_units.filter(su => su.classroom_exercises === '' || su.homework_content === '');
    if (emptySubs.length === 0) continue;

    console.log(`Retrying: ${unit.title} (${emptySubs.length} empty sub-units)`);
    const subUnitsForPrompt = unit.sub_units.map((su, i) =>
      `Sub-unit ${i + 1}: "${su.title}"\nObjectives:\n${getObjectiveTexts(su).map(o => `- ${o}`).join('\n')}`
    ).join('\n\n');

    const prompt = `You are a bilingual (English + Chinese) math teacher preparing lesson materials for ${unit.year_group} students.

Given this teaching unit "${unit.title}" with the following sub-units and objectives, generate supplementary content for EACH sub-unit.

${subUnitsForPrompt}

For EACH sub-unit, generate:
1. **vocabulary** (10-15 items): Key math terms. Each: {"english": "Term", "chinese": "中文"}
2. **classroom_exercises** (5-8 questions): Practice in Markdown, bilingual, with LaTeX math
3. **homework_content** (5-6 questions): Homework in Markdown, slightly harder
4. **periods**: Estimated 45-min periods (integer, 1-4)

IMPORTANT: Use DOUBLE backslashes for LaTeX in JSON (e.g., $\\\\frac{1}{2}$, $\\\\times$).
Return JSON array with EXACTLY ${unit.sub_units.length} objects in order.`;

    try {
      const results = callGemini(prompt);
      if (Array.isArray(results) && results.length >= unit.sub_units.length) {
        unit.sub_units.forEach((su, i) => {
          if (su.classroom_exercises === '' || su.homework_content === '') {
            const r = results[i] || {};
            if (r.vocabulary && r.vocabulary.length > 0) su.vocabulary = r.vocabulary;
            if (r.classroom_exercises) su.classroom_exercises = r.classroom_exercises;
            if (r.homework_content) su.homework_content = r.homework_content;
            if (r.periods) su.periods = r.periods;
            totalFixed++;
            console.log(`  Fixed: ${su.title}`);
          }
        });
        modified = true;
      }
    } catch (err) {
      console.error(`  Failed: ${err.message.slice(0, 100)}`);
    }
  }

  if (modified) {
    writeFileSync(fpath, JSON.stringify(units, null, 2));
    console.log(`  Saved updated ${yt}`);
  }
}

// Rebuild combined file
if (totalFixed > 0) {
  const allUnits = [];
  for (const yt of yearFiles) {
    const fpath = resolve(OUTPUT_DIR, `teaching-units-${yt}.json`);
    allUnits.push(...JSON.parse(readFileSync(fpath, 'utf-8')));
  }
  writeFileSync(resolve(OUTPUT_DIR, 'teaching-units-all.json'), JSON.stringify({ teachingUnits: allUnits }, null, 2));
  console.log(`\nFixed ${totalFixed} sub-units. Updated teaching-units-all.json`);
} else {
  console.log('\nNo empty sub-units found.');
}

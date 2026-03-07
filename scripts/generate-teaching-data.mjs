#!/usr/bin/env node
/**
 * generate-teaching-data.mjs
 *
 * Batch-generates Teaching Unit + Sub-Unit data from bilingual teaching plan
 * documents (.docx). Uses Gemini AI to:
 *   1. Parse each .docx into structured units / sub-units with objectives
 *   2. Generate vocabulary, exercises, and homework for every sub-unit
 *
 * Usage:  node scripts/generate-teaching-data.mjs
 * Output: scripts/output/teaching-units-all.json
 *
 * Incremental: intermediate results are saved per year-group so a partial run
 * can be resumed without re-calling the API for already-completed years.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const OUTPUT_DIR = resolve(__dirname, 'output');

// ─── Configuration ──────────────────────────────────────────────────────────

function loadApiKey() {
  const envPath = resolve(PROJECT_ROOT, '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  const key = envContent
    .split('\n')
    .find(l => l.startsWith('VITE_GEMINI_API_KEY='))
    ?.split('=')
    .slice(1)
    .join('=')
    .trim();
  if (!key) {
    console.error('VITE_GEMINI_API_KEY not found in .env.local');
    process.exit(1);
  }
  return key;
}

const GEMINI_API_KEY = loadApiKey();
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const HTTP_PROXY = process.env.HTTP_PROXY || process.env.https_proxy || 'http://127.0.0.1:7890';
const RATE_LIMIT_MS = 1500;

const YEAR_DOCS = [
  {
    year: 'Year 7',
    yearTag: 'y7',
    path: '/Users/zhuxingzhe/Library/Mobile Documents/com~apple~CloudDocs/HarrowHaikou/US_Math/@Teaching Sets/2025-2026/Year7B(14)/Year 7 Bilungual-LearningObjectives.docx',
  },
  {
    year: 'Year 8',
    yearTag: 'y8',
    path: '/Users/zhuxingzhe/Library/Mobile Documents/com~apple~CloudDocs/HarrowHaikou/US_Math/@Teaching Sets/2025-2026/Year8B(9)/Year 8 Bilingual-LearningObjectives.docx',
  },
  {
    year: 'Year 9',
    yearTag: 'y9',
    path: '/Users/zhuxingzhe/Library/Mobile Documents/com~apple~CloudDocs/HarrowHaikou/US_Math/@Teaching Sets/2025-2026/Year9/Year 9 Bilingual-LearningObjectives.docx',
  },
  {
    year: 'Year 10',
    yearTag: 'y10',
    path: '/Users/zhuxingzhe/Library/Mobile Documents/com~apple~CloudDocs/HarrowHaikou/US_Math/@Teaching Sets/2025-2026/Year10B(10)/Year 10 Bilingual-LearningObjectives.docx',
  },
  {
    year: 'Year 11',
    yearTag: 'y11',
    path: '/Users/zhuxingzhe/Library/Mobile Documents/com~apple~CloudDocs/HarrowHaikou/US_Math/@Teaching Sets/2025-2026/Year11B(8)/Y 11 Bilingual-LearningObjectives.docx',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractDocxText(docPath) {
  try {
    return execSync(`textutil -convert txt -stdout "${docPath}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err) {
    console.error(`Failed to extract text from: ${docPath}`);
    throw err;
  }
}

/**
 * Fix LaTeX backslashes in Gemini JSON output.
 *
 * Problem: Gemini returns JSON containing LaTeX like \frac, \times, \sqrt.
 * Some of these collide with valid JSON escapes (\f, \t, \n, \r, \b) but
 * are actually LaTeX commands, not control characters.
 *
 * Strategy:
 *  1. \X where X is 2+ letters → definitely LaTeX (e.g. \frac, \sqrt, \times)
 *     → escape as \\X
 *  2. \X where X is 1 letter and NOT a valid JSON escape → invalid escape
 *     (e.g. \p for \pi won't happen since \pi is 2 letters, but \a, \c etc.)
 *     → escape as \\X
 */
function sanitizeJsonEscapes(raw) {
  // Step 1: Escape \ followed by 2+ letters (LaTeX commands, not JSON escapes)
  // Use negative lookbehind to avoid double-escaping already-escaped \\
  let result = raw.replace(/(?<!\\)\\([a-zA-Z]{2,})/g, '\\\\$1');
  // Step 2: Escape \ followed by a single char that isn't a valid JSON escape
  // Valid single-char JSON escapes: " \ / b f n r t, plus u for \uXXXX
  result = result.replace(/(?<!\\)\\(?!["\\/bfnrtu\\])/g, '\\\\');
  return result;
}

function callGeminiSync(prompt, maxTokens = 32768, retries = 3) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: maxTokens,
      responseMimeType: 'application/json',
    },
  };

  // Write request body to a temp file (persists across retries)
  const tmpFile = `/tmp/gemini-req-${process.pid}-${Date.now()}.json`;
  writeFileSync(tmpFile, JSON.stringify(body));

  try {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const curlCmd = `curl -x "${HTTP_PROXY}" -s --max-time 180 -X POST "${GEMINI_URL}" -H "Content-Type: application/json" -d @"${tmpFile}"`;
        const raw = execSync(curlCmd, {
          encoding: 'utf-8',
          maxBuffer: 20 * 1024 * 1024,
          timeout: 200000,
        });

        if (!raw || raw.trim() === '') {
          throw new Error('Empty curl response');
        }

        const data = JSON.parse(raw);

        // Check for API errors
        if (data.error) {
          if (data.error.code === 429) {
            const wait = 5000 * attempt;
            console.warn(`  [rate-limited] waiting ${wait / 1000}s...`);
            execSync(`sleep ${wait / 1000}`);
            continue;
          }
          throw new Error(`API error ${data.error.code}: ${data.error.message}`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response from Gemini');

        // Strip markdown code fences if present
        const cleaned = text.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();

        // Always sanitize LaTeX escapes before parsing
        const sanitized = sanitizeJsonEscapes(cleaned);
        return JSON.parse(sanitized);
      } catch (err) {
        const msg = err.message || String(err);
        console.warn(`  [attempt ${attempt}/${retries}] ${msg.slice(0, 200)}`);
        if (attempt < retries) {
          execSync(`sleep ${2 * attempt}`);
        } else {
          throw err;
        }
      }
    }
  } finally {
    try { execSync(`rm -f "${tmpFile}"`); } catch (_e) { /* ignore */ }
  }
}

// ─── Step 1: Parse document into structured units ───────────────────────────

function parseDocument(docText, yearGroup) {
  const prompt = `You are a curriculum data parser. Parse this ${yearGroup} mathematics teaching plan document into structured JSON.

RULES:
- Each major topic/unit (top-level section) becomes a TeachingUnit with a "title" field.
- Each sub-section under a unit becomes a SubUnit with a "title" field.
- Lines that describe what students should learn/do become "objectives" (array of strings).
- Keep objectives EXACTLY as written in the document (preserve bilingual English + Chinese text).
- Keep unit and sub-unit titles EXACTLY as written (preserve bilingual text).
- Lines marked "Optional" or "可选" should still be included as objectives with "[Optional] " prefix.
- Lines marked "Higher" should be included with "[Higher] " prefix.
- Sub-units titled "Recap" or "回顾" should be included — they represent recap/review sub-units.
- Ignore document headers like "YEAR X", "MATHEMATICS 数学", "Department of Mathematics", "2025 – 2026".
- Do NOT create empty sub-units with no objectives.
- A sub-unit must have at least one objective.

Return a JSON array:
[
  {
    "title": "Unit Title in English and Chinese",
    "sub_units": [
      {
        "title": "Sub-unit Title",
        "objectives": [
          "Objective 1 in English. 中文目标1。",
          "Objective 2 ..."
        ]
      }
    ]
  }
]

DOCUMENT TEXT:
${docText}`;

  return callGeminiSync(prompt);
}

// ─── Step 2: Generate content for each unit's sub-units ─────────────────────

function generateUnitContent(unitTitle, subUnits, yearGroup) {
  const getObjectiveTexts = (subUnit) => {
    if (Array.isArray(subUnit.learning_objectives) && subUnit.learning_objectives.length > 0) {
      return subUnit.learning_objectives
        .map(lo => typeof lo === 'string' ? lo : lo?.objective)
        .filter(Boolean);
    }

    return Array.isArray(subUnit.objectives) ? subUnit.objectives.filter(Boolean) : [];
  };

  const subUnitsDesc = subUnits
    .map(
      (su, i) =>
        `Sub-unit ${i + 1}: "${su.title}"\nObjectives:\n${getObjectiveTexts(su).map(o => `- ${o}`).join('\n')}`
    )
    .join('\n\n');

  const prompt = `You are a bilingual (English + Chinese) math teacher preparing lesson materials for ${yearGroup} students.

Given this teaching unit "${unitTitle}" with the following sub-units and objectives, generate supplementary content for EACH sub-unit.

${subUnitsDesc}

For EACH sub-unit above, generate:

1. **vocabulary** (10-15 items): Key math terms relevant to the sub-unit objectives.
   Each item: {"english": "Term", "chinese": "中文术语"}
   Include terms students need to know for this topic.

2. **classroom_exercises** (5-8 questions): Practice questions in Markdown format.
   - Mix of difficulty (easy -> medium -> challenging)
   - Include computational AND word problems
   - Use bilingual instructions where helpful
   - Use LaTeX for math: $\\frac{2}{3}$, $x^2$, etc.
   - Number the exercises clearly

3. **homework_content** (5-6 questions): Homework in Markdown format.
   - Slightly harder than classwork
   - Include at least one real-life application / word problem
   - Use LaTeX for math expressions
   - Number the questions clearly

4. **periods**: Estimated number of 45-minute class periods needed (integer, 1-4)

IMPORTANT: Return a JSON array with EXACTLY ${subUnits.length} objects, one per sub-unit, in the SAME ORDER:
[
  {
    "vocabulary": [{"english": "Numerator", "chinese": "分子"}, ...],
    "classroom_exercises": "### Exercise 1\\n...",
    "homework_content": "### Homework 1\\n...",
    "periods": 2
  }
]`;

  return callGeminiSync(prompt);
}

// ─── Build a TeachingUnit object ────────────────────────────────────────────

function buildTeachingUnit(parsedUnit, contents, yearTag, unitIndex, yearGroup) {
  const subUnits = parsedUnit.sub_units.map((su, j) => {
    const c = contents[j] || {
      vocabulary: [],
      classroom_exercises: '',
      homework_content: '',
      periods: 2,
    };
    const objectiveTexts = Array.isArray(su.learning_objectives)
      ? su.learning_objectives.map(lo => typeof lo === 'string' ? lo : lo?.objective).filter(Boolean)
      : Array.isArray(su.objectives)
        ? su.objectives.filter(Boolean)
        : [];
    return {
      id: `su-${yearTag}-${unitIndex + 1}-${j + 1}`,
      title: su.title,
      periods: typeof c.periods === 'number' ? c.periods : 2,
      learning_objectives: objectiveTexts.map((objective, objectiveIndex) => ({
        id: `lo-${yearTag}-${unitIndex + 1}-${j + 1}-${objectiveIndex + 1}`,
        objective,
        status: 'not_started',
        periods: 1,
        covered_lesson_dates: [],
        core_vocabulary: [],
        concept_explanation: '',
        typical_examples: [],
        prep_resources: [],
      })),
      vocabulary: Array.isArray(c.vocabulary) ? c.vocabulary : [],
      shared_resources: [],
      classroom_exercises: c.classroom_exercises || '',
      homework_content: c.homework_content || '',
    };
  });

  return {
    id: `u-${yearTag}-${unitIndex + 1}`,
    year_group: yearGroup,
    title: parsedUnit.title,
    learning_objectives: parsedUnit.sub_units.flatMap(su => (
      Array.isArray(su.learning_objectives)
        ? su.learning_objectives.map(lo => typeof lo === 'string' ? lo : lo?.objective).filter(Boolean)
        : Array.isArray(su.objectives)
          ? su.objectives.filter(Boolean)
          : []
    )),
    lessons: [],
    sub_units: subUnits,
    typical_examples: [],
    shared_resources: [],
    core_vocabulary: [],
    prep_material_template: '',
    ai_prompt_template: '',
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('Teaching Data Generator');
  console.log('='.repeat(60));

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Using model: ${GEMINI_MODEL}`);
  console.log(`Using proxy: ${HTTP_PROXY}`);

  const allUnits = [];
  let totalApiCalls = 0;

  for (const doc of YEAR_DOCS) {
    console.log(`\n--- ${doc.year} ---`);

    // Check for cached intermediate result
    const cachePath = resolve(OUTPUT_DIR, `teaching-units-${doc.yearTag}.json`);
    if (existsSync(cachePath)) {
      console.log(`  Found cached result, loading...`);
      const cached = JSON.parse(readFileSync(cachePath, 'utf-8'));
      allUnits.push(...cached);
      console.log(`  Loaded ${cached.length} units from cache`);
      continue;
    }

    // Extract text from docx
    console.log(`  Extracting text from docx...`);
    const docText = extractDocxText(doc.path);
    console.log(`  Extracted ${docText.length} characters`);

    // Parse structure with Gemini
    console.log(`  Parsing document structure...`);
    const parsedUnits = parseDocument(docText, doc.year);
    totalApiCalls++;
    console.log(`  Found ${parsedUnits.length} units:`);
    parsedUnits.forEach((u, i) =>
      console.log(`    ${i + 1}. ${u.title} (${u.sub_units.length} sub-units)`)
    );

    execSync(`sleep ${RATE_LIMIT_MS / 1000}`);

    // Generate content for each unit
    const yearUnits = [];

    for (let i = 0; i < parsedUnits.length; i++) {
      const pu = parsedUnits[i];
      console.log(
        `  [${i + 1}/${parsedUnits.length}] Generating content: ${pu.title.slice(0, 50)}...`
      );

      let subUnitContents;
      try {
        subUnitContents = generateUnitContent(
          pu.title,
          pu.sub_units,
          doc.year
        );
        totalApiCalls++;

        // Validate array length
        if (!Array.isArray(subUnitContents)) {
          console.warn(`    Warning: response is not an array, wrapping...`);
          subUnitContents = [subUnitContents];
        }
        if (subUnitContents.length !== pu.sub_units.length) {
          console.warn(
            `    Warning: expected ${pu.sub_units.length} items, got ${subUnitContents.length}`
          );
          // Pad or trim
          while (subUnitContents.length < pu.sub_units.length) {
            subUnitContents.push({
              vocabulary: [],
              classroom_exercises: '',
              homework_content: '',
              periods: 2,
            });
          }
          subUnitContents = subUnitContents.slice(0, pu.sub_units.length);
        }
      } catch (err) {
        console.error(`    FAILED: ${err.message}`);
        subUnitContents = pu.sub_units.map(() => ({
          vocabulary: [],
          classroom_exercises: '',
          homework_content: '',
          periods: 2,
        }));
      }

      yearUnits.push(
        buildTeachingUnit(pu, subUnitContents, doc.yearTag, i, doc.year)
      );

      if (i < parsedUnits.length - 1) {
        execSync(`sleep ${RATE_LIMIT_MS / 1000}`);
      }
    }

    // Save intermediate result
    writeFileSync(cachePath, JSON.stringify(yearUnits, null, 2));
    console.log(`  Saved ${yearUnits.length} units -> ${cachePath}`);

    allUnits.push(...yearUnits);
  }

  // Save final combined output
  const finalPath = resolve(OUTPUT_DIR, 'teaching-units-all.json');
  const output = { teachingUnits: allUnits };
  writeFileSync(finalPath, JSON.stringify(output, null, 2));

  // Summary
  const totalSubUnits = allUnits.reduce(
    (sum, u) => sum + (u.sub_units?.length || 0),
    0
  );
  const totalVocab = allUnits.reduce(
    (sum, u) =>
      sum +
      (u.sub_units || []).reduce(
        (s, su) => s + (su.vocabulary?.length || 0),
        0
      ),
    0
  );

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Done!`);
  console.log(`  Teaching units : ${allUnits.length}`);
  console.log(`  Sub-units      : ${totalSubUnits}`);
  console.log(`  Vocabulary items: ${totalVocab}`);
  console.log(`  API calls made : ${totalApiCalls}`);
  console.log(`  Output file    : ${finalPath}`);
  console.log(`\nImport via: Dashboard -> Settings -> Import Data`);
}

try {
  main();
} catch (err) {
  console.error('Fatal error:', err);
  process.exit(1);
}

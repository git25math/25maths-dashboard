#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DATA_PATH = resolve(__dirname, 'output', 'teaching-units-all.json');
const HTTP_PROXY = process.env.HTTP_PROXY || process.env.https_proxy || 'http://127.0.0.1:7890';
const RATE_LIMIT_MS = 1200;
const DEFAULT_YEARS = new Set(['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11']);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--year') args.year = argv[++i];
    if (arg === '--limit') args.limit = Number(argv[++i]);
  }
  return args;
}

function loadApiKey() {
  const envPath = resolve(PROJECT_ROOT, '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  const key = envContent
    .split('\n')
    .find(line => line.startsWith('VITE_GEMINI_API_KEY='))
    ?.split('=')
    .slice(1)
    .join('=')
    .trim();
  if (!key) throw new Error('VITE_GEMINI_API_KEY not found in .env.local');
  return key;
}

const GEMINI_API_KEY = loadApiKey();
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

function escapeControlCharsInJsonStrings(raw) {
  let result = '';
  let inString = false;
  let escaped = false;

  for (const char of raw) {
    if (!inString) {
      result += char;
      if (char === '"') inString = true;
      continue;
    }

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      result += char;
      inString = false;
      continue;
    }

    if (char === '\n') {
      result += '\\n';
      continue;
    }

    if (char === '\r') {
      result += '\\r';
      continue;
    }

    if (char === '\t') {
      result += '\\t';
      continue;
    }

    const code = char.charCodeAt(0);
    if (code < 0x20) {
      result += `\\u${code.toString(16).padStart(4, '0')}`;
      continue;
    }

    result += char;
  }

  return result;
}

function sanitizeJsonEscapes(raw) {
  let result = escapeControlCharsInJsonStrings(raw);
  result = result.replace(/(?<!\\)\\([a-zA-Z]{2,})/g, '\\\\$1');
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

  const tmpFile = `/tmp/gemini-objective-prep-${process.pid}-${Date.now()}.json`;
  writeFileSync(tmpFile, JSON.stringify(body));

  try {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const raw = execSync(
          `curl -x "${HTTP_PROXY}" -s --max-time 180 -X POST "${GEMINI_URL}" -H "Content-Type: application/json" -d @"${tmpFile}"`,
          { encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024, timeout: 200000 }
        );
        if (!raw || raw.trim() === '') throw new Error('Empty curl response');

        const data = JSON.parse(raw);
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
        const cleaned = text.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
        return JSON.parse(sanitizeJsonEscapes(cleaned));
      } catch (error) {
        const message = error.message || String(error);
        console.warn(`  [attempt ${attempt}/${retries}] ${message.slice(0, 200)}`);
        if (attempt < retries) {
          execSync(`sleep ${2 * attempt}`);
        } else {
          throw error;
        }
      }
    }
  } finally {
    try { execSync(`rm -f "${tmpFile}"`); } catch (_error) {}
  }
}

function buildSharedPrepResources(subUnit) {
  return [
    { title: 'Worksheet', url: subUnit.worksheet_url || '', kind: 'worksheet' },
    { title: 'Online Practice', url: subUnit.online_practice_url || '', kind: 'practice' },
    { title: 'Kahoot', url: subUnit.kahoot_url || '', kind: 'kahoot' },
    { title: 'Homework', url: subUnit.homework_url || '', kind: 'homework' },
    { title: 'Vocabulary Practice', url: subUnit.vocab_practice_url || '', kind: 'vocab' },
  ].filter(resource => resource.url);
}

function needsObjectivePrep(subUnit) {
  return (subUnit.learning_objectives || []).some(lo =>
    !Array.isArray(lo.core_vocabulary) || lo.core_vocabulary.length === 0 ||
    !String(lo.concept_explanation || '').trim() ||
    !Array.isArray(lo.typical_examples) || lo.typical_examples.length === 0
  );
}

function buildPrompt(unit, subUnit) {
  const sharedVocabulary = (subUnit.vocabulary || [])
    .map(item => `- ${item.english}${item.chinese ? ` / ${item.chinese}` : ''}`)
    .join('\n');
  const objectiveLines = (subUnit.learning_objectives || [])
    .map((objective, index) => `${index + 1}. [${objective.id}] ${objective.objective}`)
    .join('\n');

  const classroomSnippet = String(subUnit.classroom_exercises || '').slice(0, 1400);
  const homeworkSnippet = String(subUnit.homework_content || '').slice(0, 800);
  const aiSummarySnippet = String(subUnit.ai_summary || '').slice(0, 800);

  return `You are a Harrow bilingual mathematics lesson planner.

Generate objective-level prep content for this exact Harrow teaching sub-unit. Stay tightly aligned to the listed objectives and do not broaden beyond the syllabus.

YEAR GROUP: ${unit.year_group}
UNIT: ${unit.title}
SUB-UNIT: ${subUnit.title}

OBJECTIVES:
${objectiveLines}

SHARED VOCABULARY CANDIDATES:
${sharedVocabulary || '- None provided'}

SHARED CLASSROOM EXERCISES (context only):
${classroomSnippet || 'None provided'}

SHARED HOMEWORK (context only):
${homeworkSnippet || 'None provided'}

AI SUMMARY / NOTES (context only):
${aiSummarySnippet || 'None provided'}

Return a JSON array with EXACTLY ${(subUnit.learning_objectives || []).length} objects, one per objective, in the SAME ORDER:
[
  {
    "id": "original objective id",
    "core_vocabulary": [
      { "english": "term", "chinese": "中文" }
    ],
    "concept_explanation": "Markdown string in bilingual English + Chinese. Keep concise but useful for teaching. Include: core idea, common misconception, and teaching move.",
    "typical_examples": [
      { "question": "Worked example question in bilingual format with LaTeX using double backslashes", "solution": "Step-by-step bilingual solution in Markdown" }
    ]
  }
]

RULES:
- Keep content faithful to Harrow objective wording.
- core_vocabulary: 4-8 focused items per objective. Prefer selecting from shared vocabulary when relevant.
- concept_explanation: concise teacher-facing prep note, not a full lesson script.
- typical_examples: 1-2 items per objective, with clear progression.
- Use double backslashes for LaTeX in JSON.
- Do not add resource URLs or extra fields.`;
}

function enrichSubUnit(unit, subUnit) {
  const prompt = buildPrompt(unit, subUnit);
  const result = callGeminiSync(prompt);
  const generatedItems = Array.isArray(result) ? result : [];
  const prepById = new Map(generatedItems.map(item => [item.id, item]));
  const sharedResources = buildSharedPrepResources(subUnit);

  return {
    ...subUnit,
    learning_objectives: (subUnit.learning_objectives || []).map((lo, index) => {
      const generated = prepById.get(lo.id) || generatedItems[index] || {};
      const generatedVocabulary = Array.isArray(generated.core_vocabulary)
        ? generated.core_vocabulary
        : Array.isArray(generated.coreVocabulary)
          ? generated.coreVocabulary
          : [];
      const generatedExamples = Array.isArray(generated.typical_examples)
        ? generated.typical_examples
        : Array.isArray(generated.typicalExamples)
          ? generated.typicalExamples
          : [];
      return {
        ...lo,
        core_vocabulary: generatedVocabulary.length > 0
          ? generatedVocabulary
          : lo.core_vocabulary || [],
        concept_explanation: generated.concept_explanation || generated.conceptExplanation || lo.concept_explanation || '',
        typical_examples: generatedExamples.length > 0
          ? generatedExamples
          : lo.typical_examples || [],
        prep_resources: Array.isArray(lo.prep_resources) && lo.prep_resources.length > 0
          ? lo.prep_resources
          : sharedResources,
      };
    }),
  };
}

function saveData(units) {
  writeFileSync(DATA_PATH, `${JSON.stringify({ teachingUnits: units }, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetYears = args.year ? new Set([args.year]) : DEFAULT_YEARS;
  const limit = Number.isFinite(args.limit) ? args.limit : Number.POSITIVE_INFINITY;

  const payload = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  const units = Array.isArray(payload.teachingUnits) ? payload.teachingUnits : [];

  let processedSubUnits = 0;

  for (const unit of units) {
    if (!targetYears.has(unit.year_group)) continue;

    console.log(`\n${unit.year_group} :: ${unit.title}`);
    const nextSubUnits = [];

    for (const subUnit of unit.sub_units || []) {
      if (processedSubUnits >= limit) {
        nextSubUnits.push(subUnit);
        continue;
      }

      if (!needsObjectivePrep(subUnit)) {
        nextSubUnits.push(subUnit);
        continue;
      }

      console.log(`  Generating objective prep for ${subUnit.title}`);

      try {
        const enriched = enrichSubUnit(unit, subUnit);
        processedSubUnits++;
        nextSubUnits.push(enriched);
        unit.sub_units = nextSubUnits.concat((unit.sub_units || []).slice(nextSubUnits.length));
        saveData(units);
      } catch (error) {
        console.error(`  Failed: ${subUnit.title} :: ${(error.message || String(error)).slice(0, 200)}`);
        nextSubUnits.push(subUnit);
      }

      execSync(`sleep ${RATE_LIMIT_MS / 1000}`);
    }

    unit.sub_units = nextSubUnits;

    if (processedSubUnits >= limit) break;
  }

  console.log(`\nGenerated objective prep for ${processedSubUnits} sub-units.`);
}

main();

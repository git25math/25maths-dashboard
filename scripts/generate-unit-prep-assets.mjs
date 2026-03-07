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

function callGeminiSync(prompt, maxTokens = 24576, retries = 3) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: maxTokens,
      responseMimeType: 'application/json',
    },
  };

  const tmpFile = `/tmp/gemini-unit-prep-${process.pid}-${Date.now()}.json`;
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

function needsUnitPrepAssets(unit) {
  if (!String(unit.prep_material_template || '').trim()) return true;
  if (!String(unit.ai_prompt_template || '').trim()) return true;
  return (unit.sub_units || []).some(subUnit => !String(subUnit.ai_summary || '').trim());
}

function buildPrompt(unit) {
  const unitObjectives = (unit.sub_units || [])
    .flatMap(subUnit => (subUnit.learning_objectives || []).map(lo => lo.objective))
    .filter(Boolean)
    .slice(0, 24)
    .map(objective => `- ${objective}`)
    .join('\n');

  const subUnitsBlock = (unit.sub_units || [])
    .map((subUnit, index) => {
      const objectiveLines = (subUnit.learning_objectives || [])
        .map(lo => `- ${lo.objective}`)
        .join('\n');
      const vocabularyLines = (subUnit.vocabulary || [])
        .slice(0, 6)
        .map(item => `- ${item.english}${item.chinese ? ` / ${item.chinese}` : ''}`)
        .join('\n');

      const exercisesSnippet = String(subUnit.classroom_exercises || '')
        .replace(/\s+/g, ' ')
        .slice(0, 500);
      const homeworkSnippet = String(subUnit.homework_content || '')
        .replace(/\s+/g, ' ')
        .slice(0, 500);

      return `Sub-unit ${index + 1} [${subUnit.id}]: ${subUnit.title}
Objectives:
${objectiveLines || '- None provided'}
Vocabulary focus:
${vocabularyLines || '- None provided'}
Classwork snippet:
${exercisesSnippet || 'None provided'}
Homework snippet:
${homeworkSnippet || 'None provided'}`;
    })
    .join('\n\n');

  return `You are a bilingual (English + Chinese) Harrow mathematics curriculum planner.

Create unit-level preparation assets and sub-unit knowledge cards for this exact unit.

YEAR GROUP: ${unit.year_group}
UNIT: ${unit.title}

UNIT OBJECTIVES:
${unitObjectives || '- None provided'}

SUB-UNITS:
${subUnitsBlock}

Return ONLY valid JSON with this exact structure:
{
  "prep_material_template": "Markdown string. Teacher-facing unit prep guide with sections for sequence, misconceptions, representations/resources, and lesson rhythm.",
  "ai_prompt_template": "Compact prompt template for AI lesson-plan generation for this unit. Keep it specific to the unit, classwork style, and bilingual teaching context.",
  "sub_units": [
    {
      "id": "exact sub-unit id",
      "ai_summary": "Markdown string. Bilingual knowledge card with exactly these sections: ### Big Idea, ### Common Misconception, ### Teaching Moves."
    }
  ]
}

RULES:
- Keep all output tightly aligned to the existing Harrow unit and sub-unit objectives.
- prep_material_template should be practical, concise, and reusable across lessons in this unit.
- ai_prompt_template should help generate strong lesson plans for this unit without mentioning a specific class date.
- sub_units must contain EXACTLY ${(unit.sub_units || []).length} items, one per sub-unit, in the SAME ORDER.
- Use the exact sub-unit ids provided.
- Do not add extra keys.`;
}

function mergeUnitPrepAssets(unit, generated) {
  const generatedSubUnits = Array.isArray(generated.sub_units)
    ? generated.sub_units
    : Array.isArray(generated.subUnits)
      ? generated.subUnits
      : [];
  const generatedById = new Map(generatedSubUnits.map(item => [item.id, item]));

  return {
    ...unit,
    prep_material_template: generated.prep_material_template || generated.prepMaterialTemplate || unit.prep_material_template || '',
    ai_prompt_template: generated.ai_prompt_template || generated.aiPromptTemplate || unit.ai_prompt_template || '',
    sub_units: (unit.sub_units || []).map((subUnit, index) => {
      const matched = generatedById.get(subUnit.id) || generatedSubUnits[index] || {};
      return {
        ...subUnit,
        ai_summary: matched.ai_summary || matched.aiSummary || subUnit.ai_summary || '',
      };
    }),
  };
}

function saveData(units) {
  writeFileSync(DATA_PATH, `${JSON.stringify({ teachingUnits: units }, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetYears = args.year ? new Set([args.year]) : null;
  const limit = Number.isFinite(args.limit) ? args.limit : Number.POSITIVE_INFINITY;

  const payload = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  const units = Array.isArray(payload.teachingUnits) ? payload.teachingUnits : [];

  let processedUnits = 0;

  for (let index = 0; index < units.length; index++) {
    const unit = units[index];
    if (targetYears && !targetYears.has(unit.year_group)) continue;
    if (!needsUnitPrepAssets(unit)) continue;
    if (processedUnits >= limit) break;

    console.log(`\n${unit.year_group} :: ${unit.title}`);

    try {
      const generated = callGeminiSync(buildPrompt(unit));
      units[index] = mergeUnitPrepAssets(unit, generated);
      processedUnits++;
      saveData(units);
    } catch (error) {
      console.error(`  Failed: ${(error.message || String(error)).slice(0, 200)}`);
    }

    execSync(`sleep ${RATE_LIMIT_MS / 1000}`);
  }

  console.log(`\nGenerated prep assets for ${processedUnits} units.`);
}

main();

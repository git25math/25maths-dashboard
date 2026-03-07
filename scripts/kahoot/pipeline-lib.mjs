#!/usr/bin/env node
import { spawn } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DASHBOARD_ROOT = resolve(__dirname, '..', '..');
export const DEFAULT_WEBSITE_ROOT = process.env.KAHOOT_WEBSITE_ROOT || resolve(DASHBOARD_ROOT, '..', '25maths-website');

loadEnv({ path: resolve(DASHBOARD_ROOT, '.env.local'), override: false, quiet: true });
loadEnv({ path: resolve(DASHBOARD_ROOT, '.env'), override: false, quiet: true });

export function parseArgs(argv) {
  const args = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (next == null || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

export function nowIso() {
  return new Date().toISOString();
}

export function ensureDir(path) {
  mkdirSync(path, { recursive: true });
  return path;
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function writeJson(path, value) {
  ensureDir(dirname(path));
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  return path;
}

export function writeText(path, value) {
  ensureDir(dirname(path));
  writeFileSync(path, value);
  return path;
}

export function resolveWebsiteRoot(customRoot) {
  const root = resolve(customRoot || DEFAULT_WEBSITE_ROOT);
  if (!existsSync(root)) {
    throw new Error(`Website repo not found: ${root}`);
  }
  return root;
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'kahoot-item';
}

export function normalizeTrackLabel(track) {
  const normalized = String(track || '').trim().toLowerCase();
  if (normalized === 'extended') return 'Extended';
  if (normalized === 'foundation') return 'Foundation';
  if (normalized === 'higher') return 'Higher';
  return 'Core';
}

export function normalizeTrackKey(track) {
  const normalized = String(track || '').trim().toLowerCase();
  if (normalized === 'extended') return 'extended';
  if (normalized === 'foundation') return 'foundation';
  if (normalized === 'higher') return 'higher';
  return 'core';
}

export function normalizeTopicCode(value) {
  const raw = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  const match = raw.match(/^([A-Z])(\d+)[.-]?(\d+)$/);
  if (!match) {
    return raw;
  }

  const [, prefix, unit, topic] = match;
  return `${prefix}${Number(unit)}-${String(Number(topic)).padStart(2, '0')}`;
}

export function normalizeTopicCodeDot(value) {
  const normalized = normalizeTopicCode(value);
  const match = normalized.match(/^([A-Z])(\d+)-(\d+)$/);
  if (!match) {
    return normalized;
  }

  return `${match[1]}${match[2]}.${Number(match[3])}`;
}

export function normalizeBoardKey(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'edexcel-4ma1' ? 'edexcel-4ma1' : 'cie0580';
}

export function stripJsonFences(raw) {
  return String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}

export function sanitizeInlineText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function xmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function escapeCsvCell(value) {
  const cell = value == null ? '' : String(value);
  return `"${cell.replace(/"/g, '""')}"`;
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        continue;
      }
      cell += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(cell);
      cell = '';
      continue;
    }

    if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    if (char === '\r') {
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length === 0) {
    return { headers: [], records: [] };
  }

  const [headers, ...body] = rows;
  const records = body
    .filter(entry => entry.some(cellValue => String(cellValue || '').trim() !== ''))
    .map(entry => Object.fromEntries(headers.map((header, index) => [header, entry[index] || ''])));

  return { headers, records };
}

export function serializeCsv(headers, records) {
  return [
    headers.join(','),
    ...records.map(record => headers.map(header => escapeCsvCell(record[header] || '')).join(',')),
  ].join('\n');
}

export function newestMatchingFile(dir, matcher) {
  if (!existsSync(dir)) {
    return null;
  }

  const files = readdirSync(dir)
    .map(name => resolve(dir, name))
    .filter(path => statSync(path).isFile() && matcher(path))
    .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs);

  return files[0] || null;
}

export async function runCommand(command, args = [], options = {}) {
  const {
    cwd = DASHBOARD_ROOT,
    env = {},
    forwardStdout = true,
    forwardStderr = true,
    input,
  } = options;

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      const text = chunk.toString();
      stdout += text;
      if (forwardStdout) process.stdout.write(text);
    });

    child.stderr.on('data', chunk => {
      const text = chunk.toString();
      stderr += text;
      if (forwardStderr) process.stderr.write(text);
    });

    child.on('error', rejectPromise);

    child.on('close', code => {
      const result = { code: code ?? 0, stdout, stderr };
      if ((code ?? 0) === 0) {
        resolvePromise(result);
        return;
      }
      const error = new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`);
      error.result = result;
      rejectPromise(error);
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

export function maybeResolvePath(baseDir, candidate) {
  if (!candidate) return '';
  return isAbsolute(candidate) ? candidate : resolve(baseDir, candidate);
}

export function questionHasGaps(question) {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d].map(value => String(value || '').trim());
  return !String(question.prompt || '').trim() || options.some(value => !value);
}

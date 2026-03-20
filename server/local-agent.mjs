#!/usr/bin/env node
import express from 'express';
import { mkdirSync, existsSync, readFileSync, statSync, writeFileSync, realpathSync, readdirSync, openSync, readSync, closeSync, renameSync } from 'fs';
import { basename, dirname, resolve, sep, relative } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const RUNTIME_DIR = resolve(__dirname, 'runtime');
const PORT = Number(process.env.KAHOOT_AGENT_PORT || 4318);

mkdirSync(RUNTIME_DIR, { recursive: true });

const app = express();
app.use(express.json({ limit: '2mb' }));

function getWebsiteRoot() {
  return process.env.KAHOOT_WEBSITE_ROOT || resolve(PROJECT_ROOT, '..', '25maths-website');
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

const jobs = new Map();
const MAX_CONCURRENT_JOBS = 3;
const JOB_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

function nowIso() {
  return new Date().toISOString();
}

function makeJobId() {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function serializeJob(job) {
  return {
    id: job.id,
    type: job.type,
    status: job.status,
    meta: job.meta,
    created_at: job.created_at,
    started_at: job.started_at,
    finished_at: job.finished_at,
    logs: job.logs,
    result: job.result,
    error: job.error,
    command: job.command,
    pid: job.pid,
  };
}

function isWithinRoot(targetPath, rootPath) {
  const normalizedTarget = resolve(targetPath);
  const normalizedRoot = resolve(rootPath);
  return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${sep}`);
}

// Exam board roots for serving original past paper PDFs
const EXAM_BOARD_ROOT = resolve(PROJECT_ROOT, '..');
const CIE_ROOT = resolve(EXAM_BOARD_ROOT, 'CIE', 'IGCSE_v2');
const EDX_ROOT = resolve(EXAM_BOARD_ROOT, 'Edexcel', 'IGCSE_v2');
const FIGURES_ROOT = resolve(EXAM_BOARD_ROOT, '25maths-cie0580-figures');
const FIGURES_TRASH_ROOT = resolve(FIGURES_ROOT, '_trash');
const WRITE_ENABLED = String(process.env.LOCAL_AGENT_WRITE_ENABLED || '').trim() === '1';

function isAllowedWriteOrigin(origin) {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    const host = u.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === 'git25math.github.io';
  } catch {
    return false;
  }
}

function ensureWriteAllowed(req, res) {
  if (!WRITE_ENABLED) {
    res.status(403).json({ error: 'Write actions disabled. Start agent with LOCAL_AGENT_WRITE_ENABLED=1' });
    return false;
  }
  const origin = req.headers.origin;
  if (!isAllowedWriteOrigin(origin)) {
    res.status(403).json({ error: 'Origin not allowed for write actions' });
    return false;
  }
  return true;
}

function isAllowedFilePath(targetPath) {
  const allowedRoots = [PROJECT_ROOT, RUNTIME_DIR, getWebsiteRoot(), CIE_ROOT, EDX_ROOT, FIGURES_ROOT];
  // Check resolved path first
  if (!allowedRoots.some(root => isWithinRoot(targetPath, root))) return false;
  // Also check real path (resolve symlinks) to prevent symlink escape
  try {
    const realPath = realpathSync(targetPath);
    return allowedRoots.some(root => isWithinRoot(realPath, root));
  } catch {
    return false; // Can't resolve = can't serve
  }
}

function appendLog(job, message, stream = 'stdout') {
  const line = {
    at: nowIso(),
    stream,
    message: String(message).trimEnd(),
  };

  if (!line.message) return;
  job.logs.push(line);
  if (job.logs.length > 400) {
    job.logs = job.logs.slice(-400);
  }
}

function countRunningJobs() {
  let count = 0;
  for (const job of jobs.values()) {
    if (job.status === 'running' || job.status === 'queued') count++;
  }
  return count;
}

function launchJob({ type, scriptPath, payload, dryRun = false }) {
  if (countRunningJobs() >= MAX_CONCURRENT_JOBS) {
    throw Object.assign(new Error(`Too many concurrent jobs (max ${MAX_CONCURRENT_JOBS}). Wait for running jobs to finish.`), { statusCode: 429 });
  }

  const jobId = makeJobId();
  const payloadPath = resolve(RUNTIME_DIR, `${jobId}.payload.json`);
  const resultPath = resolve(RUNTIME_DIR, `${jobId}.result.json`);

  writeFileSync(payloadPath, JSON.stringify(payload, null, 2));

  const command = [
    process.execPath,
    resolve(PROJECT_ROOT, scriptPath),
    '--payload',
    payloadPath,
    '--result',
    resultPath,
    ...(dryRun ? ['--dry-run'] : []),
  ];

  const job = {
    id: jobId,
    type,
    status: 'queued',
    meta: {
      item_id: payload?.item?.id || '',
      title: payload?.item?.title || '',
      dry_run: Boolean(dryRun),
      options: payload?.options || {},
    },
    created_at: nowIso(),
    started_at: null,
    finished_at: null,
    logs: [],
    result: null,
    error: null,
    command: command.join(' '),
    pid: null,
  };

  jobs.set(jobId, job);

  const child = spawn(command[0], command.slice(1), {
    cwd: PROJECT_ROOT,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  job.status = 'running';
  job.started_at = nowIso();
  job.pid = child.pid ?? null;
  appendLog(job, `Starting deployment job ${jobId}`);
  appendLog(job, `Command: ${job.command}`);

  child.stdout.on('data', chunk => appendLog(job, chunk, 'stdout'));
  child.stderr.on('data', chunk => appendLog(job, chunk, 'stderr'));

  // Kill job if it exceeds timeout
  const jobTimer = setTimeout(() => {
    if (job.status === 'running') {
      appendLog(job, `Job killed: exceeded ${JOB_TIMEOUT_MS / 1000}s timeout`, 'stderr');
      child.kill('SIGTERM');
      setTimeout(() => { if (!child.killed) child.kill('SIGKILL'); }, 5000);
    }
  }, JOB_TIMEOUT_MS);

  child.on('close', code => {
    clearTimeout(jobTimer);
    job.finished_at = nowIso();

    if (code === 0) {
      job.status = 'completed';
      if (existsSync(resultPath)) {
        try {
          job.result = JSON.parse(readFileSync(resultPath, 'utf-8'));
        } catch (error) {
          job.error = 'Job finished but result file could not be parsed.';
        }
      }
      appendLog(job, `Job finished successfully with exit code ${code}`);
      return;
    }

    job.status = 'failed';
    job.error = `Deployment command exited with code ${code}`;
    appendLog(job, job.error, 'stderr');
  });

  child.on('error', error => {
    job.status = 'failed';
    job.finished_at = nowIso();
    job.error = error.message;
    appendLog(job, error.message, 'stderr');
  });

  return job;
}

function launchKahootDeployJob(payload, dryRun) {
  return launchJob({
    type: 'kahoot-upload',
    scriptPath: 'scripts/kahoot/deploy-kahoot-upload.mjs',
    payload,
    dryRun,
  });
}

function launchKahootArtifactsJob(payload) {
  return launchJob({
    type: 'kahoot-artifacts',
    scriptPath: 'scripts/kahoot/export-kahoot-artifacts.mjs',
    payload,
  });
}

function launchKahootSpreadsheetJob(payload) {
  return launchJob({
    type: 'kahoot-spreadsheet',
    scriptPath: 'scripts/kahoot/build-kahoot-spreadsheet.mjs',
    payload,
  });
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: '25maths-local-agent',
    project_root: PROJECT_ROOT,
    runtime_dir: RUNTIME_DIR,
    website_root: getWebsiteRoot(),
    figures_root: FIGURES_ROOT,
    write_enabled: WRITE_ENABLED,
    time: nowIso(),
  });
});

function readPngSize(filePath) {
  // Read only the PNG signature + IHDR header (24 bytes total).
  // https://www.w3.org/TR/PNG/#5PNG-file-signature
  const header = Buffer.alloc(24);
  let fd;
  try {
    fd = openSync(filePath, 'r');
    const n = readSync(fd, header, 0, 24, 0);
    if (n < 24) return null;
  } catch {
    return null;
  } finally {
    try { if (fd) closeSync(fd); } catch { /* ignore */ }
  }

  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < sig.length; i++) {
    if (header[i] !== sig[i]) return null;
  }
  const type = header.slice(12, 16).toString('ascii');
  if (type !== 'IHDR') return null;
  const width = header.readUInt32BE(16);
  const height = header.readUInt32BE(20);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  return { width, height };
}

app.get('/figures/scan', (req, res) => {
  const rawRoot = String(req.query.root || FIGURES_ROOT).trim();
  if (!rawRoot) {
    res.status(400).json({ error: 'Missing root' });
    return;
  }

  const rootPath = resolve(rawRoot);
  if (!isAllowedFilePath(rootPath) || !isWithinRoot(rootPath, FIGURES_ROOT)) {
    res.status(403).json({ error: 'Root is outside allowed figures directory' });
    return;
  }

  let stats;
  try {
    stats = statSync(rootPath);
  } catch {
    res.status(404).json({ error: 'Root not found' });
    return;
  }
  if (!stats.isDirectory()) {
    res.status(400).json({ error: 'Root must be a directory' });
    return;
  }

  const limit = Math.max(1, Math.min(50_000, Number(req.query.limit || 10_000) || 10_000));
  const sessionFilter = String(req.query.session || '').trim();
  const yearFilter = String(req.query.year || '').trim();
  const seasonFilter = String(req.query.season || '').trim();
  const paperFilter = String(req.query.paper || '').trim();
  const questionFilter = String(req.query.question || '').trim();

  const items = [];
  let truncated = false;

  const sessions = readdirSync(rootPath, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name);

  for (const session of sessions) {
    if (sessionFilter && session !== sessionFilter) continue;
    if (yearFilter && session.slice(0, 4) !== yearFilter) continue;
    if (seasonFilter && session.slice(4) !== seasonFilter) continue;

    const sessionPath = resolve(rootPath, session);
    let papers;
    try {
      papers = readdirSync(sessionPath, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'))
        .map(d => d.name);
    } catch {
      continue;
    }

    for (const paper of papers) {
      if (paperFilter && paper !== paperFilter) continue;

      const paperPath = resolve(sessionPath, paper);
      let questions;
      try {
        questions = readdirSync(paperPath, { withFileTypes: true })
          .filter(d => d.isDirectory() && !d.name.startsWith('.'))
          .map(d => d.name);
      } catch {
        continue;
      }

      for (const questionKey of questions) {
        if (questionFilter && questionKey !== questionFilter) continue;

        const questionPath = resolve(paperPath, questionKey);
        let files;
        try {
          files = readdirSync(questionPath, { withFileTypes: true })
            .filter(d => d.isFile())
            .map(d => d.name);
        } catch {
          continue;
        }

        for (const filename of files) {
          if (!filename.toLowerCase().endsWith('.png')) continue;

          const absPath = resolve(questionPath, filename);
          let fileStats;
          try {
            fileStats = statSync(absPath);
          } catch {
            continue;
          }

          const dims = readPngSize(absPath);
          items.push({
            paperKey: `${session}/${paper}`,
            questionKey,
            filename,
            width: dims?.width,
            height: dims?.height,
            size_bytes: fileStats.size,
            mtime_ms: Math.trunc(fileStats.mtimeMs),
          });

          if (items.length >= limit) {
            truncated = true;
            break;
          }
        }

        if (truncated) break;
      }

      if (truncated) break;
    }

    if (truncated) break;
  }

  res.json({
    ok: true,
    root: rootPath,
    count: items.length,
    truncated,
    items,
  });
});

app.post('/figures/trash', (req, res) => {
  if (!ensureWriteAllowed(req, res)) return;

  const rawPath = String(req.body?.path || '').trim();
  if (!rawPath) {
    res.status(400).json({ error: 'Missing path' });
    return;
  }

  const targetPath = resolve(rawPath);
  if (!isAllowedFilePath(targetPath) || !isWithinRoot(targetPath, FIGURES_ROOT)) {
    res.status(403).json({ error: 'Path is outside allowed figures directory' });
    return;
  }

  let realTarget;
  try {
    realTarget = realpathSync(targetPath);
  } catch {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  if (!isWithinRoot(realTarget, FIGURES_ROOT)) {
    res.status(403).json({ error: 'Resolved path is outside figures directory' });
    return;
  }

  let fileStats;
  try {
    fileStats = statSync(realTarget);
  } catch {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  if (!fileStats.isFile()) {
    res.status(400).json({ error: 'Only files can be trashed' });
    return;
  }

  const rel = relative(FIGURES_ROOT, realTarget);
  if (!rel || rel.startsWith('..')) {
    res.status(403).json({ error: 'Invalid target path' });
    return;
  }

  let destPath = resolve(FIGURES_TRASH_ROOT, rel);
  mkdirSync(dirname(destPath), { recursive: true });
  if (existsSync(destPath)) {
    const dot = destPath.lastIndexOf('.');
    if (dot !== -1) {
      destPath = `${destPath.slice(0, dot)}.${Date.now()}${destPath.slice(dot)}`;
    } else {
      destPath = `${destPath}.${Date.now()}`;
    }
  }

  try {
    renameSync(realTarget, destPath);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to trash file' });
    return;
  }

  res.json({ ok: true, from: realTarget, to: destPath });
});

app.get('/files', (req, res) => {
  const rawPath = String(req.query.path || '').trim();
  if (!rawPath) {
    res.status(400).json({ error: 'Missing file path' });
    return;
  }

  const targetPath = resolve(rawPath);
  if (!isAllowedFilePath(targetPath)) {
    res.status(403).json({ error: 'File path is outside allowed roots' });
    return;
  }

  if (!existsSync(targetPath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  let stats;
  try {
    stats = statSync(targetPath);
  } catch {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  if (!stats.isFile()) {
    res.status(400).json({ error: 'Only files can be served' });
    return;
  }

  if (String(req.query.download || '') === '1') {
    res.download(targetPath, basename(targetPath));
    return;
  }

  res.sendFile(targetPath);
});

app.get('/jobs', (_req, res) => {
  const allJobs = [...jobs.values()]
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .map(serializeJob);

  res.json({ jobs: allJobs });
});

app.get('/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json(serializeJob(job));
});

function tryLaunchJob(res, fn) {
  try {
    const job = fn();
    res.status(202).json(serializeJob(job));
  } catch (err) {
    const code = err.statusCode || 500;
    res.status(code).json({ error: err.message });
  }
}

app.post('/jobs/kahoot-upload', (req, res) => {
  const payload = req.body || {};
  if (!payload.item || !payload.item.title) {
    res.status(400).json({ error: 'Missing item payload' });
    return;
  }
  tryLaunchJob(res, () => launchKahootDeployJob(payload, Boolean(payload.dry_run)));
});

app.post('/jobs/kahoot-artifacts', (req, res) => {
  const payload = req.body || {};
  if (!payload.item || !payload.item.title) {
    res.status(400).json({ error: 'Missing item payload' });
    return;
  }
  tryLaunchJob(res, () => launchKahootArtifactsJob(payload));
});

app.post('/jobs/kahoot-spreadsheet', (req, res) => {
  const payload = req.body || {};
  if (!payload.item || !payload.item.title) {
    res.status(400).json({ error: 'Missing item payload' });
    return;
  }
  tryLaunchJob(res, () => launchKahootSpreadsheetJob(payload));
});

// --- Paper Generator ---
app.post('/jobs/paper-generate', (req, res) => {
  const payload = req.body || {};
  if (!payload.id || !payload.texSource) {
    res.status(400).json({ error: 'Missing id or texSource' });
    return;
  }
  tryLaunchJob(res, () => launchJob({
    type: 'paper-generate',
    scriptPath: 'scripts/papers/generate-paper.mjs',
    payload,
  }));
});

// --- Cover Batch ---
app.post('/jobs/cover-batch', (req, res) => {
  const payload = req.body || {};
  if (!payload.topics || !Array.isArray(payload.topics) || !payload.topics.length) {
    res.status(400).json({ error: 'Missing or invalid topics array' });
    return;
  }
  if (!payload.params || !payload.template) {
    res.status(400).json({ error: 'Missing params or template' });
    return;
  }
  tryLaunchJob(res, () => launchJob({
    type: 'cover-batch',
    scriptPath: 'scripts/covers/batch-generate-covers.mjs',
    payload,
  }));
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`25Maths local agent listening on http://127.0.0.1:${PORT}`);
});

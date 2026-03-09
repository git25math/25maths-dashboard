#!/usr/bin/env node
import express from 'express';
import { mkdirSync, existsSync, readFileSync, statSync, writeFileSync, realpathSync } from 'fs';
import { basename, dirname, resolve, sep } from 'path';
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

function isAllowedFilePath(targetPath) {
  const allowedRoots = [PROJECT_ROOT, RUNTIME_DIR, getWebsiteRoot(), CIE_ROOT, EDX_ROOT];
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
    time: nowIso(),
  });
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

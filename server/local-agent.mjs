#!/usr/bin/env node
import express from 'express';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const RUNTIME_DIR = resolve(__dirname, 'runtime');
const PORT = Number(process.env.KAHOOT_AGENT_PORT || 4318);

mkdirSync(RUNTIME_DIR, { recursive: true });

const app = express();
app.use(express.json({ limit: '2mb' }));

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

function launchKahootDeployJob(payload, dryRun) {
  const jobId = makeJobId();
  const payloadPath = resolve(RUNTIME_DIR, `${jobId}.payload.json`);
  const resultPath = resolve(RUNTIME_DIR, `${jobId}.result.json`);

  writeFileSync(payloadPath, JSON.stringify(payload, null, 2));

  const command = [
    process.execPath,
    resolve(PROJECT_ROOT, 'scripts/kahoot/deploy-kahoot-upload.mjs'),
    '--payload',
    payloadPath,
    '--result',
    resultPath,
    ...(dryRun ? ['--dry-run'] : []),
  ];

  const job = {
    id: jobId,
    type: 'kahoot-upload',
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

  child.on('close', code => {
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

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: '25maths-local-agent',
    project_root: PROJECT_ROOT,
    runtime_dir: RUNTIME_DIR,
    website_root: process.env.KAHOOT_WEBSITE_ROOT || resolve(PROJECT_ROOT, '..', '25maths-website'),
    time: nowIso(),
  });
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

app.post('/jobs/kahoot-upload', (req, res) => {
  const payload = req.body || {};
  if (!payload.item || !payload.item.title) {
    res.status(400).json({ error: 'Missing item payload' });
    return;
  }

  const job = launchKahootDeployJob(payload, Boolean(payload.dry_run));
  res.status(202).json(serializeJob(job));
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`25Maths local agent listening on http://127.0.0.1:${PORT}`);
});

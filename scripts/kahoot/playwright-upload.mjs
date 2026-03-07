#!/usr/bin/env node
import { resolve } from 'path';
import {
  ensureDir,
  newestMatchingFile,
  parseArgs,
  readJson,
  resolveWebsiteRoot,
  runCommand,
  writeJson,
} from './pipeline-lib.mjs';

function pickPrimaryEntry(report) {
  if (!Array.isArray(report) || report.length === 0) {
    return null;
  }
  return report[0];
}

export async function runPlaywrightUpload({
  manifestPath,
  websiteRoot,
  logDir,
  headless = false,
  dryRun = false,
  manualFallback = true,
  slowMo = 250,
}) {
  const resolvedWebsiteRoot = resolveWebsiteRoot(websiteRoot);
  const uploaderScript = resolve(resolvedWebsiteRoot, 'scripts/kahoot/auto_upload_from_manifest.py');
  const uploadLogDir = ensureDir(logDir);

  const args = [
    uploaderScript,
    '--manifest',
    resolve(manifestPath),
    '--log-dir',
    uploadLogDir,
    '--slow-mo',
    String(slowMo),
  ];

  if (dryRun) {
    args.push('--dry-run');
  }
  if (headless) {
    args.push('--headless');
  }
  if (!manualFallback) {
    args.push('--no-manual-fallback');
  }

  await runCommand('python3', args, { cwd: resolvedWebsiteRoot });

  if (dryRun) {
    const manifest = readJson(manifestPath);
    const row = Array.isArray(manifest) ? manifest[0] || {} : {};
    return {
      dry_run: true,
      manifest_path: resolve(manifestPath),
      log_dir: uploadLogDir,
      uploaded: false,
      upload_status: 'dry_run',
      creator_url: row.creator_url || '',
      creator_detail_url: row.creator_detail_url || '',
      challenge_url: row.challenge_url || row.payhip_kahoot_link || '',
      needs_manual_challenge_link: !(row.challenge_url || row.payhip_kahoot_link),
    };
  }

  const reportPath = newestMatchingFile(uploadLogDir, path => /upload-report-.*\.json$/i.test(path));
  if (!reportPath) {
    throw new Error(`Upload finished but no upload report was found in ${uploadLogDir}`);
  }

  const report = readJson(reportPath);
  const primary = pickPrimaryEntry(report);
  const manifest = readJson(manifestPath);
  const row = Array.isArray(manifest) ? manifest[0] || {} : {};
  const challengeUrl = row.challenge_url || row.payhip_kahoot_link || '';

  return {
    dry_run: false,
    manifest_path: resolve(manifestPath),
    log_dir: uploadLogDir,
    report_path: reportPath,
    uploaded: primary?.status === 'uploaded',
    upload_status: primary?.status || 'unknown',
    upload_note: primary?.note || '',
    creator_url: row.creator_url || primary?.target_url || '',
    creator_detail_url: row.creator_detail_url || primary?.detail_url || '',
    challenge_url: challengeUrl,
    kahoot_id: primary?.kahoot_id || row.creator_kahoot_id || '',
    needs_manual_challenge_link: !challengeUrl && primary?.status === 'uploaded',
    report,
    primary,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.manifest || !args.result) {
    throw new Error('Usage: node playwright-upload.mjs --manifest <file> --result <file> [--website-root <dir>] [--log-dir <dir>] [--dry-run]');
  }

  const result = await runPlaywrightUpload({
    manifestPath: args.manifest,
    websiteRoot: args['website-root'],
    logDir: args['log-dir'] || resolve(process.cwd(), 'build', 'kahoot-upload-logs'),
    headless: Boolean(args.headless),
    dryRun: Boolean(args['dry-run']),
    manualFallback: !Boolean(args['no-manual-fallback']),
    slowMo: Number(args['slow-mo'] || 250),
  });

  writeJson(args.result, result);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exit(1);
  });
}

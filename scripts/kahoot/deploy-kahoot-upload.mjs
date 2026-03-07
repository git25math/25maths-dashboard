#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { generateKahootArtifacts } from './generate-kahoot-artifacts.mjs';
import {
  ensureDir,
  normalizeBoardKey,
  normalizeTopicCode,
  normalizeTrackKey,
  nowIso,
  parseArgs,
  parseCsv,
  readJson,
  resolveWebsiteRoot,
  runCommand,
  slugify,
  writeJson,
} from './pipeline-lib.mjs';
import { runPlaywrightUpload } from './playwright-upload.mjs';
import { resolveListingPath, resolveWebsiteRecord, syncWebsiteLinks } from './sync-website-links.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DASHBOARD_ROOT = resolve(__dirname, '..', '..');
const WORKING_CSV_PATH = 'payhip/presale/kahoot-subtopic-links-working.csv';

function log(message) {
  process.stdout.write(`${message}\n`);
}

function normalizeDeployOptions(options = {}) {
  return {
    use_ai_fill: options.use_ai_fill !== false,
    sync_website: options.sync_website !== false,
    update_listing: options.update_listing !== false,
    headless: Boolean(options.headless),
    manual_fallback: options.manual_fallback !== false,
    slow_mo: Number(options.slow_mo || 250),
    website_root: options.website_root || '',
  };
}

function loadWebsiteRecords(websiteRoot) {
  const csvPath = resolve(websiteRoot, WORKING_CSV_PATH);
  const { headers, records } = parseCsv(readFileSync(csvPath, 'utf-8'));
  return { headers, records, csvPath };
}

function candidateChallengeUrl(item, websiteRow) {
  const direct = String(item.challenge_url || '').trim();
  if (direct) return direct;
  const rowLink = String(websiteRow?.kahoot_url || '').trim();
  if (rowLink.startsWith('https://kahoot.it/challenge/')) return rowLink;
  return '';
}

function buildTopicDir(runDir, item, websiteRow) {
  const board = normalizeBoardKey(item.board || websiteRow?.board);
  const sectionKey = String(websiteRow?.section_key || `${normalizeTrackKey(item.track)}-dashboard`).trim();
  const topicCode = normalizeTopicCode(item.topic_code || websiteRow?.subtopic_code || 'TOPIC-00');
  const titleSlug = slugify(websiteRow?.title || item.title || topicCode);
  return resolve(runDir, 'workspace', 'projects', 'kahoot-channel', board, 'micro-topics', sectionKey, `${topicCode.toLowerCase()}-${titleSlug}`);
}

async function resolveCreatorMetadata({ websiteRoot, challengeUrl, title, outDir }) {
  if (!challengeUrl) {
    return {
      creator_url: '',
      creator_detail_url: '',
      creator_kahoot_id: '',
    };
  }

  const manifestPath = resolve(outDir, 'resolve-creator-manifest.json');
  const outPath = resolve(outDir, 'resolve-creator-result.json');
  const unresolvedPath = resolve(outDir, 'resolve-creator-unresolved.json');

  writeJson(manifestPath, [{ kahoot_name: title, payhip_kahoot_link: challengeUrl }]);
  await runCommand('python3', [
    resolve(websiteRoot, 'scripts/kahoot/resolve_creator_urls_from_challenge_links.py'),
    '--manifest',
    manifestPath,
    '--out',
    outPath,
    '--unresolved',
    unresolvedPath,
  ], { cwd: websiteRoot });

  if (!existsSync(outPath)) {
    return {
      creator_url: '',
      creator_detail_url: '',
      creator_kahoot_id: '',
    };
  }

  const rows = readJson(outPath);
  const row = Array.isArray(rows) ? rows[0] || {} : {};
  return {
    creator_url: row.creator_url || '',
    creator_detail_url: row.creator_detail_url || '',
    creator_kahoot_id: row.creator_kahoot_id || '',
  };
}

async function resolveCreatorFromLibrary({ websiteRoot, title, outDir, headless = false }) {
  const manifestPath = resolve(outDir, 'library-resolve-manifest.json');
  const outManifestPath = resolve(outDir, 'library-resolve-result.json');
  const indexOutPath = resolve(outDir, 'library-title-index.json');

  writeJson(manifestPath, [{ kahoot_name: title }]);

  await runCommand('python3', [
    resolve(websiteRoot, 'scripts/kahoot/build_creator_manifest_from_library.py'),
    '--manifest',
    manifestPath,
    '--out-manifest',
    outManifestPath,
    '--index-out',
    indexOutPath,
    ...(headless ? ['--headless'] : []),
  ], { cwd: websiteRoot });

  const rows = readJson(outManifestPath);
  const row = Array.isArray(rows) ? rows[0] || {} : {};
  return {
    creator_url: row.creator_url || '',
    creator_detail_url: row.creator_detail_url || '',
    creator_kahoot_id: row.creator_kahoot_id || '',
  };
}

async function ensureKahootSession({ websiteRoot, targetUrl, runDir, options }) {
  const resultPath = resolve(runDir, 'kahoot-session.json');

  await runCommand('python3', [
    resolve(DASHBOARD_ROOT, 'scripts/kahoot/ensure_kahoot_session.py'),
    '--url',
    targetUrl || 'https://create.kahoot.it/',
    '--user-data-dir',
    resolve(websiteRoot, '.cache/kahoot/playwright-profile'),
    '--result',
    resultPath,
    '--timeout-sec',
    '240',
    '--slow-mo',
    String(options.slow_mo || 250),
    ...(options.headless ? ['--headless'] : []),
  ], { cwd: DASHBOARD_ROOT });

  return readJson(resultPath);
}

async function createChallengeLink({ websiteRoot, creatorUrl, detailUrl, title, runDir, options }) {
  const resultPath = resolve(runDir, 'challenge-link-result.json');
  const screenshotPath = resolve(runDir, 'challenge-link.png');

  await runCommand('python3', [
    resolve(DASHBOARD_ROOT, 'scripts/kahoot/create_kahoot_challenge_link.py'),
    '--detail-url',
    detailUrl || '',
    '--creator-url',
    creatorUrl || '',
    '--kahoot-name',
    title || '',
    '--user-data-dir',
    resolve(websiteRoot, '.cache/kahoot/playwright-profile'),
    '--result',
    resultPath,
    '--screenshot',
    screenshotPath,
    '--timeout-sec',
    '240',
    '--slow-mo',
    String(options.slow_mo || 250),
    ...(options.headless ? ['--headless'] : []),
    ...(!options.manual_fallback ? ['--no-manual-fallback'] : []),
  ], { cwd: DASHBOARD_ROOT });

  const result = readJson(resultPath);
  return {
    ...result,
    screenshot_path: screenshotPath,
  };
}

async function buildImportManifest({ websiteRoot, questionSetPath, outDir, item, challengeUrl, creatorMeta }) {
  const buildDir = ensureDir(resolve(outDir, 'build'));
  const manifestPath = resolve(buildDir, 'manifest.json');

  await runCommand('python3', [
    resolve(websiteRoot, 'scripts/kahoot/build_import_xlsx_from_markdown.py'),
    '--input',
    questionSetPath,
    '--out-dir',
    buildDir,
    '--manifest',
    manifestPath,
    '--payhip-listing-root',
    resolve(websiteRoot, 'payhip/presale/listing-assets/l1'),
    '--truncate-long-text',
  ], { cwd: websiteRoot });

  const rows = readJson(manifestPath);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Kahoot build manifest is empty');
  }

  const row = {
    ...rows[0],
    kahoot_name: item.title || rows[0].kahoot_name,
    kahoot_description_en: item.description || rows[0].kahoot_description_en,
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : rows[0].tags,
    payhip_kahoot_link: challengeUrl || rows[0].payhip_kahoot_link || '',
    challenge_url: challengeUrl || rows[0].payhip_kahoot_link || '',
    creator_url: creatorMeta.creator_url || item.creator_url || rows[0].creator_url || '',
    creator_detail_url: creatorMeta.creator_detail_url || rows[0].creator_detail_url || '',
    creator_kahoot_id: creatorMeta.creator_kahoot_id || rows[0].creator_kahoot_id || '',
  };

  const uploadManifestPath = resolve(buildDir, 'upload-manifest.json');
  writeJson(uploadManifestPath, [row]);

  return {
    row,
    manifest_path: uploadManifestPath,
    xlsx_path: row.output_xlsx,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.payload || !args.result) {
    throw new Error('Usage: node deploy-kahoot-upload.mjs --payload <file> --result <file> [--dry-run]');
  }

  const payloadPath = resolve(args.payload);
  const resultPath = resolve(args.result);
  const payload = readJson(payloadPath);
  const item = payload.item;
  if (!item || !item.id) {
    throw new Error('Missing item payload');
  }

  const options = normalizeDeployOptions(payload.options || {});
  const dryRun = Boolean(args['dry-run']) || Boolean(payload.dry_run);
  const runId = `${Date.now()}-${slugify(item.id || item.title || 'kahoot')}`;
  const runDir = ensureDir(resolve(__dirname, '..', 'output', 'kahoot-deploy', runId));
  const websiteRoot = resolveWebsiteRoot(options.website_root);
  const startedAt = nowIso();

  writeJson(resolve(runDir, 'payload.json'), payload);
  log(`Preparing Kahoot deployment for ${item.title}`);
  log(`Run directory: ${runDir}`);
  log(`Website repo: ${websiteRoot}`);

  const { records } = loadWebsiteRecords(websiteRoot);
  const websiteResolution = resolveWebsiteRecord(records, item);
  const websiteRow = websiteResolution.row;
  if (websiteRow) {
    log(`Website row resolved via ${websiteResolution.resolution}: ${websiteRow.id}`);
  } else {
    log(`Website row not resolved (${websiteResolution.resolution}); deploy will continue without website metadata.`);
  }

  const topicDir = buildTopicDir(runDir, item, websiteRow);
  ensureDir(topicDir);

  const artifacts = await generateKahootArtifacts({
    item,
    outDir: topicDir,
    useAiFill: options.use_ai_fill,
  });
  log(`Artifacts written: ${topicDir}`);

  const listingResolution = resolveListingPath(websiteRoot, artifacts.item, websiteRow);
  const currentChallengeUrl = candidateChallengeUrl(artifacts.item, websiteRow);
  const creatorMeta = artifacts.item.creator_url
    ? {
        creator_url: artifacts.item.creator_url,
        creator_detail_url: '',
        creator_kahoot_id: '',
      }
    : await resolveCreatorMetadata({
        websiteRoot,
        challengeUrl: currentChallengeUrl,
        title: artifacts.item.title,
        outDir: runDir,
      });

  if (creatorMeta.creator_url) {
    log(`Creator URL resolved: ${creatorMeta.creator_url}`);
  }

  const buildResult = await buildImportManifest({
    websiteRoot,
    questionSetPath: artifacts.files.question_set_path,
    outDir: runDir,
    item: artifacts.item,
    challengeUrl: currentChallengeUrl,
    creatorMeta,
  });
  log(`Import XLSX built: ${buildResult.xlsx_path}`);

  let sessionResult = null;
  if (!dryRun) {
    sessionResult = await ensureKahootSession({
      websiteRoot,
      targetUrl: creatorMeta.creator_detail_url || creatorMeta.creator_url || 'https://create.kahoot.it/',
      runDir,
      options,
    });
    log(`Kahoot session ready: ${sessionResult.logged_in === true ? 'yes' : 'no'}`);
  }

  const uploadResult = await runPlaywrightUpload({
    manifestPath: buildResult.manifest_path,
    websiteRoot,
    logDir: resolve(runDir, 'upload-logs'),
    headless: options.headless,
    dryRun,
    manualFallback: options.manual_fallback,
    slowMo: options.slow_mo,
  });

  let finalCreatorUrl = uploadResult.creator_url || creatorMeta.creator_url || artifacts.item.creator_url || '';
  let finalDetailUrl = uploadResult.creator_detail_url || creatorMeta.creator_detail_url || '';
  let finalChallengeUrl = uploadResult.challenge_url || currentChallengeUrl || '';

  let libraryCreatorMeta = null;
  if (!dryRun && !finalDetailUrl) {
    try {
      libraryCreatorMeta = await resolveCreatorFromLibrary({
        websiteRoot,
        title: artifacts.item.title,
        outDir: runDir,
        headless: options.headless,
      });
      finalCreatorUrl = finalCreatorUrl || libraryCreatorMeta.creator_url || '';
      finalDetailUrl = finalDetailUrl || libraryCreatorMeta.creator_detail_url || '';
      if (finalDetailUrl) {
        log(`Creator details URL resolved from library: ${finalDetailUrl}`);
      }
    } catch (error) {
      log(`Creator library resolve skipped: ${error.message}`);
    }
  }

  let challengeCreateResult = null;
  if (!dryRun && uploadResult.uploaded && !finalChallengeUrl) {
    challengeCreateResult = await createChallengeLink({
      websiteRoot,
      creatorUrl: finalCreatorUrl,
      detailUrl: finalDetailUrl,
      title: artifacts.item.title,
      runDir,
      options,
    });

    if (typeof challengeCreateResult.challenge_url === 'string' && challengeCreateResult.challenge_url) {
      finalChallengeUrl = challengeCreateResult.challenge_url;
      log(`Challenge URL created: ${finalChallengeUrl}`);
    }
  }

  const syncResult = options.sync_website
    ? await syncWebsiteLinks({
        item: {
          ...artifacts.item,
          creator_url: finalCreatorUrl,
          challenge_url: finalChallengeUrl,
        },
        websiteRoot,
        challengeUrl: finalChallengeUrl,
        creatorUrl: finalCreatorUrl,
        dryRun,
        updateListing: options.update_listing,
      })
    : {
        synced: false,
        skipped: true,
        reason: 'sync_disabled',
        updated_listing: false,
        updated_csv: false,
        updated_json: false,
        website_link_id: sanitizeString(item.website_link_id),
      };

  const nextItem = {
    ...artifacts.item,
    creator_url: finalCreatorUrl || undefined,
    challenge_url: finalChallengeUrl || undefined,
    review_notes: [
      artifacts.item.review_notes || '',
      challengeCreateResult?.message || '',
    ].filter(Boolean).join('\n\n'),
    listing_path: listingResolution.path || item.listing_path,
    website_link_id: syncResult.website_link_id || item.website_link_id,
    upload_status: !dryRun && uploadResult.uploaded ? 'uploaded' : artifacts.item.upload_status,
    uploaded_at: !dryRun && uploadResult.uploaded ? nowIso() : artifacts.item.uploaded_at,
    updated_at: nowIso(),
  };

  const result = {
    run_id: runId,
    item_id: item.id,
    title: nextItem.title,
    dry_run: dryRun,
    started_at: startedAt,
    finished_at: nowIso(),
    website_root: websiteRoot,
    options,
    item: nextItem,
    artifact_dir: topicDir,
    xlsx_path: buildResult.xlsx_path,
    build_manifest_path: buildResult.manifest_path,
    creator_url: finalCreatorUrl,
    creator_detail_url: finalDetailUrl,
    challenge_url: finalChallengeUrl,
    website_link_id: syncResult.website_link_id || item.website_link_id || '',
    session: sessionResult,
    upload: uploadResult,
    challenge_create: challengeCreateResult,
    sync: syncResult,
    artifacts: artifacts.files,
    notes: [
      uploadResult.needs_manual_challenge_link ? 'Upload completed but no challenge URL is available yet. Create/share the challenge once, then rerun sync.' : '',
      syncResult.reason === 'challenge_url_missing' ? 'Website sync skipped because no challenge URL was available.' : '',
      artifacts.ai_reason || '',
    ].filter(Boolean),
  };

  writeJson(resolve(runDir, 'pipeline-result.json'), result);
  writeJson(resultPath, result);
  log('Pipeline finished.');
}

function sanitizeString(value) {
  return String(value || '').trim();
}

main().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});

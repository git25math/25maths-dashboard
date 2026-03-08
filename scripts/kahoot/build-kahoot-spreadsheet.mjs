#!/usr/bin/env node
import { resolve } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateKahootArtifacts } from './generate-kahoot-artifacts.mjs';
import {
  ensureDir,
  nowIso,
  parseArgs,
  readJson,
  resolveWebsiteRoot,
  runCommand,
  slugify,
  writeJson,
} from './pipeline-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function normalizeOptions(options = {}) {
  return {
    use_ai_fill: options.use_ai_fill === true,
    website_root: options.website_root || '',
  };
}

async function buildSpreadsheet({ websiteRoot, questionSetPath, outDir, item }) {
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
    challenge_url: item.challenge_url || rows[0].challenge_url || rows[0].payhip_kahoot_link || '',
    creator_url: item.creator_url || rows[0].creator_url || '',
  };

  const uploadManifestPath = resolve(buildDir, 'upload-manifest.json');
  writeJson(uploadManifestPath, [row]);

  return {
    row,
    manifest_path: manifestPath,
    upload_manifest_path: uploadManifestPath,
    xlsx_path: row.output_xlsx,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.payload || !args.result) {
    throw new Error('Usage: node build-kahoot-spreadsheet.mjs --payload <file> --result <file>');
  }

  const payloadPath = resolve(args.payload);
  const resultPath = resolve(args.result);
  const payload = readJson(payloadPath);
  const item = payload.item;
  if (!item || !item.id) {
    throw new Error('Missing item payload');
  }

  const options = normalizeOptions(payload.options || {});
  const websiteRoot = resolveWebsiteRoot(options.website_root);
  const runId = `${Date.now()}-${slugify(item.id || item.title || 'kahoot-spreadsheet')}`;
  const runDir = ensureDir(resolve(__dirname, '..', 'output', 'kahoot-spreadsheet', runId));
  const topicDir = ensureDir(resolve(runDir, 'workspace', slugify(item.board), slugify(item.topic_code)));

  writeJson(resolve(runDir, 'payload.json'), payload);

  const artifacts = await generateKahootArtifacts({
    item,
    outDir: topicDir,
    useAiFill: options.use_ai_fill,
  });
  const spreadsheet = await buildSpreadsheet({
    websiteRoot,
    questionSetPath: artifacts.files.question_set_path,
    outDir: topicDir,
    item: artifacts.item,
  });

  const result = {
    job_type: 'kahoot-spreadsheet',
    exported_at: nowIso(),
    website_root: websiteRoot,
    item: artifacts.item,
    artifact_dir: topicDir,
    question_set_path: artifacts.files.question_set_path,
    listing_copy_path: artifacts.files.listing_copy_path,
    cover_prompt_path: artifacts.files.cover_prompt_path,
    cover_svg_path: artifacts.files.cover_svg_path,
    metadata_prompt_path: artifacts.files.prompt_path,
    builder_manifest_path: spreadsheet.manifest_path,
    upload_manifest_path: spreadsheet.upload_manifest_path,
    xlsx_path: spreadsheet.xlsx_path,
    open_creator_url: 'https://create.kahoot.it/',
  };

  writeJson(resultPath, result);
}

main().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});

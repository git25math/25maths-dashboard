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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.payload || !args.result) {
    throw new Error('Usage: node export-kahoot-artifacts.mjs --payload <file> --result <file>');
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
  const runId = `${Date.now()}-${slugify(item.id || item.title || 'kahoot-artifacts')}`;
  const runDir = ensureDir(resolve(__dirname, '..', 'output', 'kahoot-artifacts', runId));
  const topicDir = ensureDir(resolve(runDir, 'workspace', slugify(item.board), slugify(item.topic_code)));

  writeJson(resolve(runDir, 'payload.json'), payload);

  const artifacts = await generateKahootArtifacts({
    item,
    outDir: topicDir,
    useAiFill: options.use_ai_fill,
  });

  const result = {
    job_type: 'kahoot-artifacts',
    exported_at: nowIso(),
    website_root: websiteRoot,
    item: artifacts.item,
    artifact_dir: topicDir,
    question_set_path: artifacts.files.question_set_path,
    listing_copy_path: artifacts.files.listing_copy_path,
    cover_prompt_path: artifacts.files.cover_prompt_path,
    cover_svg_path: artifacts.files.cover_svg_path,
    metadata_prompt_path: artifacts.files.prompt_path,
    open_creator_url: 'https://create.kahoot.it/',
  };

  writeJson(resultPath, result);
}

main().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});

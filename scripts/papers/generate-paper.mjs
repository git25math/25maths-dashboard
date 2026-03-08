#!/usr/bin/env node
/**
 * generate-paper.mjs
 * Reads --payload JSON, writes .tex file, runs xelatex twice, outputs --result JSON.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--payload') result.payloadPath = args[++i];
    if (args[i] === '--result') result.resultPath = args[++i];
  }
  return result;
}

async function main() {
  const { payloadPath, resultPath } = parseArgs();
  if (!payloadPath || !resultPath) {
    console.error('Usage: generate-paper.mjs --payload <path> --result <path>');
    process.exit(1);
  }

  const payload = JSON.parse(readFileSync(payloadPath, 'utf-8'));
  const { id, texSource } = payload;

  if (!texSource) {
    writeFileSync(resultPath, JSON.stringify({ success: false, error: 'No texSource provided' }));
    process.exit(1);
  }

  // Create output directory
  const outDir = resolve(__dirname, '../../server/runtime', `paper-${id || 'unknown'}`);
  mkdirSync(outDir, { recursive: true });

  const texPath = resolve(outDir, 'paper.tex');
  writeFileSync(texPath, texSource);
  console.log(`Wrote .tex to ${texPath}`);

  // Determine TEXINPUTS based on board (CIE vs Edexcel IGCSE)
  const NZH_ROOT = process.env.NZH_ROOT || resolve(PROJECT_ROOT, '../../NZH-MathPrep-Template');
  // CIE 0580 styles live under CIE/IGCSE_v2/CommonAssets/
  const CIE_ASSETS = resolve(PROJECT_ROOT, '../../CIE/IGCSE_v2/CommonAssets');
  // Edexcel IGCSE styles live under Edexcel/IGCSE_v2/CommonAssets/
  const EDX_ASSETS = resolve(PROJECT_ROOT, '../../Edexcel/IGCSE_v2/CommonAssets');

  const isCIE = texSource.includes('CIE-0580-Master-Style');
  const assetsRoot = isCIE ? CIE_ASSETS : EDX_ASSETS;

  const texinputs = `.:${assetsRoot}//:${NZH_ROOT}//:`;

  console.log(`TEXINPUTS=${texinputs}`);
  console.log('Running xelatex (pass 1)...');

  const xelatexCmd = `TEXINPUTS="${texinputs}" xelatex -interaction=nonstopmode -output-directory="${outDir}" "${texPath}"`;

  try {
    execSync(xelatexCmd, { cwd: outDir, stdio: 'pipe', timeout: 60000 });
    console.log('Pass 1 complete.');
  } catch (err) {
    console.error('Pass 1 had warnings/errors (continuing):', err.stderr?.toString().slice(-500));
  }

  // Second pass for page references
  console.log('Running xelatex (pass 2)...');
  try {
    execSync(xelatexCmd, { cwd: outDir, stdio: 'pipe', timeout: 60000 });
    console.log('Pass 2 complete.');
  } catch (err) {
    console.error('Pass 2 had warnings/errors:', err.stderr?.toString().slice(-500));
  }

  const pdfPath = resolve(outDir, 'paper.pdf');
  const logPath = resolve(outDir, 'paper.log');
  const success = existsSync(pdfPath);

  // Count pages from log
  let pages = 0;
  if (existsSync(logPath)) {
    const log = readFileSync(logPath, 'utf-8');
    const match = log.match(/Output written on .+ \((\d+) page/);
    if (match) pages = parseInt(match[1], 10);
  }

  const result = {
    success,
    pdf_path: success ? pdfPath : null,
    log_path: existsSync(logPath) ? logPath : null,
    pages,
  };

  writeFileSync(resultPath, JSON.stringify(result, null, 2));
  console.log(`Result: ${JSON.stringify(result)}`);

  if (!success) {
    console.error('PDF was not generated.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

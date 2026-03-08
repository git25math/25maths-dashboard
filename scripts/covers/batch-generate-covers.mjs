#!/usr/bin/env node
/**
 * batch-generate-covers.mjs
 * Generates multiple SVG cover files from a template + topic list.
 * Reads --payload JSON, writes SVGs to output dir, outputs --result JSON.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--payload') result.payloadPath = args[++i];
    if (args[i] === '--result') result.resultPath = args[++i];
  }
  return result;
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSvg(width, height, params) {
  const p = params;
  const cx = width / 2;
  const titleY = height * 0.38;
  const brandY = height * 0.22;
  const formulaY = height * 0.75;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${xmlEscape(p.primaryGradientStart)}" />
      <stop offset="100%" stop-color="${xmlEscape(p.primaryGradientEnd)}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="20" />
  <rect x="12" y="12" width="${width - 24}" height="${height - 24}" fill="none" stroke="${xmlEscape(p.accentColor)}" stroke-width="2" rx="14" opacity="0.4" />`;

  if (p.showDecoCircles) {
    const r = Math.min(width, height) * 0.12;
    svg += `
  <circle cx="${width * 0.82}" cy="${height * 0.18}" r="${r}" fill="${xmlEscape(p.accentColor)}" opacity="0.25" />
  <circle cx="${width * 0.15}" cy="${height * 0.78}" r="${r * 0.8}" fill="${xmlEscape(p.textColor)}" opacity="0.1" />`;
  }

  if (p.showWavyShape) {
    svg += `
  <path d="M0,${height * 0.6} C${width * 0.3},${height * 0.55} ${width * 0.7},${height * 0.65} ${width},${height * 0.6} L${width},${height} L0,${height} Z" fill="${xmlEscape(p.textColor)}" opacity="0.04" />`;
  }

  svg += `
  <text x="${cx}" y="${brandY}" text-anchor="middle" fill="${xmlEscape(p.accentColor)}" font-size="${Math.max(14, width * 0.012)}" font-family="Avenir Next, sans-serif" font-weight="700" letter-spacing="6">${xmlEscape(p.titleEn)}</text>`;

  if (p.badgeText) {
    svg += `
  <rect x="${cx - 60}" y="${height * 0.15 - 14}" width="120" height="28" rx="14" fill="${xmlEscape(p.accentColor)}" opacity="0.9" />
  <text x="${cx}" y="${height * 0.15 + 3}" text-anchor="middle" fill="white" font-size="12" font-family="Avenir Next, sans-serif" font-weight="700" letter-spacing="2">${xmlEscape(p.badgeText)}</text>`;
  }

  svg += `
  <text x="${cx}" y="${titleY}" text-anchor="middle" fill="${xmlEscape(p.textColor)}" font-size="${Math.max(28, width * 0.035)}" font-family="Georgia, serif" font-weight="700">${xmlEscape(p.subtitle)}</text>`;

  if (p.showMathFormula && p.mathFormula) {
    svg += `
  <text x="${cx}" y="${formulaY}" text-anchor="middle" fill="${xmlEscape(p.textColor)}" font-size="${Math.max(16, width * 0.018)}" font-family="Georgia, serif" font-style="italic" opacity="0.2">${xmlEscape(p.mathFormula)}</text>`;
  }

  svg += `
  <text x="${width - 30}" y="${height - 20}" text-anchor="end" fill="${xmlEscape(p.textColor)}" font-size="10" font-family="Avenir Next, sans-serif" font-weight="600" opacity="0.3">25MATHS</text>
</svg>`;

  return svg;
}

async function main() {
  const { payloadPath, resultPath } = parseArgs();
  if (!payloadPath || !resultPath) {
    console.error('Usage: batch-generate-covers.mjs --payload <path> --result <path>');
    process.exit(1);
  }

  const payload = JSON.parse(readFileSync(payloadPath, 'utf-8'));
  const { topics, params, template } = payload;

  // Template dimensions
  const templateSizes = {
    kahoot: { w: 1600, h: 900 },
    worksheet: { w: 2320, h: 1520 },
    exam: { w: 595, h: 842 },
    vocab: { w: 800, h: 600 },
  };

  const size = templateSizes[template] || templateSizes.kahoot;

  const outDir = resolve(__dirname, '../../server/runtime', `covers-${Date.now()}`);
  mkdirSync(outDir, { recursive: true });

  const files = [];
  for (const topic of topics) {
    const coverParams = { ...params, subtitle: topic };
    const svg = buildSvg(size.w, size.h, coverParams);
    const filename = `cover-${topic.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}.svg`;
    const filePath = resolve(outDir, filename);
    writeFileSync(filePath, svg);
    files.push(filePath);
    console.log(`Generated: ${filename}`);
  }

  const result = {
    success: true,
    output_dir: outDir,
    files,
    count: files.length,
  };

  writeFileSync(resultPath, JSON.stringify(result, null, 2));
  console.log(`Batch complete: ${files.length} covers generated`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

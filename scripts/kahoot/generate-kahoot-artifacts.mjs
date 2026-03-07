#!/usr/bin/env node
import { GoogleGenAI } from '@google/genai';
import {
  ensureDir,
  normalizeBoardKey,
  normalizeTopicCodeDot,
  normalizeTrackKey,
  nowIso,
  parseArgs,
  questionHasGaps,
  readJson,
  sanitizeInlineText,
  slugify,
  stripJsonFences,
  writeJson,
  writeText,
  xmlEscape,
} from './pipeline-lib.mjs';

const TIME_LIMITS = [5, 10, 20, 30, 60, 90, 120];

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

function normalizeTimeLimit(value) {
  const number = Number(value);
  if (TIME_LIMITS.includes(number)) {
    return number;
  }
  const fallback = TIME_LIMITS.find(limit => limit >= number);
  return fallback || 20;
}

function normalizeCorrectOption(value) {
  const normalized = String(value || 'A').trim().toUpperCase();
  return ['A', 'B', 'C', 'D'].includes(normalized) ? normalized : 'A';
}

function normalizeTagList(value) {
  if (Array.isArray(value)) {
    return value.map(tag => sanitizeInlineText(tag)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,#|\n]/)
      .map(tag => sanitizeInlineText(tag).replace(/^#/, ''))
      .filter(Boolean);
  }
  return [];
}

function normalizeQuestion(question, index) {
  return {
    id: sanitizeInlineText(question.id) || `question-${index + 1}`,
    prompt: sanitizeInlineText(question.prompt || question.question || `Question ${index + 1}`),
    option_a: sanitizeInlineText(question.option_a || question.optionA),
    option_b: sanitizeInlineText(question.option_b || question.optionB),
    option_c: sanitizeInlineText(question.option_c || question.optionC),
    option_d: sanitizeInlineText(question.option_d || question.optionD),
    correct_option: normalizeCorrectOption(question.correct_option || question.correctOption || question.answer),
    time_limit: normalizeTimeLimit(question.time_limit || question.timeLimit || 20),
  };
}

function questionsNeedAi(item) {
  return !Array.isArray(item.questions)
    || item.questions.length === 0
    || item.questions.some(question => questionHasGaps(question));
}

function metadataNeedsAi(item) {
  return !String(item.title || '').trim()
    || !String(item.description || '').trim()
    || !Array.isArray(item.tags)
    || item.tags.length === 0;
}

function buildMetadataPrompt(item) {
  const track = normalizeTrackKey(item.track);
  const board = normalizeBoardKey(item.board);
  const topicCode = normalizeTopicCodeDot(item.topic_code);
  const existingQuestions = Array.isArray(item.questions) && item.questions.length > 0
    ? item.questions.map((question, index) => [
      `${index + 1}. ${question.prompt || '[missing prompt]'}`,
      `A. ${question.option_a || '[missing]'}`,
      `B. ${question.option_b || '[missing]'}`,
      `C. ${question.option_c || '[missing]'}`,
      `D. ${question.option_d || '[missing]'}`,
      `Correct: ${question.correct_option || 'A'} | Time: ${question.time_limit || 20}`,
    ].join('\n')).join('\n\n')
    : 'No usable questions provided.';

  return [
    'You are preparing a production-ready Kahoot pack for 25Maths.',
    'Return valid JSON only, no markdown fences.',
    '',
    'Required JSON shape:',
    '{',
    '  "title": "...",',
    '  "description": "2-4 sentence learner-facing summary",',
    '  "tags": ["tag1", "tag2", "tag3"],',
    '  "cover_prompt": "image direction for a clean educational cover",',
    '  "questions": [',
    '    {',
    '      "prompt": "...",',
    '      "option_a": "...",',
    '      "option_b": "...",',
    '      "option_c": "...",',
    '      "option_d": "...",',
    '      "correct_option": "A",',
    '      "time_limit": 20',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- Produce 12-15 multiple-choice questions unless the supplied set is already complete and coherent.',
    '- Keep question text concise enough for Kahoot spreadsheet import.',
    '- Every question must have exactly four options and one correct option.',
    '- Use only these time limits: 5, 10, 20, 30, 60, 90, 120.',
    '- Make the wording syllabus-aligned, exam-style, and free of filler.',
    '- Tags should be plain strings without leading #.',
    '- Preserve the existing title if it is already strong and specific.',
    '',
    'Current item context:',
    `Board: ${board}`,
    `Track: ${track}`,
    `Topic code: ${topicCode}`,
    `Existing title: ${item.title || ''}`,
    `Existing description: ${item.description || ''}`,
    `Existing tags: ${(item.tags || []).join(', ')}`,
    `Review notes: ${item.review_notes || ''}`,
    `Page URL: ${item.page_url || ''}`,
    '',
    'Current questions:',
    existingQuestions,
  ].join('\n');
}

async function generateAiDraft(item) {
  const client = getAiClient();
  if (!client) {
    return {
      ai_used: false,
      ai_reason: 'Gemini API key is not configured',
      draft: null,
      raw: '',
    };
  }

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: buildMetadataPrompt(item) }] }],
  });

  const raw = response.text || '';
  const parsed = JSON.parse(stripJsonFences(raw));
  return {
    ai_used: true,
    ai_reason: '',
    draft: parsed,
    raw,
  };
}

function mergeItemWithAi(item, aiDraft, useAiFill) {
  const next = {
    ...item,
    board: normalizeBoardKey(item.board),
    track: normalizeTrackKey(item.track),
    topic_code: normalizeTopicCodeDot(item.topic_code),
    title: sanitizeInlineText(item.title),
    description: sanitizeInlineText(item.description),
    tags: normalizeTagList(item.tags),
    questions: Array.isArray(item.questions) ? item.questions.map(normalizeQuestion) : [],
  };

  if (!useAiFill || !aiDraft?.draft) {
    return {
      item: next,
      coverPrompt: '',
    };
  }

  const draft = aiDraft.draft;
  if (!next.title && draft.title) {
    next.title = sanitizeInlineText(draft.title);
  }
  if (!next.description && draft.description) {
    next.description = sanitizeInlineText(draft.description);
  }
  if (next.tags.length === 0 && draft.tags) {
    next.tags = normalizeTagList(draft.tags);
  }
  if (questionsNeedAi(next) && Array.isArray(draft.questions) && draft.questions.length > 0) {
    next.questions = draft.questions.map(normalizeQuestion);
  }

  return {
    item: next,
    coverPrompt: sanitizeInlineText(draft.cover_prompt || ''),
  };
}

function buildListingCopyMarkdown(item) {
  return [
    '# Listing Copy',
    '',
    '## Kahoot Name',
    item.title || `${item.board.toUpperCase()} ${item.topic_code}`,
    '',
    '## Kahoot Description (EN)',
    item.description || 'Add a short learner-facing Kahoot description.',
    '',
    '## Tags',
    item.tags.join(', '),
    '',
  ].join('\n');
}

function buildQuestionSetMarkdown(item) {
  const lines = [
    `# ${item.title || `${item.board.toUpperCase()} ${item.topic_code}`}`,
    '',
    '| # | Question | A | B | C | D | Correct | Type |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  item.questions.forEach((question, index) => {
    const escapeCell = value => String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    lines.push(`| ${String(index + 1)} | ${escapeCell(question.prompt)} | ${escapeCell(question.option_a)} | ${escapeCell(question.option_b)} | ${escapeCell(question.option_c)} | ${escapeCell(question.option_d)} | ${normalizeCorrectOption(question.correct_option)} | quiz |`);
  });

  lines.push('', '## Timer');
  item.questions.forEach((question, index) => {
    lines.push(`- Q${index + 1}: ${normalizeTimeLimit(question.time_limit)}s`);
  });
  lines.push('');

  return lines.join('\n');
}

function buildCoverSvg(item, coverPrompt) {
  const title = xmlEscape(item.title || `${item.board.toUpperCase()} ${item.topic_code}`);
  const subtitle = xmlEscape(`${item.topic_code} · ${normalizeTrackKey(item.track).toUpperCase()} TRACK`);
  const prompt = xmlEscape((coverPrompt || item.description || 'Kahoot cover prompt').slice(0, 180));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="#F8F4E8"/>
  <rect x="68" y="68" width="1464" height="764" rx="40" fill="url(#surface)"/>
  <rect x="108" y="108" width="1384" height="684" rx="28" fill="#123B3A" opacity="0.11"/>
  <circle cx="1360" cy="180" r="160" fill="#DFA95B" opacity="0.45"/>
  <circle cx="250" cy="780" r="220" fill="#2D6A6A" opacity="0.28"/>
  <path d="M1240 120C1370 190 1460 320 1460 450C1460 630 1310 770 1110 770H460C690 720 910 600 1020 450C1090 355 1160 240 1240 120Z" fill="#F3E8D1" opacity="0.88"/>
  <text x="150" y="210" fill="#7A5C34" font-size="36" font-family="Georgia, Times New Roman, serif" font-weight="700" letter-spacing="6">25MATHS KAHOOT</text>
  <text x="150" y="360" fill="#133736" font-size="84" font-family="Georgia, Times New Roman, serif" font-weight="700">${title}</text>
  <text x="150" y="430" fill="#5A5F5E" font-size="34" font-family="Avenir Next, Helvetica, Arial, sans-serif" font-weight="600">${subtitle}</text>
  <foreignObject x="150" y="500" width="920" height="180">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Avenir Next, Helvetica, Arial, sans-serif; font-size: 28px; line-height: 1.45; color: #204544;">
      ${prompt}
    </div>
  </foreignObject>
  <defs>
    <linearGradient id="surface" x1="68" y1="68" x2="1532" y2="832" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F2E2BF"/>
      <stop offset="0.55" stop-color="#FFF9EC"/>
      <stop offset="1" stop-color="#D8E8DB"/>
    </linearGradient>
  </defs>
</svg>\n`;
}

export async function generateKahootArtifacts({ item, outDir, useAiFill = true }) {
  const startedAt = nowIso();
  ensureDir(outDir);

  const aiRequested = useAiFill && (metadataNeedsAi(item) || questionsNeedAi(item));
  const aiDraft = aiRequested ? await generateAiDraft(item) : { ai_used: false, ai_reason: 'AI fill not required', draft: null, raw: '' };
  const merged = mergeItemWithAi(item, aiDraft, useAiFill);
  const nextItem = {
    ...item,
    ...merged.item,
    updated_at: nowIso(),
    ai_generated_at: item.ai_generated_at || startedAt,
  };
  const coverPrompt = merged.coverPrompt || `${nextItem.title}. Clean educational illustration for ${nextItem.board} ${nextItem.track} maths revision.`;

  const promptPath = writeText(`${outDir}/metadata-prompt.md`, `${buildMetadataPrompt(item)}\n`);
  const coverPromptPath = writeText(`${outDir}/cover-prompt.txt`, `${coverPrompt}\n`);
  const listingCopyPath = writeText(`${outDir}/listing-copy.md`, `${buildListingCopyMarkdown(nextItem)}\n`);
  const questionSetPath = writeText(`${outDir}/kahoot-question-set.md`, buildQuestionSetMarkdown(nextItem));
  const coverSvgPath = writeText(`${outDir}/cover-preview.svg`, buildCoverSvg(nextItem, coverPrompt));

  const result = {
    generated_at: nowIso(),
    ai_requested: aiRequested,
    ai_used: aiDraft.ai_used,
    ai_reason: aiDraft.ai_reason,
    item: nextItem,
    files: {
      prompt_path: promptPath,
      cover_prompt_path: coverPromptPath,
      listing_copy_path: listingCopyPath,
      question_set_path: questionSetPath,
      cover_svg_path: coverSvgPath,
    },
  };

  writeJson(`${outDir}/artifact-manifest.json`, result);
  if (aiDraft.raw) {
    writeText(`${outDir}/ai-response.json`, `${stripJsonFences(aiDraft.raw)}\n`);
  }

  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.payload || !args['out-dir'] || !args.result) {
    throw new Error('Usage: node generate-kahoot-artifacts.mjs --payload <file> --out-dir <dir> --result <file>');
  }

  const payload = readJson(args.payload);
  const result = await generateKahootArtifacts({
    item: payload.item,
    outDir: args['out-dir'],
    useAiFill: args['use-ai-fill'] !== 'false',
  });

  writeJson(args.result, result);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exit(1);
  });
}

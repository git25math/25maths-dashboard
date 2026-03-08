import { useState, useCallback, useMemo } from 'react';
import { X, Loader2, Download } from 'lucide-react';
import type { CoverParams, CoverTemplate } from './types';

interface CoverBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseParams: CoverParams;
  template: CoverTemplate;
}

export function CoverBatchModal({ isOpen, onClose, baseParams, template }: CoverBatchModalProps) {
  const [topics, setTopics] = useState('Algebra\nFunctions\nNumber\nGeometry\nStatistics');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<{ topic: string; svg: string }[]>([]);

  const topicList = useMemo(
    () => topics.split('\n').map(t => t.trim()).filter(Boolean),
    [topics],
  );

  const handleGenerate = useCallback(async () => {
    if (topicList.length === 0) return;
    setGenerating(true);
    const generated: { topic: string; svg: string }[] = [];

    // Process in microtask chunks to avoid blocking UI
    for (let i = 0; i < topicList.length; i++) {
      const topic = topicList[i];
      const params = { ...baseParams, subtitle: topic };
      const svg = buildSvgString(template, params);
      generated.push({ topic, svg });
      // Yield to event loop every 10 items
      if (i % 10 === 9) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    setResults(generated);
    setGenerating(false);
  }, [topicList, baseParams, template]);

  const handleDownloadAll = useCallback(() => {
    for (const { topic, svg } of results) {
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover-${topic.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [results]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 id="batch-modal-title" className="text-lg font-bold text-slate-900">Batch Generate Covers</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="batch-topics" className="block text-sm font-medium text-slate-700 mb-1">Topics (one per line)</label>
            <textarea
              id="batch-topics"
              value={topics}
              onChange={e => setTopics(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>
          <p className="text-xs text-slate-500">
            Uses template: {template.label} ({template.width}x{template.height}).
            Each topic replaces the main title.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || topicList.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : null}
              Generate {topicList.length} Cover{topicList.length !== 1 ? 's' : ''}
            </button>
            {results.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition"
              >
                <Download size={14} /> Download All SVG
              </button>
            )}
          </div>
          {results.length > 0 && (
            <p className="text-sm text-green-600 font-medium">{results.length} covers generated.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Minimal SVG string builder for batch (avoids React rendering) */
function buildSvgString(template: CoverTemplate, params: CoverParams): string {
  const { width, height } = template;
  const p = params;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cx = width / 2;
  const titleY = height * 0.38;
  const brandY = height * 0.22;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${esc(p.primaryGradientStart)}" />
      <stop offset="100%" stop-color="${esc(p.primaryGradientEnd)}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="20" />
  <rect x="12" y="12" width="${width - 24}" height="${height - 24}" fill="none" stroke="${esc(p.accentColor)}" stroke-width="2" rx="14" opacity="0.4" />
  <text x="${cx}" y="${brandY}" text-anchor="middle" fill="${esc(p.accentColor)}" font-size="${Math.max(14, width * 0.012)}" font-family="Avenir Next, sans-serif" font-weight="700" letter-spacing="6">${esc(p.titleEn)}</text>
  <text x="${cx}" y="${titleY}" text-anchor="middle" fill="${esc(p.textColor)}" font-size="${Math.max(28, width * 0.035)}" font-family="Georgia, serif" font-weight="700">${esc(p.subtitle)}</text>
  <text x="${width - 30}" y="${height - 20}" text-anchor="end" fill="${esc(p.textColor)}" font-size="10" font-family="Avenir Next, sans-serif" font-weight="600" opacity="0.3">25MATHS</text>
</svg>`;
}

import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import type { PaperQuestion } from './types';
import { paperService } from '../../services/paperService';

/** Render a LaTeX string with KaTeX (inline + display math). Falls back to raw text. */
function renderMath(tex: string): string {
  const katex = (window as unknown as Record<string, unknown>).katex as {
    renderToString: (s: string, opts: Record<string, unknown>) => string;
  } | undefined;
  if (!katex) return tex;

  // Strip CIE-specific commands that KaTeX doesn't know
  const cleaned = tex
    .replace(/\\(?:AnswerLine|AnswerLineShort|answerlines|Marks|vgap|Answerspace|PartLabel|relinput)\b[^}]*/g, '')
    .replace(/\\begin\{(?:question|question\*|subpartsaliged|subparts)[^}]*\}[\s\S]*?\\end\{(?:question|question\*|subpartsaliged|subparts)\}/g, '');

  return cleaned
    .replace(/\$\$([^$]+)\$\$/g, (_, m) => {
      try { return katex.renderToString(m, { throwOnError: false, displayMode: true }); }
      catch { return _; }
    })
    .replace(/\$([^$\n]+)\$/g, (_, m) => {
      try { return katex.renderToString(m, { throwOnError: false, displayMode: false }); }
      catch { return _; }
    });
}

interface QuestionBrowserProps {
  questions: PaperQuestion[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectMultiple: (ids: string[]) => void;
}

export function QuestionBrowser({ questions, selectedIds, onToggle, onSelectMultiple }: QuestionBrowserProps) {
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<number | ''>('');
  const [filterCmd, setFilterCmd] = useState('');
  const [filterMinMarks, setFilterMinMarks] = useState<number | ''>('');
  const [filterMaxMarks, setFilterMaxMarks] = useState<number | ''>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const katexLoaded = useRef(false);

  // Load KaTeX CSS + JS from CDN (once)
  useEffect(() => {
    if (katexLoaded.current) return;
    katexLoaded.current = true;
    const CDN = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist';
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${CDN}/katex.min.css`;
      document.head.appendChild(link);
    }
    if (!(window as unknown as Record<string, unknown>).katex && !document.querySelector('script[src*="katex"]')) {
      const script = document.createElement('script');
      script.src = `${CDN}/katex.min.js`;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const sections = useMemo(() => paperService.extractSections(questions), [questions]);
  const cmds = useMemo(() => paperService.extractCmds(questions), [questions]);
  const years = useMemo(() => paperService.extractYears(questions), [questions]);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (filterSection && q.s !== filterSection && !q.s.startsWith(filterSection + '.')) return false;
      if (filterDifficulty !== '' && q.d !== filterDifficulty) return false;
      if (filterCmd && q.cmd !== filterCmd) return false;
      if (filterMinMarks !== '' && q.marks < filterMinMarks) return false;
      if (filterMaxMarks !== '' && q.marks > filterMaxMarks) return false;
      if (filterYear !== '' && q.year !== filterYear) return false;
      if (search) {
        const s = search.toLowerCase();
        const inTex = q.tex.toLowerCase().includes(s);
        const inSrc = q.src.toLowerCase().includes(s);
        const inTopic = (q.topic || '').toLowerCase().includes(s);
        const inQtype = (q.qtype || '').toLowerCase().includes(s);
        if (!inTex && !inSrc && !inTopic && !inQtype) return false;
      }
      return true;
    });
  }, [questions, filterSection, filterDifficulty, filterCmd, filterMinMarks, filterMaxMarks, filterYear, search]);

  const totalSelectedMarks = useMemo(() => {
    return questions.filter(q => selectedIds.has(q.id)).reduce((s, q) => s + q.marks, 0);
  }, [questions, selectedIds]);

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {filtered.length} questions shown / {selectedIds.size} selected ({totalSelectedMarks} marks)
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <Filter size={14} /> Filters {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions by text, source, topic..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
            >
              <option value="">All</option>
              {sections.map(ch => (
                <optgroup key={ch.chapter} label={`Chapter ${ch.chapter}`}>
                  {ch.sections.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
            >
              <option value="">All</option>
              <option value="1">Easy (1)</option>
              <option value="2">Medium (2)</option>
              <option value="3">Hard (3)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Command</label>
            <select
              value={filterCmd}
              onChange={e => setFilterCmd(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
            >
              <option value="">All</option>
              {cmds.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
            >
              <option value="">All</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Min Marks</label>
            <input
              type="number"
              value={filterMinMarks}
              onChange={e => setFilterMinMarks(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Max Marks</label>
            <input
              type="number"
              value={filterMaxMarks}
              onChange={e => setFilterMaxMarks(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
            />
          </div>
          <div className="col-span-2 flex items-end">
            <button
              type="button"
              onClick={() => {
                setFilterSection('');
                setFilterDifficulty('');
                setFilterCmd('');
                setFilterMinMarks('');
                setFilterMaxMarks('');
                setFilterYear('');
                setSearch('');
              }}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Select all filtered */}
      {filtered.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSelectMultiple(filtered.map(q => q.id))}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Select all {filtered.length} filtered
          </button>
        </div>
      )}

      {/* Question list */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filtered.slice(0, 100).map(q => {
          const isSelected = selectedIds.has(q.id);
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className={`rounded-xl border p-3 transition ${
                isSelected
                  ? 'border-indigo-300 bg-indigo-50/50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onToggle(q.id)}
                  className={`mt-0.5 p-1 rounded-lg transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? <Minus size={14} /> : <Plus size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">{q.src}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      q.d === 1 ? 'bg-green-100 text-green-700' :
                      q.d === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      d={q.d}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {q.marks}m
                    </span>
                    <span className="text-xs text-slate-400">s:{q.s}</span>
                    {q.cmd && (
                      <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                        {q.cmd}
                      </span>
                    )}
                    {q.hasFigure && (
                      <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                        fig
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="text-left mt-1"
                  >
                    <p className={`text-sm text-slate-700 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {q.tex.replace(/\$[^$]+\$/g, '[math]').replace(/\\[a-zA-Z]+/g, '').slice(0, 300)}
                    </p>
                  </button>
                  {isExpanded && (
                    <div
                      className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 max-h-48 overflow-y-auto leading-relaxed"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: renderMath(q.tex) }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length > 100 && (
          <p className="text-center text-sm text-slate-400 py-4">
            Showing first 100 of {filtered.length} results. Refine filters to see more.
          </p>
        )}
      </div>
    </div>
  );
}

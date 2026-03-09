import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Image, FileText, Filter, X, Eye, Code, ChevronDown } from 'lucide-react';
import { tikzService, type TikzCatalogIndex, type TikzQuestion, type TikzYearSummary } from '../../services/tikzService';
import { localAgentService } from '../../services/localAgentService';

const PAGE_SIZE = 40;
const AGENT_BASE = 'http://127.0.0.1:4318';
const CIE_ROOT = '/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2';

function questionFilePath(q: TikzQuestion, file: string): string {
  return `${CIE_ROOT}/${q.path}${file}`;
}

const TOPIC_COLORS: Record<string, string> = {
  Number: 'bg-blue-100 text-blue-700',
  Algebra: 'bg-purple-100 text-purple-700',
  'Algebra and graphs': 'bg-purple-100 text-purple-700',
  Geometry: 'bg-green-100 text-green-700',
  Mensuration: 'bg-amber-100 text-amber-700',
  Statistics: 'bg-pink-100 text-pink-700',
  'Coordinate geometry': 'bg-cyan-100 text-cyan-700',
  Trigonometry: 'bg-red-100 text-red-700',
  'Transformations and vectors': 'bg-teal-100 text-teal-700',
  Probability: 'bg-orange-100 text-orange-700',
};

function TopicBadge({ topic }: { topic: string }) {
  return (
    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${TOPIC_COLORS[topic] || 'bg-slate-100 text-slate-600'}`}>
      {topic}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status.includes('stage3') ? 'bg-green-400' : status.includes('stage2') ? 'bg-amber-400' : status.includes('stage1') ? 'bg-blue-400' : 'bg-slate-300';
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} title={status} />;
}

function YearCard({ year, active, onClick }: { year: TikzYearSummary; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold min-w-[80px] ${
        active ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }`}
    >
      <span className="text-lg">{year.year}</span>
      <span className="text-[10px] font-medium text-slate-400">{year.count} Q</span>
    </button>
  );
}

/** Detail panel shown when a question card is expanded */
function QuestionDetail({ q, agentOnline }: { q: TikzQuestion; agentOnline: boolean }) {
  const [texContent, setTexContent] = useState<string | null>(null);
  const [texLoading, setTexLoading] = useState(false);
  const [texError, setTexError] = useState('');
  const [showTex, setShowTex] = useState(false);

  const pdfUrl = agentOnline && q.has_question_pdf
    ? localAgentService.getFileUrl(AGENT_BASE, questionFilePath(q, 'QuestionStandalone.pdf'))
    : null;

  const originalPdfUrl = agentOnline && q.has_original_pdf
    ? localAgentService.getFileUrl(AGENT_BASE, questionFilePath(q, 'OriginalPDF/OriginalPDF.pdf'))
    : null;

  const loadTex = useCallback(() => {
    if (texContent !== null || texLoading) return;
    setTexLoading(true);
    const url = localAgentService.getFileUrl(AGENT_BASE, questionFilePath(q, 'QuestionStatement.tex'));
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => { setTexContent(text); setTexLoading(false); })
      .catch(err => { setTexError(err.message); setTexLoading(false); });
  }, [q, texContent, texLoading]);

  const handleShowTex = () => {
    setShowTex(v => !v);
    if (texContent === null && agentOnline) loadTex();
  };

  if (!agentOnline) {
    return (
      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
        Local agent offline. Run <code className="bg-amber-100 px-1 rounded">node server/local-agent.mjs</code> to view question content.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {/* PDF preview */}
      {pdfUrl && (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-[400px]"
          >
            <div className="flex items-center justify-center h-[400px] text-slate-400 text-sm">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                Open PDF in new tab
              </a>
            </div>
          </object>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleShowTex}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          <Code size={12} /> {showTex ? 'Hide' : 'Show'} LaTeX
        </button>
        {originalPdfUrl && (
          <a
            href={originalPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
          >
            <Eye size={12} /> Original PDF
          </a>
        )}
      </div>

      {/* TeX source */}
      {showTex && (
        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-[300px] overflow-y-auto">
          {texLoading ? (
            <span className="text-slate-400">Loading...</span>
          ) : texError ? (
            <span className="text-red-400">Error: {texError}</span>
          ) : (
            texContent
          )}
        </div>
      )}

      {/* Figures list */}
      {q.figures.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Figures ({q.figures.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.figures.map((fig, i) => {
              const pngUrl = fig.png_file
                ? localAgentService.getFileUrl(AGENT_BASE, `${CIE_ROOT}/${q.path}Figures/${fig.png_file}`)
                : null;
              return (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <p className="text-[10px] font-mono text-slate-500 mb-1 truncate">{fig.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <StatusDot status={fig.tikz_status || ''} />
                    <span>{fig.tikz_status || 'no tikz'}</span>
                  </div>
                  {pngUrl && (
                    <img
                      src={pngUrl}
                      alt={fig.name}
                      className="mt-2 max-h-[150px] rounded border border-slate-200 bg-white"
                      loading="lazy"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ q, expanded, onToggle, agentOnline }: { q: TikzQuestion; expanded: boolean; onToggle: () => void; agentOnline: boolean }) {
  const figCount = q.figures.length;
  return (
    <div className={`bg-white rounded-xl border transition-shadow ${expanded ? 'border-indigo-300 shadow-md col-span-full' : 'border-slate-200 hover:shadow-md'}`}>
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <StatusDot status={q.question_status} />
            <span className="text-xs font-mono font-bold text-slate-700">{q.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600">{q.total_marks}m</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {q.topics.map(t => <TopicBadge key={t} topic={t} />)}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {figCount > 0 && (
            <span className="flex items-center gap-1">
              <Image size={12} /> {figCount} figure{figCount > 1 ? 's' : ''}
              {q.tikz_status && <span className="text-[10px]">({q.tikz_status})</span>}
            </span>
          )}
          {q.has_question_pdf && <span className="flex items-center gap-1"><FileText size={12} /> PDF</span>}
        </div>

        {q.review_note && (
          <p className="mt-2 text-[11px] text-amber-600 bg-amber-50 rounded px-2 py-1">{q.review_note}</p>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <QuestionDetail q={q} agentOnline={agentOnline} />
        </div>
      )}
    </div>
  );
}

export function TikzHub() {
  const [index, setIndex] = useState<TikzCatalogIndex | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [questions, setQuestions] = useState<TikzQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearLoading, setYearLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [agentOnline, setAgentOnline] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [hasFigures, setHasFigures] = useState(false);
  const [page, setPage] = useState(0);

  // Check local agent connectivity
  useEffect(() => {
    localAgentService.ping(AGENT_BASE)
      .then(() => setAgentOnline(true))
      .catch(() => setAgentOnline(false));
  }, []);

  // Load index on mount
  useEffect(() => {
    tikzService.loadIndex()
      .then(idx => {
        setIndex(idx);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  // Auto-select latest year
  useEffect(() => {
    if (index && !selectedYear) {
      const latest = index.years[index.years.length - 1];
      if (latest) setSelectedYear(latest.year);
    }
  }, [index, selectedYear]);

  // Load year data
  useEffect(() => {
    if (!selectedYear) return;
    setYearLoading(true);
    setExpandedId(null);
    tikzService.loadYear(selectedYear)
      .then(qs => { setQuestions(qs); setYearLoading(false); })
      .catch(err => { setError(err.message); setYearLoading(false); });
  }, [selectedYear]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(0); }, [debouncedSearch, topicFilter, sessionFilter, hasFigures, selectedYear]);

  const filtered = useMemo(() => {
    let result = questions;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(item =>
        item.id.toLowerCase().includes(q) ||
        item.topics.some(t => t.toLowerCase().includes(q)) ||
        item.review_note.toLowerCase().includes(q)
      );
    }
    if (topicFilter) result = result.filter(item => item.topics.includes(topicFilter));
    if (sessionFilter) result = result.filter(item => item.source.session === sessionFilter);
    if (hasFigures) result = result.filter(item => item.figures.length > 0);
    return result;
  }, [questions, debouncedSearch, topicFilter, sessionFilter, hasFigures]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => q.topics.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [questions]);

  const allSessions = useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => set.add(q.source.session));
    return Array.from(set).sort();
  }, [questions]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setTopicFilter('');
    setSessionFilter('');
    setHasFigures(false);
  }, []);

  const hasFilters = search || topicFilter || sessionFilter || hasFigures;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh] text-slate-400">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mr-3" />
        Loading TikzVault catalog...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-bold mb-1">Failed to load TikzVault</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!index) return null;

  const { summary } = index;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Publishing</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${agentOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            Agent {agentOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">TikzVault</h2>
        <p className="text-sm text-slate-500 max-w-lg">
          {summary.total_questions.toLocaleString()} questions with {summary.total_figures.toLocaleString()} figures from CIE 0580 past papers.
          {!agentOnline && ' Start local agent to preview question content.'}
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(summary.question_status).map(([k, v]) => (
          <span key={k} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
            {k}: {v}
          </span>
        ))}
        <span className="text-[11px] font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
          TikZ drafted: {summary.tikz_status['stage2-drafted'] ?? 0}
        </span>
      </div>

      {/* Year selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {index.years.map(y => (
          <YearCard key={y.year} year={y} active={selectedYear === y.year} onClick={() => setSelectedYear(y.year)} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, topic, note..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={topicFilter}
          onChange={e => setTopicFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All Topics</option>
          {allTopics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={sessionFilter}
          onChange={e => setSessionFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All Sessions</option>
          {allSessions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={hasFigures}
            onChange={e => setHasFigures(e.target.checked)}
            className="rounded border-slate-300"
          />
          <Image size={14} /> With figures
        </label>

        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {yearLoading ? 'Loading...' : `${filtered.length} questions`}
          {hasFilters && ` (filtered from ${questions.length})`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30">
              <ChevronLeft size={14} />
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Question grid */}
      {yearLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mr-3" />
          Loading {selectedYear} questions...
        </div>
      ) : pageItems.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Filter size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No questions match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pageItems.map(q => (
            <QuestionCard
              key={q.id}
              q={q}
              expanded={expandedId === q.id}
              onToggle={() => setExpandedId(prev => prev === q.id ? null : q.id)}
              agentOnline={agentOnline}
            />
          ))}
        </div>
      )}
    </div>
  );
}

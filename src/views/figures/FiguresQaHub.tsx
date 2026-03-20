import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Clipboard, Eye, RefreshCw, RotateCcw, Search, Server, ServerOff, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { FilterChip } from '../../components/FilterChip';
import { localAgentService } from '../../services/localAgentService';
import { figureReviewService, type FigureReviewStatus } from '../../services/figureReviewService';
import {
  DEFAULT_AGENT_BASE_URL,
  DEFAULT_FIGURES_ROOT,
  DEFAULT_REMOTE_BASE_URL,
  FigureAsset,
  flattenFigureMap,
  loadFigureMapLocal,
  loadFigureMapRemote,
} from '../../services/figuresService';

type SourceMode = 'auto' | 'local' | 'remote';
type ReviewFilter = 'all' | 'unreviewed' | FigureReviewStatus;

const PAGE_SIZE_OPTIONS = [50, 100] as const;
const SESSION_SEASON_ORDER: Record<string, number> = { March: 1, MayJune: 2, OctNov: 3, Specimen: 4 };

function parseSession(session: string): { year: number; season: string } | null {
  if (session.length < 5) return null;
  const year = Number(session.slice(0, 4));
  const season = session.slice(4);
  if (!Number.isFinite(year)) return null;
  return { year, season };
}

function sortSessions(a: string, b: string): number {
  const pa = parseSession(a);
  const pb = parseSession(b);
  if (pa && pb) {
    if (pa.year !== pb.year) return pa.year - pb.year;
    const sa = SESSION_SEASON_ORDER[pa.season] ?? 99;
    const sb = SESSION_SEASON_ORDER[pb.season] ?? 99;
    if (sa !== sb) return sa - sb;
  }
  return a.localeCompare(b);
}

function sortPaper(a: string, b: string): number {
  const na = Number(a.replace(/^Paper/i, '')) || 0;
  const nb = Number(b.replace(/^Paper/i, '')) || 0;
  return na - nb || a.localeCompare(b);
}

function sortQuestionKey(a: string, b: string): number {
  const na = Number(a.replace(/^Q/i, '')) || 0;
  const nb = Number(b.replace(/^Q/i, '')) || 0;
  return na - nb || a.localeCompare(b);
}

function getQualityFlags(fig: FigureAsset) {
  const w = fig.meta.width;
  const h = fig.meta.height;
  const page = fig.meta.page;
  const missingMeta = !(typeof w === 'number' && typeof h === 'number' && typeof page === 'number');
  const tooSmall = typeof w === 'number' && typeof h === 'number' && (w < 220 || h < 120);
  const weirdAspect = typeof w === 'number' && typeof h === 'number' && (w / h > 10 || h / w > 10);
  return { missingMeta, tooSmall, weirdAspect, suspicious: missingMeta || tooSmall || weirdAspect };
}

function FigureThumb({
  preferLocal,
  localSrc,
  remoteSrc,
  alt,
  className,
  onResolvedSource,
}: {
  preferLocal: boolean;
  localSrc: string;
  remoteSrc: string;
  alt: string;
  className?: string;
  onResolvedSource?: (mode: 'local' | 'remote' | 'error') => void;
}) {
  const [useRemote, setUseRemote] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setUseRemote(false);
    setFailed(false);
  }, [localSrc, remoteSrc, preferLocal]);

  const src = preferLocal && !useRemote ? localSrc : remoteSrc;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onLoad={() => {
        onResolvedSource?.(preferLocal && !useRemote ? 'local' : 'remote');
      }}
      onError={() => {
        if (preferLocal && !useRemote) {
          setUseRemote(true);
          return;
        }
        setFailed(true);
        onResolvedSource?.('error');
      }}
      data-failed={failed ? '1' : '0'}
    />
  );
}

function FigureDetailModal({
  open,
  figure,
  imageSrc,
  localPath,
  reviewStatus,
  reviewNote,
  onClose,
  onSetStatus,
  onSetNote,
  onClear,
  onCopy,
}: {
  open: boolean;
  figure: FigureAsset | null;
  imageSrc: string;
  localPath: string;
  reviewStatus: ReviewFilter;
  reviewNote: string;
  onClose: () => void;
  onSetStatus: (status: FigureReviewStatus) => void;
  onSetNote: (note: string) => void;
  onClear: () => void;
  onCopy: (value: string, label: string) => void;
}) {
  const noteRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => noteRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <AnimatePresence initial={false}>
      {open && figure ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-4 sm:px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Figure QA</p>
                  <h2 className="text-lg font-black text-slate-900 truncate">{figure.id}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 flex-1 overflow-hidden">
                <div className="lg:col-span-3 bg-slate-950 flex items-center justify-center p-3 overflow-auto">
                  <img src={imageSrc} alt={figure.filename} className="max-h-[78vh] max-w-full object-contain bg-white rounded-xl" />
                </div>
                <div className="lg:col-span-2 p-4 sm:p-6 overflow-y-auto space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSetStatus('ok')}
                      className={cn("px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all",
                        reviewStatus === 'ok' ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      <Check size={14} className="inline mr-1" /> OK
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetStatus('issue')}
                      className={cn("px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all",
                        reviewStatus === 'issue' ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      <AlertTriangle size={14} className="inline mr-1" /> Issue
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetStatus('reshoot')}
                      className={cn("px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all",
                        reviewStatus === 'reshoot' ? "bg-rose-50 border-rose-300 text-rose-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      <RotateCcw size={14} className="inline mr-1" /> Reshoot
                    </button>
                    <button
                      type="button"
                      onClick={onClear}
                      className="px-3 py-1.5 rounded-xl text-xs font-black border-2 border-slate-200 text-slate-500 hover:border-slate-300"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-black text-slate-700">Note</p>
                    <textarea
                      ref={noteRef}
                      value={reviewNote}
                      onChange={(e) => onSetNote(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                      placeholder="标注问题原因，例如：裁剪错位 / 空白 / 重复 / 少截 / 多截 / 题号不对..."
                    />
                    <p className="text-[10px] text-slate-400">备注会自动保存到本地 localStorage。</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta</p>
                    <p className="text-xs text-slate-700 font-mono break-all">{figure.filename}</p>
                    <p className="text-xs text-slate-600">Paper: <span className="font-mono">{figure.paperKey}</span></p>
                    <p className="text-xs text-slate-600">Question: <span className="font-mono">{figure.questionKey}</span></p>
                    <p className="text-xs text-slate-600">Page: <span className="font-mono">{figure.meta.page ?? '—'}</span></p>
                    <p className="text-xs text-slate-600">Size: <span className="font-mono">{figure.meta.width ?? '—'}×{figure.meta.height ?? '—'}</span></p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => window.open(imageSrc, '_blank', 'noopener,noreferrer')}
                      className="w-full px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800"
                    >
                      <Eye size={16} className="inline mr-2" /> Open Image
                    </button>
                    <button
                      type="button"
                      onClick={() => onCopy(localPath, 'Local path')}
                      className="w-full px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-black hover:bg-slate-50"
                    >
                      <Clipboard size={16} className="inline mr-2" /> Copy Local Path
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function FiguresQaHub() {
  const [agentOnline, setAgentOnline] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>('auto');
  const [agentBaseUrl, setAgentBaseUrl] = useState(DEFAULT_AGENT_BASE_URL);
  const [figuresRoot, setFiguresRoot] = useState(DEFAULT_FIGURES_ROOT);
  const [remoteBaseUrl, setRemoteBaseUrl] = useState(DEFAULT_REMOTE_BASE_URL);

  const effectiveSource: Exclude<SourceMode, 'auto'> = useMemo(() => {
    if (sourceMode === 'auto') return agentOnline ? 'local' : 'remote';
    return sourceMode;
  }, [agentOnline, sourceMode]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState<FigureAsset[]>([]);

  // UI filters
  const [sessionFilter, setSessionFilter] = useState('');
  const [paperFilter, setPaperFilter] = useState('');
  const [questionFilter, setQuestionFilter] = useState('');
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(100);
  const [page, setPage] = useState(0);

  const [reviewVersion, setReviewVersion] = useState(0);
  const reviews = useMemo(() => figureReviewService.getAll(), [reviewVersion]);

  const [resolvedSourceById, setResolvedSourceById] = useState<Record<string, 'local' | 'remote' | 'error'>>({});

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedFigure = useMemo(() => (selectedId ? assets.find(a => a.id === selectedId) ?? null : null), [assets, selectedId]);

  const selectedReview = useMemo(() => (selectedId ? reviews[selectedId] || null : null), [reviews, selectedId]);
  const selectedReviewStatus: ReviewFilter = selectedReview?.status || 'unreviewed';
  const selectedReviewNote = selectedReview?.note || '';

  // Check local agent connectivity
  useEffect(() => {
    let cancelled = false;
    localAgentService.ping(agentBaseUrl)
      .then(() => { if (!cancelled) setAgentOnline(true); })
      .catch(() => { if (!cancelled) setAgentOnline(false); });
    return () => { cancelled = true; };
  }, [agentBaseUrl]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset paging when filters change
  useEffect(() => {
    setPage(0);
  }, [sessionFilter, paperFilter, questionFilter, showSuspiciousOnly, reviewFilter, debouncedSearch, pageSize, effectiveSource]);

  // Load figure map
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setResolvedSourceById({});

    const load = async () => {
      try {
        const map = effectiveSource === 'local'
          ? await loadFigureMapLocal(agentBaseUrl, figuresRoot)
          : await loadFigureMapRemote(remoteBaseUrl);
        const flat = flattenFigureMap(map, figuresRoot, remoteBaseUrl);
        if (!cancelled) {
          setAssets(flat);
          setLoading(false);
        }
      } catch (err) {
        // Local failed: fallback to remote if possible.
        if (effectiveSource === 'local') {
          try {
            const map = await loadFigureMapRemote(remoteBaseUrl);
            const flat = flattenFigureMap(map, figuresRoot, remoteBaseUrl);
            if (!cancelled) {
              setAssets(flat);
              setLoading(false);
              setError('Local map load failed; showing remote figure-map.json. Start local agent to review local files.');
            }
            return;
          } catch {
            // fall through
          }
        }
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load figure-map');
          setLoading(false);
        }
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [agentBaseUrl, effectiveSource, figuresRoot, remoteBaseUrl]);

  const sessions = useMemo(() => {
    const s = new Set<string>();
    for (const a of assets) s.add(a.session);
    return Array.from(s).sort(sortSessions);
  }, [assets]);

  const papers = useMemo(() => {
    const s = new Set<string>();
    for (const a of assets) {
      if (sessionFilter && a.session !== sessionFilter) continue;
      s.add(a.paper);
    }
    return Array.from(s).sort(sortPaper);
  }, [assets, sessionFilter]);

  const questions = useMemo(() => {
    const s = new Set<string>();
    for (const a of assets) {
      if (sessionFilter && a.session !== sessionFilter) continue;
      if (paperFilter && a.paper !== paperFilter) continue;
      s.add(a.questionKey);
    }
    return Array.from(s).sort(sortQuestionKey);
  }, [assets, paperFilter, sessionFilter]);

  const filtered = useMemo(() => {
    let list = assets;
    if (sessionFilter) list = list.filter(a => a.session === sessionFilter);
    if (paperFilter) list = list.filter(a => a.paper === paperFilter);
    if (questionFilter) list = list.filter(a => a.questionKey === questionFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(a =>
        a.id.toLowerCase().includes(q)
        || a.filename.toLowerCase().includes(q)
        || a.paperKey.toLowerCase().includes(q)
      );
    }
    if (showSuspiciousOnly) {
      list = list.filter(a => getQualityFlags(a).suspicious);
    }
    if (reviewFilter !== 'all') {
      if (reviewFilter === 'unreviewed') {
        list = list.filter(a => !reviews[a.id]);
      } else {
        list = list.filter(a => reviews[a.id]?.status === reviewFilter);
      }
    }
    return list;
  }, [assets, debouncedSearch, paperFilter, questionFilter, reviewFilter, reviews, sessionFilter, showSuspiciousOnly]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length, pageSize]);
  const currentPage = Math.min(page, totalPages - 1);

  const pageItems = useMemo(() => {
    const start = currentPage * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, pageSize]);

  const flaggedCount = useMemo(() => Object.keys(reviews).length, [reviews]);
  const reshootCount = useMemo(() => Object.values(reviews).filter(r => r.status === 'reshoot').length, [reviews]);
  const issueCount = useMemo(() => Object.values(reviews).filter(r => r.status === 'issue').length, [reviews]);

  const imgUrlFor = useCallback((a: FigureAsset) => {
    const preferLocal = effectiveSource === 'local' && agentOnline;
    if (preferLocal) return localAgentService.getFileUrl(agentBaseUrl, a.localPath);
    return a.remoteUrl;
  }, [agentBaseUrl, agentOnline, effectiveSource]);

  const localImgUrlFor = useCallback((a: FigureAsset) => {
    return localAgentService.getFileUrl(agentBaseUrl, a.localPath);
  }, [agentBaseUrl]);

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      // Minimal feedback: store a transient message in the document title.
      const prev = document.title;
      document.title = `${label} copied`;
      setTimeout(() => { document.title = prev; }, 800);
    } catch {
      alert(`Failed to copy ${label}`);
    }
  }, []);

  const setStatus = useCallback((id: string, status: FigureReviewStatus) => {
    figureReviewService.setStatus(id, status);
    setReviewVersion(v => v + 1);
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    figureReviewService.setNote(id, note);
    setReviewVersion(v => v + 1);
  }, []);

  const clearReview = useCallback((id: string) => {
    figureReviewService.clear(id);
    setReviewVersion(v => v + 1);
  }, []);

  const exportReshootList = useCallback(() => {
    const reshootIds = Object.entries(reviews)
      .filter(([, r]) => r.status === 'reshoot')
      .map(([id]) => id);
    const text = reshootIds.join('\\n');
    void handleCopy(text, 'Reshoot list');
  }, [handleCopy, reviews]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Figures QA</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review paper screenshots in bulk (50/100 per page), mark issues, and export reshoot list.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-xl border flex items-center gap-1",
            agentOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
          )}>
            {agentOnline ? <Server size={12} /> : <ServerOff size={12} />}
            Agent {agentOnline ? 'online' : 'offline'}
          </span>
          <button
            type="button"
            onClick={() => { localAgentService.ping(agentBaseUrl).then(() => setAgentOnline(true)).catch(() => setAgentOnline(false)); }}
            className="btn-secondary text-sm flex items-center gap-2"
            title="Recheck local agent"
          >
            <RefreshCw size={16} /> Recheck
          </button>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-700">Source</span>
            {(['auto', 'local', 'remote'] as const).map(m => (
              <FilterChip key={m} active={sourceMode === m} onClick={() => setSourceMode(m)}>
                {m}
              </FilterChip>
            ))}
            <span className="text-[10px] text-slate-400 ml-2">
              effective: <span className="font-mono">{effectiveSource}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span><span className="font-black">{flaggedCount}</span> marked</span>
            <span className="text-rose-600 font-black">{reshootCount} reshoot</span>
            <span className="text-amber-600 font-black">{issueCount} issue</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Local Agent Base URL</label>
            <input
              value={agentBaseUrl}
              onChange={(e) => setAgentBaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-sm"
              placeholder="http://127.0.0.1:4318"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Figures Root (Local)</label>
            <input
              value={figuresRoot}
              onChange={(e) => setFiguresRoot(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-sm font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Remote Base URL</label>
            <input
              value={remoteBaseUrl}
              onChange={(e) => setRemoteBaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-sm font-mono"
            />
          </div>
        </div>

        {effectiveSource === 'local' && !agentOnline && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5" />
            <div>
              <p className="font-black">Local agent offline</p>
              <p className="text-xs mt-1">Run <code className="bg-amber-100 px-1 rounded">node server/local-agent.mjs</code> (or <code className="bg-amber-100 px-1 rounded">npm run agent:local</code>) to review local files.</p>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-2xl border border-slate-200 text-sm"
                placeholder="paper / question / filename..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Session</label>
            <select
              value={sessionFilter}
              onChange={(e) => { setSessionFilter(e.target.value); setPaperFilter(''); setQuestionFilter(''); }}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-sm bg-white"
            >
              <option value="">All</option>
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paper</label>
            <select
              value={paperFilter}
              onChange={(e) => { setPaperFilter(e.target.value); setQuestionFilter(''); }}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-sm bg-white"
            >
              <option value="">All</option>
              {papers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Question</label>
            <select
              value={questionFilter}
              onChange={(e) => setQuestionFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-sm bg-white"
            >
              <option value="">All</option>
              {questions.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Page Size</label>
            <select
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-sm bg-white"
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <FilterChip active={showSuspiciousOnly} onClick={() => setShowSuspiciousOnly(v => !v)}>
              Suspicious only
            </FilterChip>
            <div className="flex flex-wrap gap-2 items-center">
              {(['all', 'unreviewed', 'ok', 'issue', 'reshoot'] as const).map(k => (
                <FilterChip key={k} active={reviewFilter === k} onClick={() => setReviewFilter(k)}>
                  {k}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportReshootList}
              className="btn-secondary text-sm flex items-center gap-2"
              title="Copy ids of reshoot items"
              disabled={reshootCount === 0}
            >
              <Clipboard size={16} /> Copy Reshoot List
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <span className="font-black text-slate-700">{pageItems.length}</span> of <span className="font-black text-slate-700">{filtered.length}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono">{currentPage + 1} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400">
          Loading figure-map.json...
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-sm text-slate-600 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5" />
          <div className="min-w-0">
            <p className="font-black text-slate-800">Load warning</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
        </div>
      ) : null}

      {!loading && pageItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {pageItems.map(fig => {
            const review = reviews[fig.id] || null;
            const flags = getQualityFlags(fig);
            const preferLocal = effectiveSource === 'local' && agentOnline;
            const resolved = resolvedSourceById[fig.id];
            const localMissing = preferLocal && resolved === 'remote';

            return (
              <button
                key={fig.id}
                type="button"
                onClick={() => setSelectedId(fig.id)}
                className={cn(
                  "group relative rounded-2xl border overflow-hidden bg-white text-left hover:shadow-md transition-shadow",
                  review?.status === 'reshoot' ? "border-rose-300" :
                  review?.status === 'issue' ? "border-amber-300" :
                  review?.status === 'ok' ? "border-emerald-300" :
                  flags.suspicious ? "border-amber-200" : "border-slate-200",
                )}
              >
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                  <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded-full border",
                    review?.status === 'reshoot' ? "bg-rose-50 text-rose-700 border-rose-200" :
                    review?.status === 'issue' ? "bg-amber-50 text-amber-700 border-amber-200" :
                    review?.status === 'ok' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    "bg-white/80 text-slate-600 border-slate-200"
                  )}>
                    {review?.status || '—'}
                  </span>
                  {flags.suspicious && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      !
                    </span>
                  )}
                  {localMissing && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-900 text-white">
                      L?
                    </span>
                  )}
                </div>

                <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center">
                  <FigureThumb
                    preferLocal={preferLocal}
                    localSrc={localImgUrlFor(fig)}
                    remoteSrc={fig.remoteUrl}
                    alt={fig.filename}
                    className="w-full h-full object-contain p-2"
                    onResolvedSource={(mode) => setResolvedSourceById(prev => (prev[fig.id] === mode ? prev : { ...prev, [fig.id]: mode }))}
                  />
                </div>

                <div className="p-2 border-t border-slate-100">
                  <p className="text-[10px] font-mono text-slate-500 truncate">{fig.paperKey}</p>
                  <p className="text-[11px] font-black text-slate-800 truncate">{fig.questionKey} · {fig.filename}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    p{fig.meta.page ?? '—'} · {fig.meta.width ?? '—'}×{fig.meta.height ?? '—'}
                  </p>
                </div>

                <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 justify-end">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setStatus(fig.id, 'ok'); }}
                    className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black"
                    title="Mark OK"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setStatus(fig.id, 'issue'); }}
                    className="px-2 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-black"
                    title="Mark Issue"
                  >
                    Issue
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setStatus(fig.id, 'reshoot'); }}
                    className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black"
                    title="Mark Reshoot"
                  >
                    Reshoot
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!loading && pageItems.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">
          No figures match your filters.
        </div>
      )}

      <FigureDetailModal
        open={!!selectedFigure}
        figure={selectedFigure}
        imageSrc={selectedFigure ? imgUrlFor(selectedFigure) : ''}
        localPath={selectedFigure?.localPath || ''}
        reviewStatus={selectedReviewStatus}
        reviewNote={selectedReviewNote}
        onClose={() => setSelectedId(null)}
        onSetStatus={(status) => selectedFigure && setStatus(selectedFigure.id, status)}
        onSetNote={(note) => selectedFigure && setNote(selectedFigure.id, note)}
        onClear={() => selectedFigure && clearReview(selectedFigure.id)}
        onCopy={handleCopy}
      />
    </div>
  );
}

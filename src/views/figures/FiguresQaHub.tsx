import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Clipboard, Crop, FileText, FolderOpen, RefreshCw, RotateCcw, Search, Server, ServerOff, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { FilterChip } from '../../components/FilterChip';
import { localAgentService } from '../../services/localAgentService';
import { figureReviewService, type FigureReviewStatus, type FigureReviewServiceInstance } from '../../services/figureReviewService';
import { buildPdfSingleQuestionsRawDir, DEFAULT_PDF_SINGLEQUESTIONS_RAW_ROOT } from '../../services/pdfSingleQuestionsService';
import {
  DEFAULT_AGENT_BASE_URL,
  DEFAULT_FIGURES_ROOT,
  DEFAULT_REMOTE_BASE_URL,
  FigureAsset,
  scanFigureAssetsLocal,
  flattenFigureMap,
  loadFigureMapLocal,
  loadFigureMapRemote,
  loadQaReportRemote,
  loadQaReportLocal,
  type QaReport,
} from '../../services/figuresService';

type SourceMode = 'auto' | 'local' | 'remote';
type IndexMode = 'scan' | 'map';
type ReviewFilter = 'all' | 'unreviewed' | FigureReviewStatus;

const PAGE_SIZE_OPTIONS = [50, 100] as const;
const SESSION_SEASON_ORDER: Record<string, number> = {
  // CIE 0580
  March: 1, MayJune: 2, OctNov: 3, Specimen: 4,
  // Edexcel 4MA1
  SP: 0, Jan: 1, June: 2, Nov: 3,
};

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

function getQualityFlags(fig: FigureAsset, qaReport?: QaReport | null) {
  const w = fig.meta.width;
  const h = fig.meta.height;
  const missingMeta = !(typeof w === 'number' && typeof h === 'number');
  const tooSmall = typeof w === 'number' && typeof h === 'number' && (w < 220 || h < 120);
  const weirdAspect = typeof w === 'number' && typeof h === 'number' && (w / h > 10 || h / w > 10);
  const qaResult = qaReport?.figures?.[fig.id];
  const qaFail = qaResult ? !qaResult.pass : false;
  const qaIssues = qaResult?.issues ?? [];
  const qaDetail = qaResult?.detail ?? '';
  return { missingMeta, tooSmall, weirdAspect, qaFail, qaIssues, qaDetail, suspicious: missingMeta || tooSmall || weirdAspect || qaFail };
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
  canReveal,
  canWrite,
  cropBusy,
  reviewStatus,
  reviewNote,
  onClose,
  onSetStatus,
  onSetNote,
  onClear,
  onRevealLocal,
  onRevealPdfRaw,
  onTrash,
  onCrop,
  onCopy,
}: {
  open: boolean;
  figure: FigureAsset | null;
  imageSrc: string;
  localPath: string;
  canReveal: boolean;
  canWrite: boolean;
  cropBusy: boolean;
  reviewStatus: ReviewFilter;
  reviewNote: string;
  onClose: () => void;
  onSetStatus: (status: FigureReviewStatus) => void;
  onSetNote: (note: string) => void;
  onClear: () => void;
  onRevealLocal: () => void;
  onRevealPdfRaw: () => void;
  onTrash: () => void;
  onCrop: (crop: { x: number; y: number; width: number; height: number }) => Promise<void>;
  onCopy: (value: string, label: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  qaIssues?: string[];
  qaDetail?: string;
}) {
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const dragRef = useRef<{ startX: number; startY: number; rect: DOMRect; pointerId: number } | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => noteRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setCropMode(false);
      setCropBox(null);
      dragRef.current = null;
    }
  }, [figure?.id, open]);

  // Keyboard shortcuts: ←/→ nav, 1=OK, 2=Issue, 3=Reshoot, 0=Clear
  // Space/Enter = OK + next (speed QA)
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case 'ArrowLeft': if (hasPrev && onPrev) { e.preventDefault(); onPrev(); } break;
        case 'ArrowRight': if (hasNext && onNext) { e.preventDefault(); onNext(); } break;
        case '1': e.preventDefault(); onSetStatus('ok'); break;
        case '2': e.preventDefault(); onSetStatus('issue'); break;
        case '3': e.preventDefault(); onSetStatus('reshoot'); break;
        case '0': e.preventDefault(); onClear(); break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          onSetStatus('ok');
          if (hasNext && onNext) setTimeout(onNext, 80);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, hasPrev, hasNext, onPrev, onNext, onSetStatus, onClear]);

  const handleCropPointerDown = useCallback((e: any) => {
    if (!cropMode) return;
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
    dragRef.current = { startX: x, startY: y, rect, pointerId: e.pointerId };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    setCropBox({ x, y, width: 0, height: 0 });
  }, [cropMode]);

  const handleCropPointerMove = useCallback((e: any) => {
    const s = dragRef.current;
    if (!s) return;
    const rect = s.rect;
    const cx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const cy = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const left = Math.min(s.startX, cx);
    const top = Math.min(s.startY, cy);
    const width = Math.abs(cx - s.startX);
    const height = Math.abs(cy - s.startY);
    setCropBox({ x: left, y: top, width, height });
  }, []);

  const handleCropPointerUp = useCallback((e: any) => {
    const s = dragRef.current;
    if (!s) return;
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(s.pointerId); } catch { /* ignore */ }
    const rect = s.rect;
    const cx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const cy = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const left = Math.min(s.startX, cx);
    const top = Math.min(s.startY, cy);
    const width = Math.abs(cx - s.startX);
    const height = Math.abs(cy - s.startY);
    if (width < 8 || height < 8) {
      setCropBox(null);
      return;
    }
    setCropBox({ x: left, y: top, width, height });
  }, []);

  const handleApplyCrop = useCallback(async () => {
    if (!canWrite) return;
    if (!cropBox) return;
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh || !rect.width || !rect.height) return;

    const sx = nw / rect.width;
    const sy = nh / rect.height;
    const x = Math.max(0, Math.min(nw - 1, Math.round(cropBox.x * sx)));
    const y = Math.max(0, Math.min(nh - 1, Math.round(cropBox.y * sy)));
    const width = Math.max(1, Math.min(nw - x, Math.round(cropBox.width * sx)));
    const height = Math.max(1, Math.min(nh - y, Math.round(cropBox.height * sy)));

    const ok = window.confirm(
      `Crop and overwrite original?\n\n${figure?.filename}\n\nx=${x}, y=${y}, w=${width}, h=${height}\n\nA backup will be saved under _trash.`,
    );
    if (!ok) return;

    try {
      await onCrop({ x, y, width, height });
      setCropBox(null);
      setCropMode(false);
    } catch {
      // Parent will surface error state.
    }
  }, [canWrite, cropBox, figure?.filename, onCrop]);

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
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black text-slate-900 truncate">{figure.id}</h2>
                  <p className="text-[10px] text-slate-400 font-mono">Space=OK+Next &middot; 1=OK 2=Issue 3=Reshoot 0=Clear &middot; ←→ Nav</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={!hasPrev}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-30"
                    title="Previous (←)"
                  >
                    <ChevronLeft size={20} className="text-slate-500" />
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!hasNext}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-30"
                    title="Next (→)"
                  >
                    <ChevronRight size={20} className="text-slate-500" />
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors ml-2">
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 flex-1 overflow-hidden">
                <div className="lg:col-span-3 bg-slate-950 flex items-center justify-center p-3 overflow-auto">
                  <div className="relative">
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt={figure.filename}
                      className="max-h-[78vh] max-w-full object-contain bg-white rounded-xl"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl",
                        cropMode ? "cursor-crosshair" : "pointer-events-none",
                      )}
                      onPointerDown={handleCropPointerDown}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      onPointerCancel={handleCropPointerUp}
                    >
                      {cropMode && (
                        <div className="absolute top-2 left-2 text-[10px] font-black px-2 py-1 rounded-full bg-indigo-600 text-white shadow">
                          Crop: drag to select
                        </div>
                      )}
                      {cropBox && (
                        <div
                          className="absolute border-2 border-indigo-400 bg-indigo-400/10"
                          style={{
                            left: `${cropBox.x}px`,
                            top: `${cropBox.y}px`,
                            width: `${cropBox.width}px`,
                            height: `${cropBox.height}px`,
                          }}
                        />
                      )}
                    </div>
                  </div>
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
                    <button
                      type="button"
                      onClick={() => {
                        setCropMode(v => !v);
                        setCropBox(null);
                        dragRef.current = null;
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all",
                        cropMode ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                      title="Toggle crop mode"
                    >
                      <Crop size={14} className="inline mr-1" /> Crop
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

                  {qaIssues && qaIssues.length > 0 && (
                    <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">AI Quality Check Failed</p>
                      <div className="flex flex-wrap gap-1">
                        {qaIssues.map(issue => (
                          <span key={issue} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            {issue}
                          </span>
                        ))}
                      </div>
                      {qaDetail && <p className="text-xs text-red-700 mt-1">{qaDetail}</p>}

                      {canWrite && (qaIssues.includes('text_leak') || qaIssues.includes('marks_leak')) && (
                        <div className="pt-2 space-y-1.5">
                          <p className="text-[10px] font-black text-red-500">Quick Trim</p>
                          <div className="flex flex-wrap gap-1">
                            {qaIssues.includes('text_leak') && (
                              <>
                                {[5, 10, 15].map(pct => (
                                  <button
                                    key={`top-${pct}`}
                                    type="button"
                                    disabled={cropBusy}
                                    onClick={() => {
                                      const img = imgRef.current;
                                      if (!img) return;
                                      const nw = img.naturalWidth;
                                      const nh = img.naturalHeight;
                                      const trimH = Math.round(nh * pct / 100);
                                      void onCrop({ x: 0, y: trimH, width: nw, height: nh - trimH });
                                    }}
                                    className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black hover:bg-red-700 disabled:opacity-40"
                                  >
                                    Top -{pct}%
                                  </button>
                                ))}
                              </>
                            )}
                            {(qaIssues.includes('marks_leak') || qaIssues.includes('text_leak')) && (
                              <>
                                {[5, 10, 15].map(pct => (
                                  <button
                                    key={`bot-${pct}`}
                                    type="button"
                                    disabled={cropBusy}
                                    onClick={() => {
                                      const img = imgRef.current;
                                      if (!img) return;
                                      const nw = img.naturalWidth;
                                      const nh = img.naturalHeight;
                                      const trimH = Math.round(nh * pct / 100);
                                      void onCrop({ x: 0, y: 0, width: nw, height: nh - trimH });
                                    }}
                                    className="px-2 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-black hover:bg-amber-700 disabled:opacity-40"
                                  >
                                    Bot -{pct}%
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                          <p className="text-[9px] text-red-400">点击后直接裁切覆盖原图（有备份），然后按 Space 标 OK + 跳下张</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta</p>
                    <p className="text-xs text-slate-700 font-mono break-all">{figure.filename}</p>
                    <p className="text-xs text-slate-600">Paper: <span className="font-mono">{figure.paperKey}</span></p>
                    <p className="text-xs text-slate-600">Question: <span className="font-mono">{figure.questionKey}</span></p>
                    <p className="text-xs text-slate-600">Page: <span className="font-mono">{figure.meta.page ?? '—'}</span></p>
                    <p className="text-xs text-slate-600">Size: <span className="font-mono">{figure.meta.width ?? '—'}×{figure.meta.height ?? '—'}</span></p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop</p>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-full border",
                        canWrite ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200"
                      )}>
                        {canWrite ? 'write enabled' : 'read-only'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      {cropMode ? 'Drag on the image to choose a crop area.' : 'Enable crop mode, then drag on the image.'}
                    </p>

                    {cropBox ? (
                      <p className="text-xs text-slate-600 font-mono">
                        selection: {Math.round(cropBox.width)}×{Math.round(cropBox.height)} (display px)
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">No selection.</p>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleApplyCrop()}
                        disabled={!canWrite || !cropBox || cropBusy}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-2xl text-sm font-black border transition disabled:opacity-40",
                          canWrite ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" : "bg-white text-slate-400 border-slate-200"
                        )}
                        title={canWrite ? 'Crop and overwrite the original (backup in _trash)' : 'Requires local source + agent write enabled'}
                      >
                        {cropBusy ? <RefreshCw size={16} className="inline mr-2 animate-spin" /> : <Crop size={16} className="inline mr-2" />}
                        Apply Crop (Overwrite)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropBox(null)}
                        disabled={!cropBox || cropBusy}
                        className="px-3 py-2 rounded-2xl text-sm font-black border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40"
                      >
                        Reset
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Cropping overwrites the original file. The agent will save a backup under <code className="bg-slate-100 px-1 rounded">_trash</code>.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={onRevealLocal}
                      disabled={!canReveal}
                      className={cn(
                        "w-full px-4 py-2 rounded-2xl text-sm font-black border transition disabled:opacity-40",
                        canReveal
                          ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                          : "bg-white text-slate-400 border-slate-200"
                      )}
                      title={canReveal ? 'Reveal the local PNG in Finder' : 'Requires local agent online'}
                    >
                      <FolderOpen size={16} className="inline mr-2" /> Open Figure Folder
                    </button>
                    <button
                      type="button"
                      onClick={onRevealPdfRaw}
                      disabled={!canReveal}
                      className={cn(
                        "w-full px-4 py-2 rounded-2xl text-sm font-black border transition disabled:opacity-40",
                        canReveal
                          ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          : "bg-white text-slate-400 border-slate-200"
                      )}
                      title={canReveal ? 'Open the PDF single-question raw folder for this paper' : 'Requires local agent online'}
                    >
                      <FileText size={16} className="inline mr-2" /> Open PDF Raw Folder
                    </button>
                    <button
                      type="button"
                      onClick={() => onCopy(localPath, 'Local path')}
                      className="w-full px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-black hover:bg-slate-50"
                    >
                      <Clipboard size={16} className="inline mr-2" /> Copy Local Path
                    </button>
                    <button
                      type="button"
                      onClick={onTrash}
                      disabled={!canWrite}
                      className={cn(
                        "w-full px-4 py-2 rounded-2xl text-sm font-black border transition disabled:opacity-40",
                        canWrite
                          ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700"
                          : "bg-white text-slate-400 border-slate-200"
                      )}
                      title={canWrite ? 'Move the local file to _trash' : 'Requires local source + agent write enabled'}
                    >
                      <Trash2 size={16} className="inline mr-2" /> Move to Trash
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

export interface FiguresQaHubProps {
  title?: string;
  initialFiguresRoot?: string;
  initialRemoteBaseUrl?: string;
  reviewService?: FigureReviewServiceInstance;
}

export function FiguresQaHub({
  title = 'Figures QA',
  initialFiguresRoot = DEFAULT_FIGURES_ROOT,
  initialRemoteBaseUrl = DEFAULT_REMOTE_BASE_URL,
  reviewService = figureReviewService,
}: FiguresQaHubProps = {}) {
  const [agentOnline, setAgentOnline] = useState(false);
  const [agentWriteEnabled, setAgentWriteEnabled] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>('auto');
  const [indexMode, setIndexMode] = useState<IndexMode>('scan');
  const [autoScan, setAutoScan] = useState(false);
  const [agentBaseUrl, setAgentBaseUrl] = useState(DEFAULT_AGENT_BASE_URL);
  const [figuresRoot, setFiguresRoot] = useState(initialFiguresRoot);
  const [remoteBaseUrl, setRemoteBaseUrl] = useState(initialRemoteBaseUrl);

  const effectiveSource: Exclude<SourceMode, 'auto'> = useMemo(() => {
    if (sourceMode === 'auto') return agentOnline ? 'local' : 'remote';
    return sourceMode;
  }, [agentOnline, sourceMode]);

  // Scan index only makes sense for local filesystem.
  useEffect(() => {
    if (effectiveSource !== 'local' && indexMode === 'scan') {
      setIndexMode('map');
      setAutoScan(false);
    }
  }, [effectiveSource, indexMode]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState<FigureAsset[]>([]);
  const [scanRefreshKey, setScanRefreshKey] = useState(0);
  const [cropBusy, setCropBusy] = useState(false);
  const [qaReport, setQaReport] = useState<QaReport | null>(null);

  // UI filters
  const [yearFilter, setYearFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [paperFilter, setPaperFilter] = useState('');
  const [questionFilter, setQuestionFilter] = useState('');
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(100);
  const [page, setPage] = useState(0);

  const [reviewVersion, setReviewVersion] = useState(0);
  const reviews = useMemo(() => reviewService.getAll(), [reviewVersion, reviewService]);

  const [resolvedSourceById, setResolvedSourceById] = useState<Record<string, 'local' | 'remote' | 'error'>>({});

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedFigure = useMemo(() => (selectedId ? assets.find(a => a.id === selectedId) ?? null : null), [assets, selectedId]);

  const selectedReview = useMemo(() => (selectedId ? reviews[selectedId] || null : null), [reviews, selectedId]);
  const selectedReviewStatus: ReviewFilter = selectedReview?.status || 'unreviewed';
  const selectedReviewNote = selectedReview?.note || '';

  // Navigation within filtered list
  const selectedIdx = useMemo(() => (selectedId ? filtered.findIndex(a => a.id === selectedId) : -1), [filtered, selectedId]);
  const hasPrev = selectedIdx > 0;
  const hasNext = selectedIdx >= 0 && selectedIdx < filtered.length - 1;
  const goToPrev = useCallback(() => { if (hasPrev) setSelectedId(filtered[selectedIdx - 1].id); }, [filtered, hasPrev, selectedIdx]);
  const goToNext = useCallback(() => { if (hasNext) setSelectedId(filtered[selectedIdx + 1].id); }, [filtered, hasNext, selectedIdx]);

  // Check local agent connectivity
  useEffect(() => {
    let cancelled = false;
    localAgentService.ping(agentBaseUrl)
      .then((info) => {
        if (cancelled) return;
        setAgentOnline(true);
        setAgentWriteEnabled(Boolean(info.write_enabled));
      })
      .catch(() => {
        if (cancelled) return;
        setAgentOnline(false);
        setAgentWriteEnabled(false);
      });
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
  }, [yearFilter, seasonFilter, paperFilter, questionFilter, showSuspiciousOnly, reviewFilter, debouncedSearch, pageSize, effectiveSource, indexMode]);

  // Auto-rescan local folder (scan mode only)
  useEffect(() => {
    if (!autoScan) return;
    if (effectiveSource !== 'local') return;
    if (!agentOnline) return;
    if (indexMode !== 'scan') return;
    const timer = setInterval(() => setScanRefreshKey(v => v + 1), 10_000);
    return () => clearInterval(timer);
  }, [agentOnline, autoScan, effectiveSource, indexMode]);

  // Load figure map
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setResolvedSourceById({});

    const load = async () => {
      try {
        const flat = await (async () => {
          if (effectiveSource === 'local') {
            if (indexMode === 'scan') {
              return scanFigureAssetsLocal(agentBaseUrl, figuresRoot, remoteBaseUrl);
            }
            const map = await loadFigureMapLocal(agentBaseUrl, figuresRoot);
            return flattenFigureMap(map, figuresRoot, remoteBaseUrl);
          }
          const map = await loadFigureMapRemote(remoteBaseUrl);
          return flattenFigureMap(map, figuresRoot, remoteBaseUrl);
        })();
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
              setError('Local load failed; showing remote figure-map.json. Start local agent to review local files.');
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
  }, [agentBaseUrl, effectiveSource, figuresRoot, indexMode, remoteBaseUrl, scanRefreshKey]);

  // Load QA report (best-effort, non-blocking)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const report = effectiveSource === 'local' && agentOnline
        ? await loadQaReportLocal(agentBaseUrl, figuresRoot)
        : await loadQaReportRemote(remoteBaseUrl);
      if (!cancelled) setQaReport(report);
    })();
    return () => { cancelled = true; };
  }, [agentBaseUrl, agentOnline, effectiveSource, figuresRoot, remoteBaseUrl]);

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const a of assets) {
      const parsed = parseSession(a.session);
      if (!parsed) continue;
      set.add(parsed.year);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [assets]);

  const seasons = useMemo(() => {
    const set = new Set<string>();
    for (const a of assets) {
      const parsed = parseSession(a.session);
      if (!parsed) continue;
      if (yearFilter && parsed.year !== Number(yearFilter)) continue;
      set.add(parsed.season);
    }
    return Array.from(set).sort((a, b) => (SESSION_SEASON_ORDER[a] ?? 99) - (SESSION_SEASON_ORDER[b] ?? 99) || a.localeCompare(b));
  }, [assets, yearFilter]);

  // If the year changes and the current season doesn't exist, clear it.
  useEffect(() => {
    if (!seasonFilter) return;
    if (seasons.includes(seasonFilter)) return;
    setSeasonFilter('');
  }, [seasonFilter, seasons]);

  const papers = useMemo(() => {
    const s = new Set<string>();
    for (const a of assets) {
      const parsed = parseSession(a.session);
      if (yearFilter && parsed?.year !== Number(yearFilter)) continue;
      if (seasonFilter && parsed?.season !== seasonFilter) continue;
      s.add(a.paper);
    }
    return Array.from(s).sort(sortPaper);
  }, [assets, yearFilter, seasonFilter]);

  const questions = useMemo(() => {
    const s = new Set<string>();
    for (const a of assets) {
      const parsed = parseSession(a.session);
      if (yearFilter && parsed?.year !== Number(yearFilter)) continue;
      if (seasonFilter && parsed?.season !== seasonFilter) continue;
      if (paperFilter && a.paper !== paperFilter) continue;
      s.add(a.questionKey);
    }
    return Array.from(s).sort(sortQuestionKey);
  }, [assets, paperFilter, yearFilter, seasonFilter]);

  const filtered = useMemo(() => {
    let list = assets;
    if (yearFilter || seasonFilter) {
      list = list.filter(a => {
        const parsed = parseSession(a.session);
        if (yearFilter && parsed?.year !== Number(yearFilter)) return false;
        if (seasonFilter && parsed?.season !== seasonFilter) return false;
        return true;
      });
    }
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
      list = list.filter(a => getQualityFlags(a, qaReport).suspicious);
    }
    if (reviewFilter !== 'all') {
      if (reviewFilter === 'unreviewed') {
        list = list.filter(a => !reviews[a.id]);
      } else {
        list = list.filter(a => reviews[a.id]?.status === reviewFilter);
      }
    }
    return list;
  }, [assets, debouncedSearch, paperFilter, questionFilter, qaReport, reviewFilter, reviews, yearFilter, seasonFilter, showSuspiciousOnly]);

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
    if (preferLocal) return `${localAgentService.getFileUrl(agentBaseUrl, a.localPath)}&v=${scanRefreshKey}`;
    return a.remoteUrl;
  }, [agentBaseUrl, agentOnline, effectiveSource, scanRefreshKey]);

  const localImgUrlFor = useCallback((a: FigureAsset) => {
    return `${localAgentService.getFileUrl(agentBaseUrl, a.localPath)}&v=${scanRefreshKey}`;
  }, [agentBaseUrl, scanRefreshKey]);

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
    reviewService.setStatus(id, status);
    setReviewVersion(v => v + 1);
  }, [reviewService]);

  const setNote = useCallback((id: string, note: string) => {
    reviewService.setNote(id, note);
    setReviewVersion(v => v + 1);
  }, [reviewService]);

  const clearReview = useCallback((id: string) => {
    reviewService.clear(id);
    setReviewVersion(v => v + 1);
  }, [reviewService]);

  const exportReshootList = useCallback(() => {
    const reshootIds = Object.entries(reviews)
      .filter(([, r]) => r.status === 'reshoot')
      .map(([id]) => id);
    const text = reshootIds.join('\\n');
    void handleCopy(text, 'Reshoot list');
  }, [handleCopy, reviews]);

  const canWrite = effectiveSource === 'local' && agentOnline && agentWriteEnabled;

  const trashSelected = useCallback(async () => {
    if (!selectedFigure) return;
    if (!canWrite) {
      setError('Write actions disabled. Start local agent with LOCAL_AGENT_WRITE_ENABLED=1');
      return;
    }
    const ok = window.confirm(`Move local file to _trash?\n\n${selectedFigure.localPath}`);
    if (!ok) return;
    try {
      await localAgentService.trashFigure(agentBaseUrl, { path: selectedFigure.localPath });
      setStatus(selectedFigure.id, 'reshoot');
      setSelectedId(null);
      setScanRefreshKey(v => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trash file');
    }
  }, [agentBaseUrl, canWrite, selectedFigure, setStatus]);

  const cropSelected = useCallback(async (crop: { x: number; y: number; width: number; height: number }) => {
    if (!selectedFigure) return;
    if (!canWrite) {
      setError('Write actions disabled. Start local agent with LOCAL_AGENT_WRITE_ENABLED=1');
      return;
    }
    setCropBusy(true);
    try {
      await localAgentService.cropFigure(agentBaseUrl, { path: selectedFigure.localPath, crop });
      setError('');
      setScanRefreshKey(v => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to crop file');
    } finally {
      setCropBusy(false);
    }
  }, [agentBaseUrl, canWrite, selectedFigure]);

  const revealLocalSelected = useCallback(async () => {
    if (!selectedFigure) return;
    if (!agentOnline) {
      setError('Local agent offline. Start it with `npm run agent:local` (recommend using `npm run dev` locally).');
      return;
    }
    try {
      await localAgentService.revealFigure(agentBaseUrl, { path: selectedFigure.localPath });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open figure in Finder');
    }
  }, [agentBaseUrl, agentOnline, selectedFigure]);

  const revealPdfRawSelected = useCallback(async () => {
    if (!selectedFigure) return;
    if (!agentOnline) {
      setError('Local agent offline. Start it with `npm run agent:local` (recommend using `npm run dev` locally).');
      return;
    }
    const rawDir = buildPdfSingleQuestionsRawDir(DEFAULT_PDF_SINGLEQUESTIONS_RAW_ROOT, selectedFigure.paperKey);
    try {
      await localAgentService.revealFigure(agentBaseUrl, { path: rawDir });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open PDF raw folder');
    }
  }, [agentBaseUrl, agentOnline, selectedFigure]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{title}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Scan and review paper screenshots in bulk (50/100 per page). Mark issues, export reshoots, and optionally crop/cleanup local files.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-xl border flex items-center gap-1",
                agentOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
              )}>
                {agentOnline ? <Server size={12} /> : <ServerOff size={12} />}
                Agent {agentOnline ? 'online' : 'offline'}
              </span>
              <button
                type="button"
                onClick={() => {
                  localAgentService.ping(agentBaseUrl)
                    .then((info) => { setAgentOnline(true); setAgentWriteEnabled(Boolean(info.write_enabled)); })
                    .catch(() => { setAgentOnline(false); setAgentWriteEnabled(false); });
                }}
                className="btn-secondary text-sm flex items-center gap-2"
                title="Recheck local agent"
              >
                <RefreshCw size={16} /> Recheck
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-slate-900">使用说明</p>
            <span className="text-[10px] font-mono text-slate-400">QA</span>
          </div>

          <div className="text-xs text-slate-600 space-y-3">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Start</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>本地质检推荐用 <span className="font-mono">Source=local/auto</span> + <span className="font-mono">Index=scan</span>。</li>
                <li>点击缩略图打开大图，标记 <span className="font-mono">OK/Issue/Reshoot</span>，备注会自动保存（localStorage）。</li>
                <li>大图右侧可直接打开本地截图文件夹，以及对应试卷的 <span className="font-mono">PDF raw</span> 单题文件夹（用于重截）。</li>
                <li>需要重截清单：点 <span className="font-mono">Copy Reshoot List</span> 复制。</li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local Agent</p>
              <p>
                只读（预览/扫描）：<code className="bg-slate-100 px-1 rounded">npm run agent:local</code>
              </p>
              <p>
                写入（Trash/Crop 覆盖）：<code className="bg-slate-100 px-1 rounded">LOCAL_AGENT_WRITE_ENABLED=1 npm run agent:local</code>
              </p>
              <p className="text-[10px] text-slate-400">
                备注：若你从线上 HTTPS 页面无法连接本地 agent，请在本地 <span className="font-mono">npm run dev</span> 使用。
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Overwrite</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>大图里点 <span className="font-mono">Crop</span>，在图上拖拽框选。</li>
                <li>点 <span className="font-mono">Apply Crop (Overwrite)</span> 覆盖原图。</li>
              </ol>
              <p className="text-[10px] text-slate-400">
                安全：覆盖前会自动备份到 figures 目录下的 <code className="bg-slate-100 px-1 rounded">_trash/</code>。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-4">
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

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-700">Index</span>
              {(['scan', 'map'] as const).map(m => (
                <FilterChip
                  key={m}
                  active={indexMode === m}
                  onClick={() => setIndexMode(m)}
                  className={effectiveSource !== 'local' && m === 'scan' ? 'opacity-50 pointer-events-none' : undefined}
                >
                  {m}
                </FilterChip>
              ))}
              {effectiveSource === 'local' && indexMode === 'scan' && (
                <>
                  <FilterChip active={autoScan} onClick={() => setAutoScan(v => !v)} tone="teal">
                    Auto scan
                  </FilterChip>
                  <button
                    type="button"
                    onClick={() => setScanRefreshKey(v => v + 1)}
                    className="btn-secondary text-sm flex items-center gap-2"
                    title="Rescan local folder"
                  >
                    <RefreshCw size={16} /> Rescan
                  </button>
                </>
              )}
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setPaperFilter(''); setQuestionFilter(''); }}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-sm bg-white"
            >
              <option value="">All</option>
              {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Season</label>
            <select
              value={seasonFilter}
              onChange={(e) => { setSeasonFilter(e.target.value); setPaperFilter(''); setQuestionFilter(''); }}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-sm bg-white"
            >
              <option value="">All</option>
              {seasons.map(s => <option key={s} value={s}>{s}</option>)}
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
              {qaReport ? 'AI + Suspicious' : 'Suspicious only'}
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
              onClick={() => {
                const unreviewed = filtered.filter(a => !reviews[a.id]);
                if (unreviewed.length === 0) return;
                const ok = window.confirm(`Mark ${unreviewed.length} unreviewed figures on this page/filter as OK?`);
                if (!ok) return;
                for (const a of unreviewed) reviewService.setStatus(a.id, 'ok');
                setReviewVersion(v => v + 1);
              }}
              className="btn-secondary text-sm flex items-center gap-2"
              title="Mark all unreviewed in current filter as OK"
              disabled={filtered.every(a => !!reviews[a.id])}
            >
              <Check size={16} /> Batch OK
            </button>
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
          <div className="flex items-center gap-4">
            <span>
              Showing <span className="font-black text-slate-700">{pageItems.length}</span> of <span className="font-black text-slate-700">{filtered.length}</span>
              {filtered.length !== assets.length && <span className="text-slate-400"> (total {assets.length})</span>}
            </span>
            {(() => {
              const reviewed = filtered.filter(a => !!reviews[a.id]).length;
              const pct = filtered.length > 0 ? Math.round(reviewed / filtered.length * 100) : 0;
              return (
                <span className="text-slate-400">
                  QA: <span className={cn("font-black", pct === 100 ? "text-emerald-600" : pct > 50 ? "text-amber-600" : "text-slate-500")}>{reviewed}/{filtered.length}</span>
                  <span className="ml-1">({pct}%)</span>
                </span>
              );
            })()}
          </div>
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
            const flags = getQualityFlags(fig, qaReport);
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
                  flags.qaFail ? "border-red-400 border-2" :
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
                  {flags.qaFail && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300" title={flags.qaIssues.join(', ')}>
                      AI
                    </span>
                  )}
                  {!flags.qaFail && flags.suspicious && (
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
        canReveal={agentOnline}
        canWrite={canWrite}
        cropBusy={cropBusy}
        reviewStatus={selectedReviewStatus}
        reviewNote={selectedReviewNote}
        onClose={() => setSelectedId(null)}
        onSetStatus={(status) => selectedFigure && setStatus(selectedFigure.id, status)}
        onSetNote={(note) => selectedFigure && setNote(selectedFigure.id, note)}
        onClear={() => selectedFigure && clearReview(selectedFigure.id)}
        onRevealLocal={() => void revealLocalSelected()}
        onRevealPdfRaw={() => void revealPdfRawSelected()}
        onTrash={trashSelected}
        onCrop={cropSelected}
        onCopy={handleCopy}
        onPrev={goToPrev}
        onNext={goToNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        qaIssues={selectedFigure ? (qaReport?.figures?.[selectedFigure.id]?.issues ?? []) : []}
        qaDetail={selectedFigure ? (qaReport?.figures?.[selectedFigure.id]?.detail ?? '') : ''}
      />
    </div>
  );
}

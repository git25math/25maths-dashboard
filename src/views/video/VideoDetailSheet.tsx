import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Circle, Copy, ExternalLink, Play, FileCheck, Image, FileText, Trash2, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDetailSheetKeyboard } from '../../hooks/useDetailSheetKeyboard';
import { cn, formatDate } from '../../lib/utils';
import { VideoScript, VIDEO_PIPELINE_STAGES, VideoPipelineStage } from '../../types/video';
import { mveAgent } from '../../services/mveAgentService';

const BOARD_LABELS: Record<string, string> = {
  cie: 'CIE 0580', edx: 'Edexcel 4MA1', ial: 'IAL', amc: 'AMC',
  ukmt: 'UKMT', bmmt: 'BMMT', kangaroo: 'Kangaroo', asdan: 'ASDAN',
};

const TIER_LABELS: Record<string, string> = {
  both: 'Both', core_only: 'Core Only', extended_only: 'Extended Only',
};

function PipelineSection({ item, onToggle, onBulk }: {
  item: VideoScript;
  onToggle: (id: string, stage: VideoPipelineStage) => void;
  onBulk: (id: string, value: boolean) => void;
}) {
  const total = VIDEO_PIPELINE_STAGES.length;
  const doneCount = VIDEO_PIPELINE_STAGES.filter(s => item.pipeline[s.key]).length;
  const pct = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const noneDone = doneCount === 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pipeline Status</p>
        <span className={cn('text-xs font-bold tabular-nums', allDone ? 'text-emerald-600' : 'text-slate-400')}>
          {doneCount}/{total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 mb-3 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', allDone ? 'bg-emerald-500' : 'bg-indigo-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {VIDEO_PIPELINE_STAGES.map(s => {
          const done = item.pipeline[s.key];
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onToggle(item.id, s.key)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-[0.97] cursor-pointer',
                done
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600',
              )}
              title={s.cmd ? `CLI: ${s.cmd}` : undefined}
            >
              {done ? <Check size={14} /> : <Circle size={14} />}
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        {!allDone && (
          <button type="button" onClick={() => onBulk(item.id, true)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition">
            Mark All Done
          </button>
        )}
        {!noneDone && (
          <button type="button" onClick={() => onBulk(item.id, false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">
            Reset All
          </button>
        )}
      </div>
    </section>
  );
}

// Agent action buttons section
interface AgentHook {
  connected: boolean;
  submitRender: (id: string, quality?: string, lang?: string, board?: string) => Promise<string>;
  submitValidate: (path?: string) => Promise<string>;
  submitCover: (id: string, board?: string) => Promise<string>;
  submitPublishMeta: (id: string, board?: string) => Promise<string>;
}

function AgentActions({ item, agent }: { item: VideoScript; agent?: AgentHook }) {
  const [renderQuality, setRenderQuality] = useState('1080p');
  const [renderLang, setRenderLang] = useState('en');
  const [submitting, setSubmitting] = useState<string | null>(null);

  if (!agent?.connected) return null;

  const handleAction = async (action: string) => {
    setSubmitting(action);
    try {
      switch (action) {
        case 'render':
          await agent.submitRender(item.id, renderQuality, renderLang, item.board);
          break;
        case 'validate':
          await agent.submitValidate(`scripts/knowledge/${item.board.slice(0, 3)}/${item.id.replace(/\./g, '_')}.yaml`);
          break;
        case 'cover':
          await agent.submitCover(item.id, item.board);
          break;
        case 'publish-meta':
          await agent.submitPublishMeta(item.id, item.board);
          break;
      }
    } catch {
      // errors handled by hook toast
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Agent Actions</p>

      {/* Render controls */}
      <div className="flex gap-2 mb-2">
        <select
          value={renderQuality}
          onChange={e => setRenderQuality(e.target.value)}
          className="flex-1 text-xs rounded-lg border border-slate-200 px-2 py-1.5 bg-white"
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="4k">4K</option>
        </select>
        <select
          value={renderLang}
          onChange={e => setRenderLang(e.target.value)}
          className="flex-1 text-xs rounded-lg border border-slate-200 px-2 py-1.5 bg-white"
        >
          <option value="en">English</option>
          <option value="zh">Chinese</option>
          <option value="enzh">Bilingual</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleAction('render')}
          disabled={!!submitting}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"
        >
          <Play size={12} /> {submitting === 'render' ? 'Starting...' : 'Render'}
        </button>
        <button
          type="button"
          onClick={() => handleAction('validate')}
          disabled={!!submitting}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <FileCheck size={12} /> Validate
        </button>
        <button
          type="button"
          onClick={() => handleAction('cover')}
          disabled={!!submitting}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <Image size={12} /> Cover
        </button>
        <button
          type="button"
          onClick={() => handleAction('publish-meta')}
          disabled={!!submitting}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <FileText size={12} /> Metadata
        </button>
      </div>
    </section>
  );
}

// Cover preview from agent
function AgentCoverPreview({ item, connected }: { item: VideoScript; connected: boolean }) {
  if (item.cover_url) {
    return <img src={item.cover_url} alt={item.title} className="w-full h-48 object-cover" />;
  }

  if (connected && item.pipeline.cover_generated) {
    const coverUrl = mveAgent.getCoverUrl(item.id, item.board);
    return <img src={coverUrl} alt={item.title} className="w-full h-48 object-cover" onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }} />;
  }

  return (
    <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300">
      <Video size={32} />
    </div>
  );
}

export interface VideoDetailSheetProps {
  item: VideoScript | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onCopy: (value: string, label: string) => void;
  onTogglePipeline: (id: string, stage: VideoPipelineStage) => void;
  onBulkPipeline: (id: string, value: boolean) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  agent?: AgentHook;
}

function DetailContent({
  item,
  onClose,
  onDelete,
  onCopy,
  onTogglePipeline,
  onBulkPipeline,
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false,
  agent,
}: VideoDetailSheetProps & { item: VideoScript }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.id}</p>
          <h3 className="text-xl font-bold text-slate-900">{item.title || 'Untitled'}</h3>
          {item.title_zh && <p className="text-sm text-slate-500">{item.title_zh}</p>}
        </div>
        <div className="flex items-center gap-2">
          {onNavigate && (
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => onNavigate('prev')}
                disabled={!canNavigatePrev}
                className={cn('rounded-full p-2 transition', canNavigatePrev ? 'text-slate-500 hover:bg-white hover:text-slate-900' : 'text-slate-300 cursor-not-allowed')}
                title="Previous"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('next')}
                disabled={!canNavigateNext}
                className={cn('rounded-full p-2 transition', canNavigateNext ? 'text-slate-500 hover:bg-white hover:text-slate-900' : 'text-slate-300 cursor-not-allowed')}
                title="Next"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          )}
          <button type="button" onClick={onClose} className="rounded-full p-2 transition hover:bg-slate-100">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Cover */}
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <AgentCoverPreview item={item} connected={!!agent?.connected} />
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">{BOARD_LABELS[item.board] ?? item.board}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">&sect;{item.section}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">{TIER_LABELS[item.tier] ?? item.tier}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">{item.lang.join(', ')}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">{Math.round(item.target_duration / 60)} min</span>
        {item.chapter && <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">{item.chapter}</span>}
      </div>

      {/* Topic */}
      {item.topic && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Topic</p>
          <p className="text-sm text-slate-600">{item.topic}</p>
        </section>
      )}

      {/* Pipeline checklist */}
      <PipelineSection item={item} onToggle={onTogglePipeline} onBulk={onBulkPipeline} />

      {/* Agent actions */}
      <AgentActions item={item} agent={agent} />

      {/* Links */}
      {(item.bilibili_url || item.output_path) && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Links</p>
          <div className="space-y-1">
            {item.bilibili_url && (
              <a
                href={item.bilibili_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition"
              >
                Bilibili <ExternalLink size={12} />
              </a>
            )}
            {item.output_path && (
              <p className="text-xs text-slate-400 truncate" title={item.output_path}>{item.output_path}</p>
            )}
          </div>
        </section>
      )}

      {/* Acts overview */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Acts ({item.acts.length})
        </p>
        {item.acts.length === 0 ? (
          <p className="text-sm text-slate-400">No acts defined.</p>
        ) : (
          <div className="space-y-1">
            {item.acts.map((act, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-slate-50 last:border-b-0">
                <span className="text-slate-400 font-mono w-5 shrink-0">{i + 1}</span>
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-600">{act.type}</span>
                <span className="text-slate-500 truncate">{act.scene}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Timeline */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Timeline</p>
        <div className="space-y-1 text-sm text-slate-500">
          <p>Created: {formatDate(item.created_at)}</p>
          <p>Updated: {formatDate(item.updated_at)}</p>
          {item.rendered_at && <p>Rendered: {formatDate(item.rendered_at)}</p>}
          {item.uploaded_at && <p>Uploaded: {formatDate(item.uploaded_at)}</p>}
          {item.video_duration != null && <p>Duration: {Math.round(item.video_duration)}s</p>}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => onCopy(item.id, 'ID')}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          <Copy size={14} /> Copy ID
        </button>
        <button
          type="button"
          onClick={() => { if (window.confirm(`Delete "${item.title || item.id}"?`)) onDelete(item.id); }}
          className="rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Keyboard hints */}
      {onNavigate && (
        <p className="text-[10px] text-slate-300 text-center pt-2">
          <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono">↑</kbd>{' '}
          <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono">↓</kbd> navigate
          {' · '}
          <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono">Esc</kbd> close
        </p>
      )}
    </div>
  );
}

/** Inline detail panel — renders as a scrollable column (no overlay). */
export function VideoDetailPanel(props: VideoDetailSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useDetailSheetKeyboard({ isOpen: !!props.item, onClose: props.onClose, onNavigate: props.onNavigate });

  useEffect(() => {
    if (props.item && panelRef.current) {
      panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [props.item?.id]);

  if (!props.item) return null;

  return (
    <div
      ref={panelRef}
      className="w-full max-w-md shrink-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg h-full"
    >
      <DetailContent {...props} item={props.item} />
    </div>
  );
}

/** Mobile overlay sheet — slides in from right with backdrop. */
export function VideoDetailSheet(props: VideoDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useDetailSheetKeyboard({ isOpen: !!props.item, onClose: props.onClose, onNavigate: props.onNavigate });

  useEffect(() => {
    if (props.item && sheetRef.current) {
      sheetRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [props.item?.id]);

  return (
    <AnimatePresence initial={false}>
      {props.item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={props.onClose}
          />
          <motion.div
            ref={sheetRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
          >
            <DetailContent {...props} item={props.item} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

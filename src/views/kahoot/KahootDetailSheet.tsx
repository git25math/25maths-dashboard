import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, ChevronUp, Circle, Gamepad2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LinkRow } from '../../components/LinkRow';
import { useDetailSheetKeyboard } from '../../hooks/useDetailSheetKeyboard';
import { cn, formatDate } from '../../lib/utils';
import { KAHOOT_PIPELINE_STAGES, KahootBoard, KahootCorrectOption, KahootItem, KahootOrgType, KahootPipelineStage, KahootQuestion, KahootTimeLimit, KahootTrack } from '../../types';
import { KahootDeploySection } from './KahootDeploySection';

const CORRECT_OPTIONS: KahootCorrectOption[] = ['A', 'B', 'C', 'D'];
const TIME_LIMITS: KahootTimeLimit[] = [5, 10, 20, 30, 60, 90, 120];

const BOARD_LABELS: Record<KahootBoard, string> = { cie0580: 'CIE 0580', 'edexcel-4ma1': 'Edexcel 4MA1' };
const TRACK_LABELS: Record<KahootTrack, string> = { core: 'Core', extended: 'Extended', foundation: 'Foundation', higher: 'Higher' };
const ORG_LABELS: Record<KahootOrgType, string> = { standalone: 'Standalone', in_course: 'In Course', in_channel: 'In Channel' };

function PipelineSection({ item, onToggle, onBulk }: { item: KahootItem; onToggle: (id: string, stage: KahootPipelineStage) => void; onBulk: (id: string, value: boolean) => void }) {
  if (!item.pipeline) return null;
  const total = KAHOOT_PIPELINE_STAGES.length;
  const doneCount = Object.values(item.pipeline).filter(Boolean).length;
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
        {KAHOOT_PIPELINE_STAGES.map(s => {
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

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;
const OPTION_FIELDS: Record<string, keyof KahootQuestion> = { A: 'option_a', B: 'option_b', C: 'option_c', D: 'option_d' };

function QuestionRow({ question, index, onUpdate }: { question: KahootQuestion; index: number; onUpdate?: (questionId: string, updates: Partial<KahootQuestion>) => void }) {
  const [open, setOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState(question.prompt);
  const [editOptions, setEditOptions] = useState({
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
  });

  // Sync local state when question prop changes (e.g. after save or navigation)
  useEffect(() => {
    setEditPrompt(question.prompt);
    setEditOptions({
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
    });
  }, [question.id, question.prompt, question.option_a, question.option_b, question.option_c, question.option_d]);

  const handlePromptBlur = () => {
    const trimmed = editPrompt.trim();
    if (trimmed !== question.prompt && onUpdate) {
      onUpdate(question.id, { prompt: trimmed });
    }
  };

  const handleOptionBlur = (field: keyof typeof editOptions) => {
    const trimmed = editOptions[field].trim();
    if (trimmed !== question[field] && onUpdate) {
      onUpdate(question.id, { [field]: trimmed });
    }
  };

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 py-2.5 text-left text-sm hover:bg-slate-50 transition rounded-lg px-2 -mx-2"
      >
        {open ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />}
        <span className="text-slate-400 font-mono text-xs w-6 shrink-0">Q{index + 1}</span>
        <span className="flex-1 truncate text-slate-700">{question.prompt}</span>
        <span className="text-xs font-bold text-indigo-500 shrink-0">{question.correct_option}</span>
      </button>
      {open && (
        <div className="pl-12 pb-3 space-y-3">
          {/* Editable prompt */}
          {onUpdate ? (
            <input
              type="text"
              value={editPrompt}
              onChange={e => setEditPrompt(e.target.value)}
              onBlur={handlePromptBlur}
              onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              placeholder="Question prompt..."
            />
          ) : (
            <p className="text-sm text-slate-700">{question.prompt}</p>
          )}

          {/* Editable options */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {OPTION_KEYS.map(key => {
              const field = OPTION_FIELDS[key] as keyof typeof editOptions;
              const isCorrect = key === question.correct_option;
              return onUpdate ? (
                <div key={key} className="relative">
                  <span className={cn('absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs', isCorrect ? 'text-emerald-600' : 'text-slate-400')}>{key}.</span>
                  <input
                    type="text"
                    value={editOptions[field]}
                    onChange={e => setEditOptions(prev => ({ ...prev, [field]: e.target.value }))}
                    onBlur={() => handleOptionBlur(field)}
                    onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    className={cn(
                      'w-full rounded-lg border pl-8 pr-3 py-2 text-xs outline-none transition',
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100'
                        : 'border-slate-200 bg-white text-slate-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100',
                    )}
                    placeholder={`Option ${key}...`}
                  />
                </div>
              ) : (
                <div
                  key={key}
                  className={cn(
                    'rounded-lg px-3 py-2 border',
                    isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-100 bg-slate-50 text-slate-600',
                  )}
                >
                  <span className="font-bold mr-1.5">{key}.</span>{editOptions[field] || '-'}
                </div>
              );
            })}
          </div>

          {/* Correct answer & time limit */}
          {onUpdate ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Answer:</span>
                <div className="flex gap-1">
                  {CORRECT_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onUpdate(question.id, { correct_option: opt })}
                      className={cn(
                        'h-7 w-7 rounded-lg text-xs font-bold transition',
                        opt === question.correct_option
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600',
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Time:</span>
                <select
                  value={question.time_limit}
                  onChange={e => onUpdate(question.id, { time_limit: Number(e.target.value) as KahootTimeLimit })}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                  {TIME_LIMITS.map(t => <option key={t} value={t}>{t}s</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Time limit: {question.time_limit}s</div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailContent({
  item,
  onClose,
  onDelete,
  onDuplicate,
  onCopy,
  onPersistItem,
  onTogglePipeline,
  onBulkPipeline,
  onUpdateQuestion,
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false,
}: KahootDetailSheetProps & { item: KahootItem }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.topic_code}</p>
          <h3 className="text-xl font-bold text-slate-900">{item.title || 'Untitled'}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onNavigate && (
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => onNavigate('prev')}
                disabled={!canNavigatePrev}
                className={cn('rounded-full p-2 transition', canNavigatePrev ? 'text-slate-500 hover:bg-white hover:text-slate-900' : 'text-slate-300 cursor-not-allowed')}
                title="Previous (↑)"
                aria-label="Previous item"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('next')}
                disabled={!canNavigateNext}
                className={cn('rounded-full p-2 transition', canNavigateNext ? 'text-slate-500 hover:bg-white hover:text-slate-900' : 'text-slate-300 cursor-not-allowed')}
                title="Next (↓)"
                aria-label="Next item"
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
        {item.cover_url ? (
          <img src={item.cover_url} alt={item.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300">
            <Gamepad2 size={32} />
          </div>
        )}
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">{BOARD_LABELS[item.board]}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">{TRACK_LABELS[item.track]}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">
          {ORG_LABELS[item.org_type ?? 'standalone']}{item.org_name ? ` : ${item.org_name}` : ''}
        </span>
      </div>

      {/* Pipeline checklist */}
      <PipelineSection item={item} onToggle={onTogglePipeline} onBulk={onBulkPipeline} />

      {/* Links section */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Links</p>
        <div className="divide-y divide-slate-100">
          <LinkRow label="Play Link" url={item.challenge_url} onCopy={onCopy} />
          <LinkRow label="Creator Link" url={item.creator_url} onCopy={onCopy} />
          <LinkRow label="Page Link" url={item.page_url} onCopy={onCopy} />
        </div>
      </section>

      <KahootDeploySection item={item} onCopy={onCopy} onPersistItem={onPersistItem} />

      {/* Description */}
      {item.description && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Description</p>
          <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
        </section>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span key={tag} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">{tag}</span>
            ))}
          </div>
        </section>
      )}

      {/* Questions */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Questions ({item.questions.length})
        </p>
        {item.questions.length === 0 ? (
          <p className="text-sm text-slate-400">No questions.</p>
        ) : (
          <div>{item.questions.map((q, i) => (
            <QuestionRow
              key={q.id}
              question={q}
              index={i}
              onUpdate={onUpdateQuestion ? (qId, updates) => onUpdateQuestion(item.id, qId, updates) : undefined}
            />
          ))}</div>
        )}
      </section>

      {/* Timeline */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Timeline</p>
        <div className="space-y-1 text-sm text-slate-500">
          <p>Created: {formatDate(item.created_at)}</p>
          <p>Updated: {formatDate(item.updated_at)}</p>
          {item.uploaded_at && <p>Uploaded: {formatDate(item.uploaded_at)}</p>}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => onDuplicate(item.id)}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => { if (window.confirm(`Delete "${item.title}"?`)) onDelete(item.id); }}
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

// --- Exported components ---

export interface KahootDetailSheetProps {
  item: KahootItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (value: string, label: string) => void;
  onPersistItem?: (id: string, updates: Partial<KahootItem>) => Promise<void> | void;
  onTogglePipeline: (id: string, stage: KahootPipelineStage) => void;
  onBulkPipeline: (id: string, value: boolean) => void;
  onUpdateQuestion?: (kahootId: string, questionId: string, updates: Partial<KahootQuestion>) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
}

/** Inline detail panel — renders as a scrollable column (no overlay). */
export function KahootDetailPanel(props: KahootDetailSheetProps) {
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
export function KahootDetailSheet(props: KahootDetailSheetProps) {
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

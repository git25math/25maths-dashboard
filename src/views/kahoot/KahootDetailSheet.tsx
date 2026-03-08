import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Circle, Copy, ExternalLink, Gamepad2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { KAHOOT_PIPELINE_STAGES, KahootBoard, KahootItem, KahootOrgType, KahootQuestion, KahootTrack } from '../../types';

const BOARD_LABELS: Record<KahootBoard, string> = { cie0580: 'CIE 0580', 'edexcel-4ma1': 'Edexcel 4MA1' };
const TRACK_LABELS: Record<KahootTrack, string> = { core: 'Core', extended: 'Extended', foundation: 'Foundation', higher: 'Higher' };
const ORG_LABELS: Record<KahootOrgType, string> = { standalone: 'Standalone', in_course: 'In Course', in_channel: 'In Channel' };

const STATUS_BADGE: Record<string, string> = {
  ai_generated: 'bg-slate-100 text-slate-500',
  human_review: 'bg-amber-100 text-amber-700',
  excel_exported: 'bg-blue-100 text-blue-700',
  kahoot_uploaded: 'bg-indigo-100 text-indigo-700',
  web_verified: 'bg-teal-100 text-teal-700',
  published: 'bg-emerald-100 text-emerald-700',
};

const STATUS_LABEL: Record<string, string> = {
  ai_generated: 'AI Generated',
  human_review: 'Reviewed',
  excel_exported: 'Excel Ready',
  kahoot_uploaded: 'Uploaded',
  web_verified: 'Verified',
  published: 'Published',
};

function formatDate(v?: string) {
  if (!v) return '-';
  try {
    return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(v));
  } catch { return v; }
}

function LinkRow({ label, url, onCopy }: { label: string; url?: string; onCopy: (v: string, l: string) => void }) {
  if (!url) return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-300">-</span>
    </div>
  );
  return (
    <div className="flex items-center justify-between gap-2 py-2 text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <a href={url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-700 transition">
          <ExternalLink size={14} />
        </a>
        <button type="button" onClick={() => onCopy(url, label)} className="text-slate-400 hover:text-slate-700 transition">
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

function QuestionRow({ question, index }: { question: KahootQuestion; index: number }) {
  const [open, setOpen] = useState(false);
  const opts = [
    { key: 'A', value: question.option_a },
    { key: 'B', value: question.option_b },
    { key: 'C', value: question.option_c },
    { key: 'D', value: question.option_d },
  ];

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
        <div className="pl-12 pb-3 grid grid-cols-2 gap-2 text-xs">
          {opts.map(o => (
            <div
              key={o.key}
              className={cn(
                'rounded-lg px-3 py-2 border',
                o.key === question.correct_option ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-100 bg-slate-50 text-slate-600',
              )}
            >
              <span className="font-bold mr-1.5">{o.key}.</span>{o.value || '-'}
            </div>
          ))}
          <div className="col-span-2 text-slate-400 mt-1">Time limit: {question.time_limit}s</div>
        </div>
      )}
    </div>
  );
}

interface KahootDetailSheetProps {
  item: KahootItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (value: string, label: string) => void;
}

export function KahootDetailSheet({ item, onClose, onDelete, onDuplicate, onCopy }: KahootDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.topic_code}</p>
                  <h3 className="text-xl font-bold text-slate-900">{item.title || 'Untitled'}</h3>
                </div>
                <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
                  <X size={18} className="text-slate-400" />
                </button>
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
              {item.pipeline && (
                <section>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Pipeline Status</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {KAHOOT_PIPELINE_STAGES.map(s => {
                      const done = item.pipeline[s.key];
                      return (
                        <div key={s.key} className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold',
                          done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400',
                        )}>
                          {done ? <Check size={14} /> : <Circle size={14} />}
                          {s.label}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Links section */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Links</p>
                <div className="divide-y divide-slate-100">
                  <LinkRow label="Play Link" url={item.challenge_url} onCopy={onCopy} />
                  <LinkRow label="Creator Link" url={item.creator_url} onCopy={onCopy} />
                  <LinkRow label="Page Link" url={item.page_url} onCopy={onCopy} />
                </div>
              </section>

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
                  <div>{item.questions.map((q, i) => <QuestionRow key={q.id} question={q} index={i} />)}</div>
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

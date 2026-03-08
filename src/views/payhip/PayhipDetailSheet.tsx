import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Circle, Copy, ExternalLink, Save, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { PAYHIP_STATUS_LABELS } from '../../lib/payhipUtils';
import { PAYHIP_PIPELINE_STAGES, PayhipItem, PayhipPipelineStage, PayhipStatus } from '../../types';

const STATUS_ORDER: PayhipStatus[] = ['planned', 'presale', 'live', 'free_sample_live', 'archived'];

const STATUS_STYLES: Record<PayhipStatus, string> = {
  planned: 'bg-slate-100 text-slate-500 hover:bg-slate-200',
  presale: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  live: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  archived: 'bg-slate-200 text-slate-600 hover:bg-slate-300',
  free_sample_live: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
};

function formatDate(value?: string) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value));
  } catch {
    return value;
  }
}

function LinkRow({ label, url, onCopy }: { label: string; url?: string; onCopy: (value: string, label: string) => void }) {
  if (!url) {
    return (
      <div className="flex items-center justify-between py-2 text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">-</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 py-2 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <a href={url} target="_blank" rel="noreferrer" className="text-emerald-600 transition hover:text-emerald-700">
          <ExternalLink size={14} />
        </a>
        <button type="button" onClick={() => onCopy(url, label)} className="text-slate-400 transition hover:text-slate-700">
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

interface PayhipDetailSheetProps {
  item: PayhipItem | null;
  onClose: () => void;
  onCopy: (value: string, label: string) => void;
  onSave: (id: string, updates: Partial<PayhipItem>) => Promise<void>;
  onTogglePipeline: (id: string, stage: PayhipPipelineStage) => Promise<void>;
  onBulkPipeline: (id: string, value: boolean) => Promise<void>;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
}

export function PayhipDetailSheet({ item, onClose, onCopy, onSave, onTogglePipeline, onBulkPipeline, onNavigate, canNavigatePrev, canNavigateNext }: PayhipDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [draftStatus, setDraftStatus] = useState<PayhipStatus>('planned');
  const [draftUrl, setDraftUrl] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftPresaleNotes, setDraftPresaleNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) return;
    setDraftStatus(item.status);
    setDraftUrl(item.payhip_url || '');
    setDraftNotes(item.notes || '');
    setDraftPresaleNotes(item.presale_notes || '');
  }, [item]);

  // Keyboard: Escape to close, Arrow keys to navigate
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (event.key === 'Escape') (event.target as HTMLElement).blur();
        return;
      }
      if (event.key === 'Escape') onClose();
      if (onNavigate && item) {
        if (event.key === 'ArrowUp' || event.key === 'k') { event.preventDefault(); onNavigate('prev'); }
        if (event.key === 'ArrowDown' || event.key === 'j') { event.preventDefault(); onNavigate('next'); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onNavigate, item]);

  // Scroll to top when navigating to a different item
  useEffect(() => {
    if (item && sheetRef.current) {
      sheetRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [item?.id]);

  const isDirty = useMemo(() => {
    if (!item) return false;
    return (
      draftStatus !== item.status
      || draftUrl !== (item.payhip_url || '')
      || draftNotes !== (item.notes || '')
      || draftPresaleNotes !== (item.presale_notes || '')
    );
  }, [draftNotes, draftPresaleNotes, draftStatus, draftUrl, item]);

  const doneCount = item ? Object.values(item.pipeline).filter(Boolean).length : 0;
  const total = PAYHIP_PIPELINE_STAGES.length;
  const allDone = doneCount === total;
  const noneDone = doneCount === 0;
  const pct = Math.round((doneCount / total) * 100);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await onSave(item.id, {
        status: draftStatus,
        payhip_url: draftUrl.trim(),
        notes: draftNotes.trim(),
        presale_notes: draftPresaleNotes.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

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
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-xl overflow-y-auto bg-white shadow-2xl"
          >
            <div className="space-y-6 p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.sku}</p>
                  <h3 className="text-xl font-bold text-slate-900">{item.listing_title}</h3>
                  <p className="text-sm text-slate-500">{item.board_label} | {item.level} | {item.tier_scope}</p>
                </div>
                <div className="flex items-center gap-1">
                  {onNavigate && (
                    <>
                      <button
                        type="button"
                        onClick={() => onNavigate('prev')}
                        disabled={!canNavigatePrev}
                        className={cn('rounded-full p-1.5 transition', canNavigatePrev ? 'hover:bg-slate-100 text-slate-400' : 'text-slate-200 cursor-not-allowed')}
                        title="Previous (↑)"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('next')}
                        disabled={!canNavigateNext}
                        className={cn('rounded-full p-1.5 transition', canNavigateNext ? 'hover:bg-slate-100 text-slate-400' : 'text-slate-200 cursor-not-allowed')}
                        title="Next (↓)"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </>
                  )}
                  <button type="button" onClick={onClose} className="rounded-full p-2 transition hover:bg-slate-100">
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Business Status */}
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Business Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_ORDER.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setDraftStatus(status)}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-bold transition',
                        STATUS_STYLES[status],
                        draftStatus === status && 'ring-2 ring-offset-2 ring-emerald-200',
                      )}
                    >
                      {PAYHIP_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </section>

              {/* Upload Pipeline */}
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Upload Pipeline</p>
                  <span className={cn('text-xs font-bold tabular-nums', allDone ? 'text-emerald-600' : 'text-slate-400')}>
                    {doneCount}/{total}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-slate-100 mb-3 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', allDone ? 'bg-emerald-500' : 'bg-teal-500')}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {PAYHIP_PIPELINE_STAGES.map(stage => {
                    const done = item.pipeline[stage.key];
                    return (
                      <button
                        key={stage.key}
                        type="button"
                        onClick={() => onTogglePipeline(item.id, stage.key)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition active:scale-[0.97] cursor-pointer',
                          done ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100',
                        )}
                      >
                        {done ? <Check size={14} /> : <Circle size={14} />}
                        {stage.label}
                      </button>
                    );
                  })}
                </div>

                {/* Bulk actions */}
                <div className="flex gap-2 mt-2">
                  {!allDone && (
                    <button type="button" onClick={() => onBulkPipeline(item.id, true)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition">
                      Mark All Done
                    </button>
                  )}
                  {!noneDone && (
                    <button type="button" onClick={() => onBulkPipeline(item.id, false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">
                      Reset All
                    </button>
                  )}
                </div>
              </section>

              {/* Pricing */}
              <section className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Early Bird</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{item.price_early_bird || '-'}</p>
                  <p className="text-xs text-slate-500">Ends {formatDate(item.early_bird_end_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Regular Price</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{item.price_regular || '-'}</p>
                  <p className="text-xs text-slate-500">Release {formatDate(item.release_date)}</p>
                </div>
              </section>

              {/* Links */}
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Links</p>
                <div className="divide-y divide-slate-100">
                  <LinkRow label="Payhip" url={item.payhip_url} onCopy={onCopy} />
                  <LinkRow label="Worksheet" url={item.worksheet_url} onCopy={onCopy} />
                  <LinkRow label="Section Bundle" url={item.section_bundle_url} onCopy={onCopy} />
                  <LinkRow label="Unit Bundle" url={item.unit_bundle_url} onCopy={onCopy} />
                  <LinkRow label="Kahoot" url={item.kahoot_url} onCopy={onCopy} />
                </div>
              </section>

              {/* Editable fields */}
              <section className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">Payhip URL</label>
                  <input
                    value={draftUrl}
                    onChange={e => setDraftUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    placeholder="https://payhip.com/b/..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">Operator Notes</label>
                  <textarea
                    value={draftNotes}
                    onChange={e => setDraftNotes(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Manual upload notes, Payhip IDs, follow-up tasks..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">Presale Notes</label>
                  <textarea
                    value={draftPresaleNotes}
                    onChange={e => setDraftPresaleNotes(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty || saving}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition',
                    !isDirty || saving ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700',
                  )}
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </section>

              {/* Hierarchy + Delivery */}
              <section className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Hierarchy</p>
                  <p className="mt-1">{item.unit_code || '-'} {item.unit_title || ''}</p>
                  <p>{item.section_code || '-'} {item.section_title || ''}</p>
                  <p>{item.subtopic_code || '-'} {item.subtopic_title || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Delivery</p>
                  <p className="mt-1">{item.deliver_now || '-'}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">On Release</p>
                  <p className="mt-1">{item.deliver_on_release || '-'}</p>
                </div>
              </section>

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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

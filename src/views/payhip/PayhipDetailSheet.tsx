import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Circle, Save, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LinkRow } from '../../components/LinkRow';
import { useDetailSheetKeyboard } from '../../hooks/useDetailSheetKeyboard';
import { getEffectivePayhipPipeline, getNextPayhipAction, getPayhipHealthAlerts, hasPayhipHealthAutoFix, isPayhipPipelineStageLocked, PAYHIP_STATUS_LABELS, PayhipHealthKey } from '../../lib/payhipUtils';
import { cn, formatDate } from '../../lib/utils';
import { PAYHIP_PIPELINE_STAGES, PayhipItem, PayhipPipelineStage, PayhipStatus } from '../../types';

const PAYHIP_LINK_COLOR = 'text-emerald-600 hover:text-emerald-700';

const STATUS_ORDER: PayhipStatus[] = ['planned', 'presale', 'live', 'free_sample_live', 'archived'];

const STATUS_STYLES: Record<PayhipStatus, string> = {
  planned: 'bg-slate-100 text-slate-500 hover:bg-slate-200',
  presale: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  live: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  archived: 'bg-slate-200 text-slate-600 hover:bg-slate-300',
  free_sample_live: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
};

export interface PayhipDetailSheetProps {
  item: PayhipItem | null;
  onClose: () => void;
  onCopy: (value: string, label: string) => void;
  onSave: (id: string, updates: Partial<PayhipItem>) => Promise<void>;
  onTogglePipeline: (id: string, stage: PayhipPipelineStage) => Promise<void>;
  onBulkPipeline: (id: string, value: boolean) => Promise<void>;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  onResolveHealth?: (id: string, health: PayhipHealthKey) => Promise<void>;
}

function PayhipDetailContent({
  item,
  onClose,
  onCopy,
  onSave,
  onTogglePipeline,
  onBulkPipeline,
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false,
  onResolveHealth,
}: PayhipDetailSheetProps & { item: PayhipItem }) {
  const [draftStatus, setDraftStatus] = useState<PayhipStatus>(item.status);
  const [draftUrl, setDraftUrl] = useState(item.payhip_url || '');
  const [draftNotes, setDraftNotes] = useState(item.notes || '');
  const [draftPresaleNotes, setDraftPresaleNotes] = useState(item.presale_notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftStatus(item.status);
    setDraftUrl(item.payhip_url || '');
    setDraftNotes(item.notes || '');
    setDraftPresaleNotes(item.presale_notes || '');
  }, [item]);

  const isDirty = useMemo(() => (
    draftStatus !== item.status
    || draftUrl !== (item.payhip_url || '')
    || draftNotes !== (item.notes || '')
    || draftPresaleNotes !== (item.presale_notes || '')
  ), [draftNotes, draftPresaleNotes, draftStatus, draftUrl, item]);

  const effectivePipeline = getEffectivePayhipPipeline(item);
  const doneCount = Object.values(effectivePipeline).filter(Boolean).length;
  const total = PAYHIP_PIPELINE_STAGES.length;
  const allDone = doneCount === total;
  const noneDone = doneCount === 0;
  const pct = Math.round((doneCount / total) * 100);
  const nextAction = getNextPayhipAction(item);
  const healthAlerts = getPayhipHealthAlerts(item);
  const hasUrlLockedStages = isPayhipPipelineStageLocked(item, 'payhip_created') || isPayhipPipelineStageLocked(item, 'url_backfilled');

  const handleSave = async () => {
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
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.sku}</p>
          <h3 className="text-xl font-bold text-slate-900">{item.listing_title}</h3>
          <p className="text-sm text-slate-500">{item.board_label} | {item.level} | {item.tier_scope}</p>
        </div>
        <div className="flex items-center gap-2">
          {onNavigate && (
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => onNavigate('prev')}
                disabled={!canNavigatePrev}
                aria-label="Previous item"
                className={cn(
                  'rounded-full p-2 transition',
                  canNavigatePrev ? 'text-slate-500 hover:bg-white hover:text-slate-900' : 'cursor-not-allowed text-slate-300',
                )}
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('next')}
                disabled={!canNavigateNext}
                aria-label="Next item"
                className={cn(
                  'rounded-full p-2 transition',
                  canNavigateNext ? 'text-slate-500 hover:bg-white hover:text-slate-900' : 'cursor-not-allowed text-slate-300',
                )}
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

      {healthAlerts.length > 0 && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Health Alerts</p>
              {healthAlerts.map(alert => (
                <div key={alert.key} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{alert.label}</p>
                    <p className="text-xs opacity-80">{alert.detail}</p>
                  </div>
                  {onResolveHealth && hasPayhipHealthAutoFix(alert.key) && alert.buttonLabel && (
                    <button
                      type="button"
                      onClick={() => onResolveHealth(item.id, alert.key)}
                      className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      {alert.buttonLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {nextAction && (
        <section
          className={cn(
            'rounded-2xl border p-4',
            nextAction.key === 'complete'
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700'
              : 'border-amber-200 bg-amber-50/70 text-amber-800',
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Next Action</p>
              <p className="mt-2 text-sm font-bold">{nextAction.label}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-80">{nextAction.detail}</p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold tabular-nums text-slate-700">
              {pct}%
            </span>
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Business Status</p>
          <span className="text-xs font-bold text-slate-400">{doneCount}/{total} pipeline steps</span>
        </div>
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

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Upload Pipeline</p>
          <span className={cn('text-xs font-bold tabular-nums', allDone ? 'text-emerald-600' : 'text-slate-400')}>
            {doneCount}/{total}
          </span>
        </div>

        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn('h-full rounded-full transition-all duration-300', allDone ? 'bg-emerald-500' : 'bg-teal-500')}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PAYHIP_PIPELINE_STAGES.map(stage => {
            const done = effectivePipeline[stage.key];
            const locked = isPayhipPipelineStageLocked(item, stage.key);
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => onTogglePipeline(item.id, stage.key)}
                disabled={locked}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition',
                  locked
                    ? 'cursor-not-allowed bg-emerald-50/70 text-emerald-600 opacity-80'
                    : done
                      ? 'cursor-pointer bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-[0.97]'
                      : 'cursor-pointer bg-slate-50 text-slate-500 hover:bg-slate-100 active:scale-[0.97]',
                )}
                title={locked ? 'Final Payhip URL keeps this stage complete' : undefined}
              >
                {done ? <Check size={14} /> : <Circle size={14} />}
                {stage.label}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex gap-2">
          {!allDone && (
            <button type="button" onClick={() => onBulkPipeline(item.id, true)} className="text-xs font-bold text-emerald-600 transition hover:text-emerald-700">
              Mark All Done
            </button>
          )}
          {!noneDone && (
            <button type="button" onClick={() => onBulkPipeline(item.id, false)} className="text-xs font-bold text-slate-400 transition hover:text-slate-600">
              {hasUrlLockedStages ? 'Reset Editable Stages' : 'Reset All'}
            </button>
          )}
        </div>
        {hasUrlLockedStages && (
          <p className="mt-2 text-xs text-slate-500">
            Final Payhip URL keeps Payhip Created and URL Synced complete.
          </p>
        )}
      </section>

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

      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Links</p>
        <div className="divide-y divide-slate-100">
          <LinkRow label="Payhip" url={item.payhip_url} onCopy={onCopy} linkColor={PAYHIP_LINK_COLOR} />
          <LinkRow label="Worksheet" url={item.worksheet_url} onCopy={onCopy} linkColor={PAYHIP_LINK_COLOR} />
          <LinkRow label="Section Bundle" url={item.section_bundle_url} onCopy={onCopy} linkColor={PAYHIP_LINK_COLOR} />
          <LinkRow label="Unit Bundle" url={item.unit_bundle_url} onCopy={onCopy} linkColor={PAYHIP_LINK_COLOR} />
          <LinkRow label="Kahoot" url={item.kahoot_url} onCopy={onCopy} linkColor={PAYHIP_LINK_COLOR} />
        </div>
      </section>

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

      {onNavigate && (
        <p className="pt-2 text-center text-[10px] text-slate-300">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono">↑</kbd>{' '}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono">↓</kbd>{' '}
          or{' '}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono">J</kbd>{' '}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono">K</kbd> navigate
          {' · '}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono">Esc</kbd> close
        </p>
      )}
    </div>
  );
}

// --- Exported components ---

/** Inline detail panel for desktop split layout. */
export function PayhipDetailPanel(props: PayhipDetailSheetProps) {
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
      <PayhipDetailContent {...props} item={props.item} />
    </div>
  );
}

/** Mobile overlay sheet — slides in from right with backdrop. */
export function PayhipDetailSheet(props: PayhipDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useDetailSheetKeyboard({ isOpen: !!props.item, onClose: props.onClose, onNavigate: props.onNavigate });

  useEffect(() => {
    if (props.item && sheetRef.current) {
      sheetRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [props.item?.id]);

  return (
    <AnimatePresence initial={false}>
      {props.item ? (
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
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-xl overflow-y-auto bg-white shadow-2xl"
          >
            <PayhipDetailContent {...props} item={props.item} />
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

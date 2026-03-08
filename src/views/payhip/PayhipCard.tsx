import { memo } from 'react';
import { ExternalLink, Store } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getEffectivePayhipPipeline, getNextPayhipAction, getPayhipHealthAlerts, PAYHIP_STATUS_LABELS } from '../../lib/payhipUtils';
import { PAYHIP_PIPELINE_STAGES, PayhipItem, PayhipStatus } from '../../types';

const STATUS_STYLES: Record<PayhipStatus, string> = {
  planned: 'bg-slate-100 text-slate-500',
  presale: 'bg-amber-50 text-amber-700',
  live: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-200 text-slate-600',
  free_sample_live: 'bg-sky-50 text-sky-700',
};

function PipelineDots({ item }: { item: PayhipItem }) {
  const pipeline = getEffectivePayhipPipeline(item);
  const doneCount = Object.values(pipeline).filter(Boolean).length;
  const total = PAYHIP_PIPELINE_STAGES.length;
  const allDone = doneCount === total;

  return (
    <span className="inline-flex items-center gap-1.5" title={`${doneCount}/${total} stages done`}>
      <span className="inline-flex items-center gap-0.5">
        {PAYHIP_PIPELINE_STAGES.map(stage => (
          <span
            key={stage.key}
            className={cn('h-2 w-2 rounded-full', pipeline[stage.key] ? 'bg-emerald-500' : 'bg-slate-200')}
            title={`${stage.label}: ${pipeline[stage.key] ? 'Done' : 'Pending'}`}
          />
        ))}
      </span>
      <span className={cn('text-[10px] font-bold tabular-nums', allDone ? 'text-emerald-600' : 'text-slate-400')}>
        {doneCount}/{total}
      </span>
    </span>
  );
}

function countLabel(item: PayhipItem) {
  const parts: string[] = [];
  if (item.subtopic_count) parts.push(`${item.subtopic_count} subtopics`);
  if (item.section_count) parts.push(`${item.section_count} sections`);
  if (item.unit_count) parts.push(`${item.unit_count} units`);
  return parts.join(' | ') || item.tier_scope;
}

export const PayhipCard = memo(function PayhipCard({ item, isSelected, onClick }: { item: PayhipItem; isSelected: boolean; onClick: () => void }) {
  const nextAction = getNextPayhipAction(item);
  const healthAlerts = getPayhipHealthAlerts(item);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border p-5 text-left transition-all hover:border-slate-300 hover:shadow-md',
        isSelected ? 'border-emerald-300 bg-emerald-50/40 shadow-sm' : 'border-slate-200 bg-white',
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
          <Store size={22} />
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wide">{item.sku}</span>
            <span>&middot;</span>
            <span>{item.board_label}</span>
            <span>&middot;</span>
            <span>{item.level}</span>
            <span>&middot;</span>
            <span>{item.tier_scope}</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-bold text-slate-900">{item.listing_title}</p>
              <p className="truncate text-xs text-slate-500">{countLabel(item)}</p>
              <p className={cn('truncate text-xs font-semibold', nextAction.key === 'complete' ? 'text-emerald-600' : 'text-slate-400')}>
                Next: {nextAction.label}
              </p>
              {healthAlerts.length > 0 && (
                <p className="truncate text-xs font-semibold text-rose-600">
                  Alert: {healthAlerts[0].label}
                </p>
              )}
            </div>
            <span className={cn('rounded-full px-3 py-1 text-[11px] font-bold', STATUS_STYLES[item.status])}>
              {PAYHIP_STATUS_LABELS[item.status]}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <PipelineDots item={item} />
            {item.release_date && <span className="text-slate-400">Release {item.release_date}</span>}
            {item.payhip_url && (
              <a
                href={item.payhip_url}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-emerald-600 transition hover:text-emerald-700"
              >
                Payhip <ExternalLink size={11} />
              </a>
            )}
            {item.kahoot_url && (
              <a
                href={item.kahoot_url}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-slate-500 transition hover:text-slate-700"
              >
                Kahoot <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </button>
  );
});

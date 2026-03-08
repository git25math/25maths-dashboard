import { memo } from 'react';
import { PAYHIP_HEALTH_META, PAYHIP_QUEUE_META, hasPayhipHealthAutoFix, PayhipHealthKey, PayhipQueueKey } from '../../lib/payhipUtils';
import { cn } from '../../lib/utils';
import { RELEASE_FOCUS_LABELS, ReleaseFocus } from './PayhipReleaseWatch';

type HealthFilter = 'all' | PayhipHealthKey;
type QueueFilter = 'all' | PayhipQueueKey;

interface PayhipActionBarProps {
  filteredCount: number;
  totalCount: number;
  healthFilter: HealthFilter;
  queueFilter: QueueFilter;
  releaseFocus: ReleaseFocus;
  hasFilters: boolean;
  advancingQueue: PayhipQueueKey | null;
  resolvingHealth: PayhipHealthKey | null;
  batchingVisible: boolean;
  filteredIds: string[];
  onOpenFirstVisible: () => void;
  onAdvanceQueue?: (queue: PayhipQueueKey, ids: string[]) => Promise<void>;
  onResolveHealth?: (health: PayhipHealthKey, ids: string[]) => Promise<void>;
  onResetFilters: () => void;
}

export const PayhipActionBar = memo(function PayhipActionBar({
  filteredCount,
  totalCount,
  healthFilter,
  queueFilter,
  releaseFocus,
  hasFilters,
  advancingQueue,
  resolvingHealth,
  batchingVisible,
  filteredIds,
  onOpenFirstVisible,
  onAdvanceQueue,
  onResolveHealth,
  onResetFilters,
}: PayhipActionBarProps) {
  const isBusy = advancingQueue !== null || resolvingHealth !== null || batchingVisible;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900">Showing {filteredCount} of {totalCount} listings</p>
          {healthFilter !== 'all' ? (
            <p className="text-xs text-slate-500">{PAYHIP_HEALTH_META[healthFilter].detail}</p>
          ) : queueFilter !== 'all' ? (
            <p className="text-xs text-slate-500">{PAYHIP_QUEUE_META[queueFilter].detail}</p>
          ) : releaseFocus !== 'all' ? (
            <p className="text-xs text-slate-500">{RELEASE_FOCUS_LABELS[releaseFocus]}</p>
          ) : (
            <p className="text-xs text-slate-500">Use health, queue, and release cards to narrow down the next batch of Payhip work.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenFirstVisible}
            disabled={filteredCount === 0}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-bold transition',
              filteredCount === 0 ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-700',
            )}
          >
            Open First Visible
          </button>

          {queueFilter !== 'all' && onAdvanceQueue && filteredCount > 0 && (
            <button
              type="button"
              onClick={() => onAdvanceQueue(queueFilter, filteredIds)}
              disabled={isBusy}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-bold transition',
                isBusy ? 'cursor-wait bg-emerald-100 text-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700',
              )}
            >
              {advancingQueue === queueFilter ? 'Updating...' : `${PAYHIP_QUEUE_META[queueFilter].buttonLabel} (${filteredCount})`}
            </button>
          )}

          {healthFilter !== 'all' && onResolveHealth && hasPayhipHealthAutoFix(healthFilter) && filteredCount > 0 && (
            <button
              type="button"
              onClick={() => onResolveHealth(healthFilter, filteredIds)}
              disabled={isBusy}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-bold transition',
                isBusy ? 'cursor-wait bg-rose-100 text-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700',
              )}
            >
              {resolvingHealth === healthFilter ? 'Resolving...' : `${PAYHIP_HEALTH_META[healthFilter].buttonLabel} (${filteredCount})`}
            </button>
          )}

          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </section>
  );
});

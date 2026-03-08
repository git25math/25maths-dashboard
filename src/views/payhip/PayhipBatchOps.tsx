import { memo } from 'react';
import { PAYHIP_STATUS_LABELS, PayhipHealthKey, PayhipQueueKey } from '../../lib/payhipUtils';
import { cn } from '../../lib/utils';
import { PAYHIP_PIPELINE_STAGES, PayhipPipelineStage, PayhipStatus } from '../../types';

const BATCH_STATUS_OPTIONS: { key: PayhipStatus; label: string }[] = [
  { key: 'planned', label: PAYHIP_STATUS_LABELS.planned },
  { key: 'presale', label: PAYHIP_STATUS_LABELS.presale },
  { key: 'live', label: PAYHIP_STATUS_LABELS.live },
  { key: 'free_sample_live', label: PAYHIP_STATUS_LABELS.free_sample_live },
  { key: 'archived', label: PAYHIP_STATUS_LABELS.archived },
];

interface PayhipBatchOpsProps {
  filteredCount: number;
  batchStatus: PayhipStatus;
  batchStage: PayhipPipelineStage;
  batchStageLabel: string;
  resetEligibleCount: number;
  resetLockedCount: number;
  batchingVisible: boolean;
  advancingQueue: PayhipQueueKey | null;
  resolvingHealth: PayhipHealthKey | null;
  filteredIds: string[];
  onBatchStatusChange: (v: PayhipStatus) => void;
  onBatchStageChange: (v: PayhipPipelineStage) => void;
  onBatchStatus?: (status: PayhipStatus, ids: string[]) => Promise<void>;
  onBatchPipeline?: (stage: PayhipPipelineStage, value: boolean, ids: string[]) => Promise<void>;
}

export const PayhipBatchOps = memo(function PayhipBatchOps({
  filteredCount,
  batchStatus,
  batchStage,
  batchStageLabel,
  resetEligibleCount,
  resetLockedCount,
  batchingVisible,
  advancingQueue,
  resolvingHealth,
  filteredIds,
  onBatchStatusChange,
  onBatchStageChange,
  onBatchStatus,
  onBatchPipeline,
}: PayhipBatchOpsProps) {
  const isBusy = batchingVisible || advancingQueue !== null || resolvingHealth !== null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Batch Ops</p>
          <p className="mt-1 text-sm text-slate-500">Apply controlled bulk changes to the current visible list.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Visible Status</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <select
                value={batchStatus}
                onChange={e => onBatchStatusChange(e.target.value as PayhipStatus)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              >
                {BATCH_STATUS_OPTIONS.map(option => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onBatchStatus?.(batchStatus, filteredIds)}
                disabled={filteredCount === 0 || isBusy}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-sm font-bold transition',
                  filteredCount === 0 || isBusy
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-slate-900 text-white hover:bg-slate-700',
                )}
              >
                {batchingVisible ? 'Applying...' : `Set ${filteredCount} To ${PAYHIP_STATUS_LABELS[batchStatus]}`}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Visible Pipeline Stage</p>
            <div className="mt-3 space-y-3">
              <select
                value={batchStage}
                onChange={e => onBatchStageChange(e.target.value as PayhipPipelineStage)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              >
                {PAYHIP_PIPELINE_STAGES.map(stage => (
                  <option key={stage.key} value={stage.key}>{stage.label}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onBatchPipeline?.(batchStage, true, filteredIds)}
                  disabled={filteredCount === 0 || isBusy}
                  className={cn(
                    'rounded-xl px-4 py-2.5 text-sm font-bold transition',
                    filteredCount === 0 || isBusy
                      ? 'cursor-not-allowed bg-emerald-100 text-emerald-400'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700',
                  )}
                >
                  {batchingVisible ? 'Applying...' : `Mark ${filteredCount} Done`}
                </button>
                <button
                  type="button"
                  onClick={() => onBatchPipeline?.(batchStage, false, filteredIds)}
                  disabled={resetEligibleCount === 0 || isBusy}
                  className={cn(
                    'rounded-xl px-4 py-2.5 text-sm font-bold transition',
                    resetEligibleCount === 0 || isBusy
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                  )}
                >
                  {batchingVisible ? 'Applying...' : `Reset ${resetEligibleCount}`}
                </button>
              </div>
              {resetLockedCount > 0 && (
                <p className="text-xs text-slate-500">
                  {resetLockedCount} visible listing{resetLockedCount === 1 ? '' : 's'} keep {batchStageLabel} complete because a final Payhip URL already exists.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

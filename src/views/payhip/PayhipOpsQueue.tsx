import { memo } from 'react';
import { PAYHIP_QUEUE_META, PayhipQueueKey } from '../../lib/payhipUtils';
import { cn } from '../../lib/utils';

interface QueueCard {
  key: PayhipQueueKey;
  count: number;
  tone: string;
}

interface PayhipOpsQueueProps {
  queueCards: QueueCard[];
  queueFilter: 'all' | PayhipQueueKey;
  onQueueFilterChange: (key: 'all' | PayhipQueueKey) => void;
}

export const PayhipOpsQueue = memo(function PayhipOpsQueue({
  queueCards,
  queueFilter,
  onQueueFilterChange,
}: PayhipOpsQueueProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Ops Queue</p>
        {queueFilter !== 'all' && (
          <button type="button" onClick={() => onQueueFilterChange('all')} className="text-xs font-bold text-slate-400 transition hover:text-slate-600">
            Clear Queue Filter
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {queueCards.map(card => (
          <button
            key={card.key}
            type="button"
            onClick={() => onQueueFilterChange(queueFilter === card.key ? 'all' : card.key)}
            className={cn(
              'rounded-2xl border p-4 text-left transition hover:shadow-sm',
              queueFilter === card.key ? card.tone : 'border-slate-200 bg-white text-slate-700',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{PAYHIP_QUEUE_META[card.key].label}</p>
            <p className="mt-2 text-3xl font-bold">{card.count}</p>
          </button>
        ))}
      </div>
    </section>
  );
});

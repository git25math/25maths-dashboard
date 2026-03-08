import { memo } from 'react';
import { PAYHIP_HEALTH_META, PayhipHealthKey } from '../../lib/payhipUtils';
import { cn } from '../../lib/utils';

interface HealthCard {
  key: PayhipHealthKey;
  count: number;
  tone: string;
}

interface PayhipHealthWatchProps {
  healthCards: HealthCard[];
  healthFilter: 'all' | PayhipHealthKey;
  onHealthFilterChange: (key: 'all' | PayhipHealthKey) => void;
}

export const PayhipHealthWatch = memo(function PayhipHealthWatch({
  healthCards,
  healthFilter,
  onHealthFilterChange,
}: PayhipHealthWatchProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Health Watch</p>
        {healthFilter !== 'all' && (
          <button type="button" onClick={() => onHealthFilterChange('all')} className="text-xs font-bold text-slate-400 transition hover:text-slate-600">
            Clear Health Filter
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {healthCards.map(card => (
          <button
            key={card.key}
            type="button"
            onClick={() => onHealthFilterChange(healthFilter === card.key ? 'all' : card.key)}
            className={cn(
              'rounded-2xl border p-4 text-left transition hover:shadow-sm',
              healthFilter === card.key ? card.tone : 'border-slate-200 bg-white text-slate-700',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{PAYHIP_HEALTH_META[card.key].label}</p>
            <p className="mt-2 text-3xl font-bold">{card.count}</p>
          </button>
        ))}
      </div>
    </section>
  );
});

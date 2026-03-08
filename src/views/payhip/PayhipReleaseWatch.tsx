import { memo } from 'react';
import { cn } from '../../lib/utils';

type ReleaseFocus = 'all' | 'releasing_soon' | 'overdue' | 'early_bird';

const RELEASE_FOCUS_LABELS: Record<Exclude<ReleaseFocus, 'all'>, string> = {
  releasing_soon: 'Release In 7 Days',
  overdue: 'Past Release / Not Synced',
  early_bird: 'Early Bird Ends In 7 Days',
};

interface PayhipReleaseWatchProps {
  releasingSoon: number;
  overdue: number;
  earlyBird: number;
  releaseFocus: ReleaseFocus;
  onReleaseFocusChange: (focus: ReleaseFocus) => void;
}

export const PayhipReleaseWatch = memo(function PayhipReleaseWatch({
  releasingSoon,
  overdue,
  earlyBird,
  releaseFocus,
  onReleaseFocusChange,
}: PayhipReleaseWatchProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Release Watch</p>
        {releaseFocus !== 'all' && (
          <button type="button" onClick={() => onReleaseFocusChange('all')} className="text-xs font-bold text-slate-400 transition hover:text-slate-600">
            Clear Release Focus
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onReleaseFocusChange(releaseFocus === 'releasing_soon' ? 'all' : 'releasing_soon')}
          className={cn(
            'rounded-2xl border p-4 text-left transition hover:shadow-sm',
            releaseFocus === 'releasing_soon' ? 'border-violet-200 bg-violet-50/70 text-violet-700' : 'border-slate-200 bg-white text-slate-700',
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{RELEASE_FOCUS_LABELS.releasing_soon}</p>
          <p className="mt-2 text-3xl font-bold">{releasingSoon}</p>
        </button>
        <button
          type="button"
          onClick={() => onReleaseFocusChange(releaseFocus === 'overdue' ? 'all' : 'overdue')}
          className={cn(
            'rounded-2xl border p-4 text-left transition hover:shadow-sm',
            releaseFocus === 'overdue' ? 'border-rose-200 bg-rose-50/70 text-rose-700' : 'border-slate-200 bg-white text-slate-700',
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{RELEASE_FOCUS_LABELS.overdue}</p>
          <p className="mt-2 text-3xl font-bold">{overdue}</p>
        </button>
        <button
          type="button"
          onClick={() => onReleaseFocusChange(releaseFocus === 'early_bird' ? 'all' : 'early_bird')}
          className={cn(
            'rounded-2xl border p-4 text-left transition hover:shadow-sm',
            releaseFocus === 'early_bird' ? 'border-fuchsia-200 bg-fuchsia-50/70 text-fuchsia-700' : 'border-slate-200 bg-white text-slate-700',
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{RELEASE_FOCUS_LABELS.early_bird}</p>
          <p className="mt-2 text-3xl font-bold">{earlyBird}</p>
        </button>
      </div>
    </section>
  );
});

export { RELEASE_FOCUS_LABELS };
export type { ReleaseFocus };

import { ReactNode } from 'react';
import { cn } from '../lib/utils';

type FilterChipTone = 'indigo' | 'teal' | 'emerald' | 'violet';

type FilterChipSize = 'xs' | 'sm';

const ACTIVE_STYLES: Record<FilterChipTone, string> = {
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
  teal: 'bg-teal-50 border-teal-200 text-teal-600',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  violet: 'bg-violet-50 border-violet-200 text-violet-600',
};

const SIZE_STYLES: Record<FilterChipSize, string> = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
};

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: FilterChipTone;
  size?: FilterChipSize;
  className?: string;
}

export function FilterChip({
  active,
  onClick,
  children,
  tone = 'indigo',
  size = 'xs',
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg font-bold border transition-all active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-indigo-500',
        SIZE_STYLES[size],
        active
          ? cn(ACTIVE_STYLES[tone], 'shadow-sm')
          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300',
        className,
      )}
    >
      {children}
    </button>
  );
}

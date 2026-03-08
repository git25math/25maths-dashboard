import { memo } from 'react';
import { cn } from '../lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  tone?: string;
}

export const StatCard = memo(function StatCard({ label, value, tone = 'text-slate-900' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={cn('mt-2 text-3xl font-bold', tone)}>{value}</p>
    </div>
  );
});

import { memo } from 'react';
import { Download } from 'lucide-react';
import { StatCard } from '../../components/StatCard';

interface PayhipStatsHeaderProps {
  total: number;
  created: number;
  live: number;
  needsBackfill: number;
  filteredCount: number;
  onExportCsv: () => void;
}

export const PayhipStatsHeader = memo(function PayhipStatsHeader({
  total,
  created,
  live,
  needsBackfill,
  filteredCount,
  onExportCsv,
}: PayhipStatsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total SKUs" value={total} />
        <StatCard label="Payhip Created" value={created} tone="text-emerald-600" />
        <StatCard label="Live / Sample" value={live} tone="text-sky-600" />
        <StatCard label="Need URL Sync" value={needsBackfill} tone="text-amber-600" />
      </div>
      <button
        type="button"
        onClick={onExportCsv}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
      >
        <Download size={14} />
        Export Visible CSV ({filteredCount})
      </button>
    </div>
  );
});

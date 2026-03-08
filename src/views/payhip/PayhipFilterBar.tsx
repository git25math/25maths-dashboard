import { memo } from 'react';
import { ArrowDownAZ, CalendarClock, Search } from 'lucide-react';
import { PAYHIP_HEALTH_META, PAYHIP_QUEUE_META, PAYHIP_STATUS_LABELS, PayhipHealthKey, PayhipQueueKey } from '../../lib/payhipUtils';
import { FilterChip } from '../../components/FilterChip';
import { PayhipBoard, PayhipLevel, PayhipStatus } from '../../types';
import { RELEASE_FOCUS_LABELS, ReleaseFocus } from './PayhipReleaseWatch';

type BoardFilter = 'all' | PayhipBoard;
type LevelFilter = 'all' | PayhipLevel;
type StatusFilter = 'all' | PayhipStatus;
type SortMode = 'sku' | 'release' | 'updated';
type QueueFilter = 'all' | PayhipQueueKey;
type HealthFilter = 'all' | PayhipHealthKey;

const BOARD_OPTIONS: { key: BoardFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cie0580', label: 'CIE 0580' },
  { key: 'edexcel-4ma1', label: '4MA1' },
];

const LEVEL_OPTIONS: { key: LevelFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'L1', label: 'L1' },
  { key: 'L2', label: 'L2' },
  { key: 'L3', label: 'L3' },
  { key: 'L4', label: 'L4' },
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'planned', label: PAYHIP_STATUS_LABELS.planned },
  { key: 'presale', label: PAYHIP_STATUS_LABELS.presale },
  { key: 'live', label: PAYHIP_STATUS_LABELS.live },
  { key: 'free_sample_live', label: PAYHIP_STATUS_LABELS.free_sample_live },
  { key: 'archived', label: PAYHIP_STATUS_LABELS.archived },
];

interface PayhipFilterBarProps {
  search: string;
  boardFilter: BoardFilter;
  levelFilter: LevelFilter;
  statusFilter: StatusFilter;
  sortMode: SortMode;
  queueFilter: QueueFilter;
  releaseFocus: ReleaseFocus;
  healthFilter: HealthFilter;
  onSearchChange: (v: string) => void;
  onBoardFilterChange: (v: BoardFilter) => void;
  onLevelFilterChange: (v: LevelFilter) => void;
  onStatusFilterChange: (v: StatusFilter) => void;
  onSortModeChange: (v: SortMode) => void;
  onQueueFilterChange: (v: QueueFilter) => void;
  onReleaseFocusChange: (v: ReleaseFocus) => void;
  onHealthFilterChange: (v: HealthFilter) => void;
}

export const PayhipFilterBar = memo(function PayhipFilterBar({
  search,
  boardFilter,
  levelFilter,
  statusFilter,
  sortMode,
  queueFilter,
  releaseFocus,
  healthFilter,
  onSearchChange,
  onBoardFilterChange,
  onLevelFilterChange,
  onStatusFilterChange,
  onSortModeChange,
  onQueueFilterChange,
  onReleaseFocusChange,
  onHealthFilterChange,
}: PayhipFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Board</span>
          {BOARD_OPTIONS.map(option => (
            <FilterChip key={option.key} active={boardFilter === option.key} onClick={() => onBoardFilterChange(option.key)}>
              {option.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Level</span>
          {LEVEL_OPTIONS.map(option => (
            <FilterChip key={option.key} active={levelFilter === option.key} onClick={() => onLevelFilterChange(option.key)} tone="emerald">
              {option.label}
            </FilterChip>
          ))}
        </div>

        <label className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search SKU, title, unit, tags..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Status</span>
          {STATUS_OPTIONS.map(option => (
            <FilterChip key={option.key} active={statusFilter === option.key} onClick={() => onStatusFilterChange(option.key)} tone="teal">
              {option.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sort</span>
          <FilterChip active={sortMode === 'sku'} onClick={() => onSortModeChange('sku')} tone="indigo">
            <ArrowDownAZ size={12} className="mr-1 inline" />SKU
          </FilterChip>
          <FilterChip active={sortMode === 'release'} onClick={() => onSortModeChange('release')} tone="indigo">
            <CalendarClock size={12} className="mr-1 inline" />Release
          </FilterChip>
          <FilterChip active={sortMode === 'updated'} onClick={() => onSortModeChange('updated')} tone="indigo">
            Updated
          </FilterChip>
        </div>

        {healthFilter !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Health</span>
            <FilterChip active tone="rose" onClick={() => onHealthFilterChange('all')}>
              {PAYHIP_HEALTH_META[healthFilter].label}
            </FilterChip>
          </div>
        )}

        {queueFilter !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Queue</span>
            <FilterChip active tone="rose" onClick={() => onQueueFilterChange('all')}>
              {PAYHIP_QUEUE_META[queueFilter].label}
            </FilterChip>
          </div>
        )}

        {releaseFocus !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Release</span>
            <FilterChip active tone="indigo" onClick={() => onReleaseFocusChange('all')}>
              {RELEASE_FOCUS_LABELS[releaseFocus]}
            </FilterChip>
          </div>
        )}
      </div>
    </div>
  );
});

export type { BoardFilter, LevelFilter, StatusFilter, SortMode, QueueFilter, HealthFilter };

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, CalendarClock, Download, Search } from 'lucide-react';
import {
  getEffectivePayhipPipeline,
  hasPayhipHealthAutoFix,
  isPayhipPipelineStageLocked,
  matchesPayhipHealth,
  matchesPayhipQueue,
  PAYHIP_HEALTH_META,
  PAYHIP_QUEUE_META,
  PAYHIP_STATUS_LABELS,
  PayhipHealthKey,
  PayhipQueueKey,
} from '../../lib/payhipUtils';
import { FilterChip } from '../../components/FilterChip';
import { StatCard } from '../../components/StatCard';
import { cn } from '../../lib/utils';
import { PAYHIP_PIPELINE_STAGES, PayhipBoard, PayhipItem, PayhipLevel, PayhipPipelineStage, PayhipStatus } from '../../types';
import { PayhipCard } from './PayhipCard';

type BoardFilter = 'all' | PayhipBoard;
type LevelFilter = 'all' | PayhipLevel;
type StatusFilter = 'all' | PayhipStatus;
type SortMode = 'sku' | 'release' | 'updated';
type QueueFilter = 'all' | PayhipQueueKey;
type ReleaseFocus = 'all' | 'releasing_soon' | 'overdue' | 'early_bird';
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

const BATCH_STATUS_OPTIONS: { key: PayhipStatus; label: string }[] = STATUS_OPTIONS
  .filter((option): option is { key: PayhipStatus; label: string } => option.key !== 'all');

const LEVEL_ORDER: Record<PayhipLevel, number> = { L1: 1, L2: 2, L3: 3, L4: 4 };

const RELEASE_FOCUS_LABELS: Record<Exclude<ReleaseFocus, 'all'>, string> = {
  releasing_soon: 'Release In 7 Days',
  overdue: 'Past Release / Not Synced',
  early_bird: 'Early Bird Ends In 7 Days',
};

const QUEUE_KEYS = Object.keys(PAYHIP_QUEUE_META) as PayhipQueueKey[];
const HEALTH_KEYS = Object.keys(PAYHIP_HEALTH_META) as PayhipHealthKey[];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getDateWindow() {
  const now = new Date();
  return {
    todayKey: formatDateKey(now),
    nextWeekKey: formatDateKey(addDays(now, 7)),
  };
}


interface PayhipLibraryProps {
  items: PayhipItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onVisibleIdsChange?: (ids: string[]) => void;
  onOpenFirstVisible?: () => void;
  onAdvanceQueue?: (queue: PayhipQueueKey, ids: string[]) => Promise<void>;
  advancingQueue?: PayhipQueueKey | null;
  onResolveHealth?: (health: PayhipHealthKey, ids: string[]) => Promise<void>;
  resolvingHealth?: PayhipHealthKey | null;
  onBatchStatus?: (status: PayhipStatus, ids: string[]) => Promise<void>;
  onBatchPipeline?: (stage: PayhipPipelineStage, value: boolean, ids: string[]) => Promise<void>;
  batchingVisible?: boolean;
}

export function PayhipLibrary({
  items,
  selectedId,
  onSelect,
  onVisibleIdsChange,
  onOpenFirstVisible,
  onAdvanceQueue,
  advancingQueue = null,
  onResolveHealth,
  resolvingHealth = null,
  onBatchStatus,
  onBatchPipeline,
  batchingVisible = false,
}: PayhipLibraryProps) {
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('sku');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [releaseFocus, setReleaseFocus] = useState<ReleaseFocus>('all');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');
  const [batchStatus, setBatchStatus] = useState<PayhipStatus>('presale');
  const [batchStage, setBatchStage] = useState<PayhipPipelineStage>('payhip_created');
  const [{ todayKey, nextWeekKey }, setDateWindow] = useState(getDateWindow);

  useEffect(() => {
    let timeoutId: number | undefined;

    const refreshDateWindow = () => setDateWindow(getDateWindow());
    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 5, 0);
      timeoutId = window.setTimeout(() => {
        refreshDateWindow();
        scheduleMidnightRefresh();
      }, nextMidnight.getTime() - now.getTime());
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) refreshDateWindow();
    };

    scheduleMidnightRefresh();
    window.addEventListener('focus', refreshDateWindow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      window.removeEventListener('focus', refreshDateWindow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const stats = useMemo(() => ({
    total: items.length,
    created: items.filter(item => getEffectivePayhipPipeline(item).payhip_created).length,
    live: items.filter(item => item.status === 'live' || item.status === 'free_sample_live').length,
    needsBackfill: items.filter(item => !getEffectivePayhipPipeline(item).url_backfilled).length,
  }), [items]);

  const queueStats = useMemo(() => {
    return QUEUE_KEYS.reduce((acc, key) => {
      acc[key] = items.filter(item => matchesPayhipQueue(item, key)).length;
      return acc;
    }, {} as Record<PayhipQueueKey, number>);
  }, [items]);

  const healthStats = useMemo(() => {
    return HEALTH_KEYS.reduce((acc, key) => {
      acc[key] = items.filter(item => matchesPayhipHealth(item, key, todayKey)).length;
      return acc;
    }, {} as Record<PayhipHealthKey, number>);
  }, [items, todayKey]);

  const releaseWatch = useMemo(() => ({
    releasingSoon: items.filter(item => Boolean(item.release_date) && item.release_date! >= todayKey && item.release_date! <= nextWeekKey).length,
    overdue: items.filter(item => matchesPayhipHealth(item, 'release_overdue', todayKey)).length,
    earlyBird: items.filter(item => Boolean(item.early_bird_end_date) && item.early_bird_end_date! >= todayKey && item.early_bird_end_date! <= nextWeekKey && item.status === 'presale').length,
  }), [items, nextWeekKey, todayKey]);

  const matchesQueue = (item: PayhipItem) => {
    if (queueFilter === 'all') return true;
    return matchesPayhipQueue(item, queueFilter);
  };

  const matchesReleaseFocus = (item: PayhipItem) => {
    switch (releaseFocus) {
      case 'releasing_soon':
        return Boolean(item.release_date) && item.release_date! >= todayKey && item.release_date! <= nextWeekKey;
      case 'overdue':
        return matchesPayhipHealth(item, 'release_overdue', todayKey);
      case 'early_bird':
        return Boolean(item.early_bird_end_date) && item.early_bird_end_date! >= todayKey && item.early_bird_end_date! <= nextWeekKey && item.status === 'presale';
      default:
        return true;
    }
  };

  const matchesHealth = (item: PayhipItem) => {
    if (healthFilter === 'all') return true;
    return matchesPayhipHealth(item, healthFilter, todayKey);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items
      .filter(item => boardFilter === 'all' || item.board === boardFilter)
      .filter(item => levelFilter === 'all' || item.level === levelFilter)
      .filter(item => statusFilter === 'all' || item.status === statusFilter)
      .filter(matchesQueue)
      .filter(matchesReleaseFocus)
      .filter(matchesHealth)
      .filter(item => {
        if (!q) return true;
        return [
          item.sku,
          item.listing_title,
          item.subtopic_title || '',
          item.section_title || '',
          item.unit_title || '',
          item.tier_scope,
          item.tags.join(' '),
        ].join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortMode === 'updated') return b.updated_at.localeCompare(a.updated_at);
        if (sortMode === 'release') return (a.release_date || '9999-12-31').localeCompare(b.release_date || '9999-12-31') || a.sku.localeCompare(b.sku);
        return LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || a.sku.localeCompare(b.sku);
      });
  }, [items, boardFilter, healthFilter, levelFilter, nextWeekKey, queueFilter, releaseFocus, search, sortMode, statusFilter, todayKey]);

  const batchStageLabel = PAYHIP_PIPELINE_STAGES.find(stage => stage.key === batchStage)?.label || batchStage;
  const resetLockedCount = useMemo(
    () => filtered.filter(item => isPayhipPipelineStageLocked(item, batchStage)).length,
    [batchStage, filtered],
  );
  const resetEligibleCount = filtered.length - resetLockedCount;

  useEffect(() => {
    onVisibleIdsChange?.(filtered.map(item => item.id));
  }, [filtered, onVisibleIdsChange]);

  const hasFilters = (
    search.trim().length > 0
    || boardFilter !== 'all'
    || levelFilter !== 'all'
    || statusFilter !== 'all'
    || queueFilter !== 'all'
    || releaseFocus !== 'all'
    || healthFilter !== 'all'
    || sortMode !== 'sku'
  );

  const resetFilters = useCallback(() => {
    setSearch('');
    setBoardFilter('all');
    setLevelFilter('all');
    setStatusFilter('all');
    setQueueFilter('all');
    setReleaseFocus('all');
    setHealthFilter('all');
    setSortMode('sku');
  }, []);

  const exportVisibleCsv = useCallback(() => {
    const headers = [
      'sku',
      'level',
      'board',
      'status',
      'listing_title',
      'payhip_url',
      'release_date',
      'early_bird_end_date',
      'unit_code',
      'section_code',
      'subtopic_code',
      'tags',
      'notes',
    ];

    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = filtered.map(item => [
      item.sku,
      item.level,
      item.board,
      item.status,
      item.listing_title,
      item.payhip_url || '',
      item.release_date || '',
      item.early_bird_end_date || '',
      item.unit_code || '',
      item.section_code || '',
      item.subtopic_code || '',
      item.tags.join(','),
      item.notes || '',
    ].map(value => escape(String(value))).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payhip-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const queueCards = QUEUE_KEYS.map(key => ({
    key,
    count: queueStats[key],
    tone: key === 'create'
      ? 'border-indigo-200 bg-indigo-50/60 text-indigo-700'
      : key === 'backfill'
        ? 'border-amber-200 bg-amber-50/60 text-amber-700'
        : key === 'qa'
          ? 'border-sky-200 bg-sky-50/60 text-sky-700'
          : 'border-emerald-200 bg-emerald-50/60 text-emerald-700',
  }));

  const healthCards = HEALTH_KEYS.map(key => ({
    key,
    count: healthStats[key],
    tone: key === 'sellable_missing_url'
      ? 'border-rose-200 bg-rose-50/70 text-rose-700'
      : key === 'release_overdue'
        ? 'border-orange-200 bg-orange-50/70 text-orange-700'
        : key === 'live_without_qa'
          ? 'border-sky-200 bg-sky-50/70 text-sky-700'
          : 'border-slate-300 bg-slate-100 text-slate-700',
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total SKUs" value={stats.total} />
          <StatCard label="Payhip Created" value={stats.created} tone="text-emerald-600" />
          <StatCard label="Live / Sample" value={stats.live} tone="text-sky-600" />
          <StatCard label="Need URL Sync" value={stats.needsBackfill} tone="text-amber-600" />
        </div>
        <button
          type="button"
          onClick={exportVisibleCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          <Download size={14} />
          Export Visible CSV ({filtered.length})
        </button>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Health Watch</p>
          {healthFilter !== 'all' && (
            <button type="button" onClick={() => setHealthFilter('all')} className="text-xs font-bold text-slate-400 transition hover:text-slate-600">
              Clear Health Filter
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {healthCards.map(card => (
            <button
              key={card.key}
              type="button"
              onClick={() => setHealthFilter(prev => prev === card.key ? 'all' : card.key)}
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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Release Watch</p>
          {releaseFocus !== 'all' && (
            <button type="button" onClick={() => setReleaseFocus('all')} className="text-xs font-bold text-slate-400 transition hover:text-slate-600">
              Clear Release Focus
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setReleaseFocus(prev => prev === 'releasing_soon' ? 'all' : 'releasing_soon')}
            className={cn(
              'rounded-2xl border p-4 text-left transition hover:shadow-sm',
              releaseFocus === 'releasing_soon' ? 'border-violet-200 bg-violet-50/70 text-violet-700' : 'border-slate-200 bg-white text-slate-700',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{RELEASE_FOCUS_LABELS.releasing_soon}</p>
            <p className="mt-2 text-3xl font-bold">{releaseWatch.releasingSoon}</p>
          </button>
          <button
            type="button"
            onClick={() => setReleaseFocus(prev => prev === 'overdue' ? 'all' : 'overdue')}
            className={cn(
              'rounded-2xl border p-4 text-left transition hover:shadow-sm',
              releaseFocus === 'overdue' ? 'border-rose-200 bg-rose-50/70 text-rose-700' : 'border-slate-200 bg-white text-slate-700',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{RELEASE_FOCUS_LABELS.overdue}</p>
            <p className="mt-2 text-3xl font-bold">{releaseWatch.overdue}</p>
          </button>
          <button
            type="button"
            onClick={() => setReleaseFocus(prev => prev === 'early_bird' ? 'all' : 'early_bird')}
            className={cn(
              'rounded-2xl border p-4 text-left transition hover:shadow-sm',
              releaseFocus === 'early_bird' ? 'border-fuchsia-200 bg-fuchsia-50/70 text-fuchsia-700' : 'border-slate-200 bg-white text-slate-700',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{RELEASE_FOCUS_LABELS.early_bird}</p>
            <p className="mt-2 text-3xl font-bold">{releaseWatch.earlyBird}</p>
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Ops Queue</p>
          {queueFilter !== 'all' && (
            <button type="button" onClick={() => setQueueFilter('all')} className="text-xs font-bold text-slate-400 transition hover:text-slate-600">
              Clear Queue Filter
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {queueCards.map(card => (
            <button
              key={card.key}
              type="button"
              onClick={() => setQueueFilter(prev => prev === card.key ? 'all' : card.key)}
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

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Board</span>
            {BOARD_OPTIONS.map(option => (
              <FilterChip key={option.key} active={boardFilter === option.key} onClick={() => setBoardFilter(option.key)}>
                {option.label}
              </FilterChip>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Level</span>
            {LEVEL_OPTIONS.map(option => (
              <FilterChip key={option.key} active={levelFilter === option.key} onClick={() => setLevelFilter(option.key)} tone="emerald">
                {option.label}
              </FilterChip>
            ))}
          </div>

          <label className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search SKU, title, unit, tags..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Status</span>
            {STATUS_OPTIONS.map(option => (
              <FilterChip key={option.key} active={statusFilter === option.key} onClick={() => setStatusFilter(option.key)} tone="teal">
                {option.label}
              </FilterChip>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sort</span>
            <FilterChip active={sortMode === 'sku'} onClick={() => setSortMode('sku')} tone="indigo">
              <ArrowDownAZ size={12} className="mr-1 inline" />SKU
            </FilterChip>
            <FilterChip active={sortMode === 'release'} onClick={() => setSortMode('release')} tone="indigo">
              <CalendarClock size={12} className="mr-1 inline" />Release
            </FilterChip>
            <FilterChip active={sortMode === 'updated'} onClick={() => setSortMode('updated')} tone="indigo">
              Updated
            </FilterChip>
          </div>

          {healthFilter !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Health</span>
              <FilterChip active tone="rose" onClick={() => setHealthFilter('all')}>
                {PAYHIP_HEALTH_META[healthFilter].label}
              </FilterChip>
            </div>
          )}

          {queueFilter !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Queue</span>
              <FilterChip active tone="rose" onClick={() => setQueueFilter('all')}>
                {PAYHIP_QUEUE_META[queueFilter].label}
              </FilterChip>
            </div>
          )}

          {releaseFocus !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Release</span>
              <FilterChip active tone="indigo" onClick={() => setReleaseFocus('all')}>
                {RELEASE_FOCUS_LABELS[releaseFocus]}
              </FilterChip>
            </div>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">Showing {filtered.length} of {items.length} listings</p>
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
              onClick={() => onOpenFirstVisible?.()}
              disabled={filtered.length === 0}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-bold transition',
                filtered.length === 0 ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-700',
              )}
            >
              Open First Visible
            </button>

            {queueFilter !== 'all' && onAdvanceQueue && filtered.length > 0 && (
              <button
                type="button"
                onClick={() => onAdvanceQueue(queueFilter, filtered.map(item => item.id))}
                disabled={advancingQueue !== null || resolvingHealth !== null || batchingVisible}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-bold transition',
                  advancingQueue !== null || resolvingHealth !== null || batchingVisible ? 'cursor-wait bg-emerald-100 text-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700',
                )}
              >
                {advancingQueue === queueFilter ? 'Updating...' : `${PAYHIP_QUEUE_META[queueFilter].buttonLabel} (${filtered.length})`}
              </button>
            )}

            {healthFilter !== 'all' && onResolveHealth && hasPayhipHealthAutoFix(healthFilter) && filtered.length > 0 && (
              <button
                type="button"
                onClick={() => onResolveHealth(healthFilter, filtered.map(item => item.id))}
                disabled={advancingQueue !== null || resolvingHealth !== null || batchingVisible}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-bold transition',
                  advancingQueue !== null || resolvingHealth !== null || batchingVisible ? 'cursor-wait bg-rose-100 text-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700',
                )}
              >
                {resolvingHealth === healthFilter ? 'Resolving...' : `${PAYHIP_HEALTH_META[healthFilter].buttonLabel} (${filtered.length})`}
              </button>
            )}

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </section>

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
                  onChange={e => setBatchStatus(e.target.value as PayhipStatus)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                >
                  {BATCH_STATUS_OPTIONS.map(option => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onBatchStatus?.(batchStatus, filtered.map(item => item.id))}
                  disabled={filtered.length === 0 || batchingVisible || advancingQueue !== null || resolvingHealth !== null}
                  className={cn(
                    'rounded-xl px-4 py-2.5 text-sm font-bold transition',
                    filtered.length === 0 || batchingVisible || advancingQueue !== null || resolvingHealth !== null
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'bg-slate-900 text-white hover:bg-slate-700',
                  )}
                >
                  {batchingVisible ? 'Applying...' : `Set ${filtered.length} To ${PAYHIP_STATUS_LABELS[batchStatus]}`}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Visible Pipeline Stage</p>
              <div className="mt-3 space-y-3">
                <select
                  value={batchStage}
                  onChange={e => setBatchStage(e.target.value as PayhipPipelineStage)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                >
                  {PAYHIP_PIPELINE_STAGES.map(stage => (
                    <option key={stage.key} value={stage.key}>{stage.label}</option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onBatchPipeline?.(batchStage, true, filtered.map(item => item.id))}
                    disabled={filtered.length === 0 || batchingVisible || advancingQueue !== null || resolvingHealth !== null}
                    className={cn(
                      'rounded-xl px-4 py-2.5 text-sm font-bold transition',
                      filtered.length === 0 || batchingVisible || advancingQueue !== null || resolvingHealth !== null
                        ? 'cursor-not-allowed bg-emerald-100 text-emerald-400'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700',
                    )}
                  >
                    {batchingVisible ? 'Applying...' : `Mark ${filtered.length} Done`}
                  </button>
                  <button
                    type="button"
                    onClick={() => onBatchPipeline?.(batchStage, false, filtered.map(item => item.id))}
                    disabled={resetEligibleCount === 0 || batchingVisible || advancingQueue !== null || resolvingHealth !== null}
                    className={cn(
                      'rounded-xl px-4 py-2.5 text-sm font-bold transition',
                      resetEligibleCount === 0 || batchingVisible || advancingQueue !== null || resolvingHealth !== null
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

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-slate-400">
          No Payhip listings match the current filters.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map(item => (
            <PayhipCard
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, CalendarClock, Download, Search } from 'lucide-react';
import { FilterChip } from '../../components/FilterChip';
import { matchesPayhipQueue, PAYHIP_QUEUE_META, PAYHIP_STATUS_LABELS, PayhipQueueKey } from '../../lib/payhipUtils';
import { cn } from '../../lib/utils';
import { PayhipBoard, PayhipItem, PayhipLevel, PayhipStatus } from '../../types';
import { PayhipCard } from './PayhipCard';

type BoardFilter = 'all' | PayhipBoard;
type LevelFilter = 'all' | PayhipLevel;
type StatusFilter = 'all' | PayhipStatus;
type SortMode = 'sku' | 'release' | 'updated';
type QueueFilter = 'all' | PayhipQueueKey;
type ReleaseFocus = 'all' | 'releasing_soon' | 'overdue' | 'early_bird';

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

const LEVEL_ORDER: Record<PayhipLevel, number> = { L1: 1, L2: 2, L3: 3, L4: 4 };

const RELEASE_FOCUS_LABELS: Record<Exclude<ReleaseFocus, 'all'>, string> = {
  releasing_soon: 'Release In 7 Days',
  overdue: 'Past Release / Not Synced',
  early_bird: 'Early Bird Ends In 7 Days',
};

const QUEUE_KEYS = Object.keys(PAYHIP_QUEUE_META) as PayhipQueueKey[];

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

function StatCard({ label, value, tone = 'text-slate-900' }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={cn('mt-2 text-3xl font-bold', tone)}>{value}</p>
    </div>
  );
}

interface PayhipLibraryProps {
  items: PayhipItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onVisibleIdsChange?: (ids: string[]) => void;
  onOpenFirstVisible?: () => void;
  onAdvanceQueue?: (queue: PayhipQueueKey, ids: string[]) => Promise<void>;
  advancingQueue?: PayhipQueueKey | null;
}

export function PayhipLibrary({
  items,
  selectedId,
  onSelect,
  onVisibleIdsChange,
  onOpenFirstVisible,
  onAdvanceQueue,
  advancingQueue = null,
}: PayhipLibraryProps) {
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('sku');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [releaseFocus, setReleaseFocus] = useState<ReleaseFocus>('all');

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const nextWeekKey = useMemo(() => formatDateKey(addDays(new Date(), 7)), []);

  const stats = useMemo(() => ({
    total: items.length,
    created: items.filter(item => item.pipeline.payhip_created).length,
    live: items.filter(item => item.status === 'live' || item.status === 'free_sample_live').length,
    needsBackfill: items.filter(item => !item.pipeline.url_backfilled).length,
  }), [items]);

  const queueStats = useMemo(() => {
    return QUEUE_KEYS.reduce((acc, key) => {
      acc[key] = items.filter(item => matchesPayhipQueue(item, key)).length;
      return acc;
    }, {} as Record<PayhipQueueKey, number>);
  }, [items]);

  const releaseWatch = useMemo(() => ({
    releasingSoon: items.filter(item => Boolean(item.release_date) && item.release_date! >= todayKey && item.release_date! <= nextWeekKey).length,
    overdue: items.filter(item => Boolean(item.release_date) && item.release_date! < todayKey && !item.pipeline.site_synced && item.status !== 'archived').length,
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
        return Boolean(item.release_date) && item.release_date! < todayKey && !item.pipeline.site_synced && item.status !== 'archived';
      case 'early_bird':
        return Boolean(item.early_bird_end_date) && item.early_bird_end_date! >= todayKey && item.early_bird_end_date! <= nextWeekKey && item.status === 'presale';
      default:
        return true;
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items
      .filter(item => boardFilter === 'all' || item.board === boardFilter)
      .filter(item => levelFilter === 'all' || item.level === levelFilter)
      .filter(item => statusFilter === 'all' || item.status === statusFilter)
      .filter(matchesQueue)
      .filter(matchesReleaseFocus)
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
  }, [items, boardFilter, levelFilter, nextWeekKey, queueFilter, releaseFocus, search, sortMode, statusFilter, todayKey]);

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
    || sortMode !== 'sku'
  );

  const resetFilters = () => {
    setSearch('');
    setBoardFilter('all');
    setLevelFilter('all');
    setStatusFilter('all');
    setQueueFilter('all');
    setReleaseFocus('all');
    setSortMode('sku');
  };

  const exportVisibleCsv = () => {
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
  };

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
            {queueFilter !== 'all' ? (
              <p className="text-xs text-slate-500">{PAYHIP_QUEUE_META[queueFilter].detail}</p>
            ) : releaseFocus !== 'all' ? (
              <p className="text-xs text-slate-500">{RELEASE_FOCUS_LABELS[releaseFocus]}</p>
            ) : (
              <p className="text-xs text-slate-500">Use queue and release focus cards to narrow down the next batch of Payhip work.</p>
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
                disabled={advancingQueue !== null}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-bold transition',
                  advancingQueue !== null ? 'cursor-wait bg-emerald-100 text-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700',
                )}
              >
                {advancingQueue === queueFilter ? 'Updating...' : `${PAYHIP_QUEUE_META[queueFilter].buttonLabel} (${filtered.length})`}
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

      {filtered.length === 0 ? (
        <div className="glass-card border-dashed p-12 text-center text-slate-400">
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

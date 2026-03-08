import { useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, CalendarClock, Download, Search } from 'lucide-react';
import { FilterChip } from '../../components/FilterChip';
import { cn } from '../../lib/utils';
import { PAYHIP_STATUS_LABELS } from '../../lib/payhipUtils';
import { PayhipBoard, PayhipItem, PayhipLevel, PayhipStatus } from '../../types';
import { PayhipCard } from './PayhipCard';

type BoardFilter = 'all' | PayhipBoard;
type LevelFilter = 'all' | PayhipLevel;
type StatusFilter = 'all' | PayhipStatus;
type SortMode = 'sku' | 'release' | 'updated';
type QueueFilter = 'all' | 'create' | 'backfill' | 'qa' | 'sync';

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

const QUEUE_LABELS: Record<QueueFilter, string> = {
  all: 'All',
  create: 'Ready To Create',
  backfill: 'Need URL Backfill',
  qa: 'Ready For QA',
  sync: 'Ready To Sync',
};

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
}

export function PayhipLibrary({ items, selectedId, onSelect, onVisibleIdsChange }: PayhipLibraryProps) {
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('sku');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');

  const stats = useMemo(() => ({
    total: items.length,
    created: items.filter(item => item.pipeline.payhip_created).length,
    live: items.filter(item => item.status === 'live' || item.status === 'free_sample_live').length,
    needsBackfill: items.filter(item => !item.pipeline.url_backfilled).length,
  }), [items]);

  const queueStats = useMemo(() => ({
    create: items.filter(item => item.pipeline.copy_ready && !item.pipeline.payhip_created).length,
    backfill: items.filter(item => item.pipeline.payhip_created && !item.pipeline.url_backfilled).length,
    qa: items.filter(item => item.pipeline.url_backfilled && !item.pipeline.qa_verified).length,
    sync: items.filter(item => item.pipeline.qa_verified && !item.pipeline.site_synced).length,
  }), [items]);

  const matchesQueue = (item: PayhipItem) => {
    switch (queueFilter) {
      case 'create':
        return item.pipeline.copy_ready && !item.pipeline.payhip_created;
      case 'backfill':
        return item.pipeline.payhip_created && !item.pipeline.url_backfilled;
      case 'qa':
        return item.pipeline.url_backfilled && !item.pipeline.qa_verified;
      case 'sync':
        return item.pipeline.qa_verified && !item.pipeline.site_synced;
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
  }, [items, boardFilter, levelFilter, queueFilter, search, sortMode, statusFilter]);

  useEffect(() => {
    onVisibleIdsChange?.(filtered.map(item => item.id));
  }, [filtered, onVisibleIdsChange]);

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

  const queueCards: { key: Exclude<QueueFilter, 'all'>; count: number; tone: string }[] = [
    { key: 'create', count: queueStats.create, tone: 'border-indigo-200 bg-indigo-50/60 text-indigo-700' },
    { key: 'backfill', count: queueStats.backfill, tone: 'border-amber-200 bg-amber-50/60 text-amber-700' },
    { key: 'qa', count: queueStats.qa, tone: 'border-sky-200 bg-sky-50/60 text-sky-700' },
    { key: 'sync', count: queueStats.sync, tone: 'border-emerald-200 bg-emerald-50/60 text-emerald-700' },
  ];

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
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{QUEUE_LABELS[card.key]}</p>
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
                {QUEUE_LABELS[queueFilter]}
              </FilterChip>
            </div>
          )}
        </div>
      </div>

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

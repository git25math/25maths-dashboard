import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatDateKey,
  getEffectivePayhipPipeline,
  isPayhipPipelineStageLocked,
  matchesPayhipHealth,
  matchesPayhipQueue,
  PAYHIP_HEALTH_META,
  PAYHIP_QUEUE_META,
  PayhipHealthKey,
  PayhipQueueKey,
} from '../../lib/payhipUtils';
import { PAYHIP_PIPELINE_STAGES, PayhipItem, PayhipPipelineStage, PayhipStatus } from '../../types';
import { PayhipStatsHeader } from './PayhipStatsHeader';
import { PayhipHealthWatch } from './PayhipHealthWatch';
import { PayhipReleaseWatch, ReleaseFocus } from './PayhipReleaseWatch';
import { PayhipOpsQueue } from './PayhipOpsQueue';
import { PayhipFilterBar, BoardFilter, LevelFilter, StatusFilter, SortMode, QueueFilter, HealthFilter } from './PayhipFilterBar';
import { PayhipActionBar } from './PayhipActionBar';
import { PayhipBatchOps } from './PayhipBatchOps';
import { PayhipGrid } from './PayhipGrid';

const LEVEL_ORDER: Record<string, number> = { L1: 1, L2: 2, L3: 3, L4: 4 };

const QUEUE_KEYS = Object.keys(PAYHIP_QUEUE_META) as PayhipQueueKey[];
const HEALTH_KEYS = Object.keys(PAYHIP_HEALTH_META) as PayhipHealthKey[];

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items
      .filter(item => boardFilter === 'all' || item.board === boardFilter)
      .filter(item => levelFilter === 'all' || item.level === levelFilter)
      .filter(item => statusFilter === 'all' || item.status === statusFilter)
      .filter(item => {
        if (queueFilter === 'all') return true;
        return matchesPayhipQueue(item, queueFilter);
      })
      .filter(item => {
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
      })
      .filter(item => {
        if (healthFilter === 'all') return true;
        return matchesPayhipHealth(item, healthFilter, todayKey);
      })
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

  const queueCards = useMemo(() => QUEUE_KEYS.map(key => ({
    key,
    count: queueStats[key],
    tone: key === 'create'
      ? 'border-indigo-200 bg-indigo-50/60 text-indigo-700'
      : key === 'backfill'
        ? 'border-amber-200 bg-amber-50/60 text-amber-700'
        : key === 'qa'
          ? 'border-sky-200 bg-sky-50/60 text-sky-700'
          : 'border-emerald-200 bg-emerald-50/60 text-emerald-700',
  })), [queueStats]);

  const healthCards = useMemo(() => HEALTH_KEYS.map(key => ({
    key,
    count: healthStats[key],
    tone: key === 'sellable_missing_url'
      ? 'border-rose-200 bg-rose-50/70 text-rose-700'
      : key === 'release_overdue'
        ? 'border-orange-200 bg-orange-50/70 text-orange-700'
        : key === 'live_without_qa'
          ? 'border-sky-200 bg-sky-50/70 text-sky-700'
          : 'border-slate-300 bg-slate-100 text-slate-700',
  })), [healthStats]);

  const filteredIds = useMemo(() => filtered.map(item => item.id), [filtered]);

  return (
    <div className="space-y-8">
      <PayhipStatsHeader
        total={stats.total}
        created={stats.created}
        live={stats.live}
        needsBackfill={stats.needsBackfill}
        filteredCount={filtered.length}
        onExportCsv={exportVisibleCsv}
      />

      <PayhipHealthWatch
        healthCards={healthCards}
        healthFilter={healthFilter}
        onHealthFilterChange={setHealthFilter}
      />

      <PayhipReleaseWatch
        releasingSoon={releaseWatch.releasingSoon}
        overdue={releaseWatch.overdue}
        earlyBird={releaseWatch.earlyBird}
        releaseFocus={releaseFocus}
        onReleaseFocusChange={setReleaseFocus}
      />

      <PayhipOpsQueue
        queueCards={queueCards}
        queueFilter={queueFilter}
        onQueueFilterChange={setQueueFilter}
      />

      <PayhipFilterBar
        search={search}
        boardFilter={boardFilter}
        levelFilter={levelFilter}
        statusFilter={statusFilter}
        sortMode={sortMode}
        queueFilter={queueFilter}
        releaseFocus={releaseFocus}
        healthFilter={healthFilter}
        onSearchChange={setSearch}
        onBoardFilterChange={setBoardFilter}
        onLevelFilterChange={setLevelFilter}
        onStatusFilterChange={setStatusFilter}
        onSortModeChange={setSortMode}
        onQueueFilterChange={setQueueFilter}
        onReleaseFocusChange={setReleaseFocus}
        onHealthFilterChange={setHealthFilter}
      />

      <PayhipActionBar
        filteredCount={filtered.length}
        totalCount={items.length}
        healthFilter={healthFilter}
        queueFilter={queueFilter}
        releaseFocus={releaseFocus}
        hasFilters={hasFilters}
        advancingQueue={advancingQueue}
        resolvingHealth={resolvingHealth}
        batchingVisible={batchingVisible}
        filteredIds={filteredIds}
        onOpenFirstVisible={() => onOpenFirstVisible?.()}
        onAdvanceQueue={onAdvanceQueue}
        onResolveHealth={onResolveHealth}
        onResetFilters={resetFilters}
      />

      <PayhipBatchOps
        filteredCount={filtered.length}
        batchStatus={batchStatus}
        batchStage={batchStage}
        batchStageLabel={batchStageLabel}
        resetEligibleCount={resetEligibleCount}
        resetLockedCount={resetLockedCount}
        batchingVisible={batchingVisible}
        advancingQueue={advancingQueue}
        resolvingHealth={resolvingHealth}
        filteredIds={filteredIds}
        onBatchStatusChange={setBatchStatus}
        onBatchStageChange={setBatchStage}
        onBatchStatus={onBatchStatus}
        onBatchPipeline={onBatchPipeline}
      />

      <PayhipGrid
        items={filtered}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  );
}

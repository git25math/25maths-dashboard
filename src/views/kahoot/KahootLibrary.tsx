import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, Check, ChevronDown, ChevronUp, Clock, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { FilterChip } from '../../components/FilterChip';
import { StatCard } from '../../components/StatCard';
import { cn } from '../../lib/utils';
import { KAHOOT_PIPELINE_STAGES, KahootBoard, KahootItem, KahootOrgType, KahootPipelineStage, KahootTrack } from '../../types';
import { KahootCard } from './KahootCard';

type BoardFilter = 'all' | KahootBoard;
type TrackFilter = 'all' | KahootTrack;
type OrgFilter = 'all' | KahootOrgType;
type SortMode = 'updated' | 'topic';

type PipelineFilter = Record<KahootPipelineStage, boolean | null>;

const FILTERS_COLLAPSED_KEY = 'kahoot-library-filters-collapsed';

const INITIAL_PIPELINE_FILTER: PipelineFilter = {
  ai_generated: null,
  reviewed: null,
  excel_exported: null,
  kahoot_uploaded: null,
  web_verified: null,
  published: null,
};

const BOARD_OPTIONS: { key: BoardFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cie0580', label: 'CIE 0580' },
  { key: 'edexcel-4ma1', label: '4MA1' },
];

const ALL_TRACK_OPTIONS: { key: TrackFilter; label: string; board?: KahootBoard }[] = [
  { key: 'all', label: 'All' },
  { key: 'core', label: 'Core', board: 'cie0580' },
  { key: 'extended', label: 'Extended', board: 'cie0580' },
  { key: 'foundation', label: 'Foundation', board: 'edexcel-4ma1' },
  { key: 'higher', label: 'Higher', board: 'edexcel-4ma1' },
];

const ORG_OPTIONS: { key: OrgFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'standalone', label: 'Standalone' },
  { key: 'in_course', label: 'In Course' },
  { key: 'in_channel', label: 'In Channel' },
];

function naturalTopicSort(a: string, b: string): number {
  const parseCode = (code: string) => {
    const match = code.match(/^([A-Za-z])(\d+)\.(\d+)$/);
    return match ? [match[1].toLowerCase(), Number(match[2]), Number(match[3])] as const : [code, 0, 0] as const;
  };

  const [ap, ac, as_] = parseCode(a);
  const [bp, bc, bs] = parseCode(b);
  if (ap !== bp) return ap < bp ? -1 : 1;
  if (ac !== bc) return ac - bc;
  return as_ - bs;
}

function loadCollapsedState(): boolean {
  try {
    return localStorage.getItem(FILTERS_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

interface KahootLibraryProps {
  items: KahootItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onVisibleIdsChange?: (ids: string[]) => void;
}

export function KahootLibrary({ items, selectedId, onSelect, onVisibleIdsChange }: KahootLibraryProps) {
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('all');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>(INITIAL_PIPELINE_FILTER);
  const [orgFilter, setOrgFilter] = useState<OrgFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('topic');
  const [filtersCollapsed, setFiltersCollapsed] = useState(loadCollapsedState);

  useEffect(() => {
    localStorage.setItem(FILTERS_COLLAPSED_KEY, String(filtersCollapsed));
  }, [filtersCollapsed]);

  const trackOptions = useMemo(
    () => ALL_TRACK_OPTIONS.filter(option => option.key === 'all' || !option.board || boardFilter === 'all' || option.board === boardFilter),
    [boardFilter],
  );

  const handleBoardChange = useCallback((board: BoardFilter) => {
    setBoardFilter(board);
    if (board !== 'all') {
      setTrackFilter(prev => {
        const valid = ALL_TRACK_OPTIONS.filter(option => option.key === 'all' || option.board === board).map(option => option.key);
        return valid.includes(prev) ? prev : 'all';
      });
    }
  }, []);

  const togglePipeline = useCallback((stage: KahootPipelineStage) => {
    setPipelineFilter(prev => {
      const current = prev[stage];
      const next = current === null ? true : current === true ? false : null;
      return { ...prev, [stage]: next };
    });
  }, []);

  const hasActiveFilters = boardFilter !== 'all' || trackFilter !== 'all' || orgFilter !== 'all' || search.trim() !== ''
    || Object.values(pipelineFilter).some(value => value !== null);

  const activeFilterCount = useMemo(() => {
    return [
      boardFilter !== 'all',
      trackFilter !== 'all',
      orgFilter !== 'all',
      search.trim() !== '',
    ].filter(Boolean).length + Object.values(pipelineFilter).filter(value => value !== null).length;
  }, [boardFilter, orgFilter, pipelineFilter, search, trackFilter]);

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setBoardFilter('all');
    setTrackFilter('all');
    setPipelineFilter(INITIAL_PIPELINE_FILTER);
    setOrgFilter('all');
  }, []);

  const pipelineStats = useMemo(() => {
    const result: Record<KahootPipelineStage, number> = {
      ai_generated: 0,
      reviewed: 0,
      excel_exported: 0,
      kahoot_uploaded: 0,
      web_verified: 0,
      published: 0,
    };

    for (const item of items) {
      const pipeline = item.pipeline;
      if (!pipeline) continue;

      for (const key of Object.keys(result) as KahootPipelineStage[]) {
        if (pipeline[key]) result[key]++;
      }
    }

    return result;
  }, [items]);

  const completedCount = useMemo(
    () => items.filter(item => item.pipeline && Object.values(item.pipeline).every(Boolean)).length,
    [items],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter(item => boardFilter === 'all' || item.board === boardFilter)
      .filter(item => trackFilter === 'all' || item.track === trackFilter)
      .filter(item => {
        const pipeline = item.pipeline;
        if (!pipeline) return true;

        for (const [stage, value] of Object.entries(pipelineFilter) as [KahootPipelineStage, boolean | null][]) {
          if (value === null) continue;
          if (pipeline[stage] !== value) return false;
        }

        return true;
      })
      .filter(item => orgFilter === 'all' || (item.org_type ?? 'standalone') === orgFilter)
      .filter(item => {
        if (!query) return true;
        return [item.title, item.topic_code, item.description, item.tags.join(' '), item.challenge_url ?? '']
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((left, right) => sortMode === 'topic'
        ? naturalTopicSort(left.topic_code, right.topic_code)
        : right.updated_at.localeCompare(left.updated_at));
  }, [items, boardFilter, trackFilter, pipelineFilter, orgFilter, search, sortMode]);

  useEffect(() => {
    onVisibleIdsChange?.(filtered.map(item => item.id));
  }, [filtered, onVisibleIdsChange]);

  return (
    <div className="flex flex-col gap-6 lg:h-full lg:min-h-0">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:shrink-0">
        <StatCard label="Total" value={items.length} />
        <StatCard label="All Done" value={completedCount} tone="text-emerald-600" />
        <StatCard label="Published" value={pipelineStats.published} tone="text-indigo-600" />
        <StatCard label="AI Generated" value={pipelineStats.ai_generated} tone="text-sky-600" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-slate-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Filters</p>
            </div>
            <p className="text-sm text-slate-500">
              {activeFilterCount > 0 ? `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}` : 'Browse the full Kahoot library or narrow it down by board, track, pipeline, and type.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              >
                <RotateCcw size={12} /> Clear
              </button>
            )}

            <button
              type="button"
              onClick={() => setFiltersCollapsed(prev => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300"
            >
              {filtersCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              {filtersCollapsed ? 'Expand Filters' : 'Collapse Filters'}
            </button>
          </div>
        </div>

        {!filtersCollapsed && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Board</span>
                {BOARD_OPTIONS.map(option => (
                  <FilterChip key={option.key} active={boardFilter === option.key} onClick={() => handleBoardChange(option.key)}>
                    {option.label}
                  </FilterChip>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Track</span>
                {trackOptions.map(option => (
                  <FilterChip key={option.key} active={trackFilter === option.key} onClick={() => setTrackFilter(option.key)} tone="violet">
                    {option.label}
                  </FilterChip>
                ))}
              </div>

              <label className="relative min-w-[220px] flex-1">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search title, tags, code..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pipeline</span>
              {KAHOOT_PIPELINE_STAGES.map(stage => {
                const value = pipelineFilter[stage.key];
                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => togglePipeline(stage.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all active:scale-[0.97]',
                      value === true
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                        : value === false
                          ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600',
                    )}
                    title={value === null ? 'Click to filter: done' : value ? 'Click to filter: not done' : 'Click to clear filter'}
                  >
                    {value === true && <Check size={12} />}
                    {value === false && <X size={12} />}
                    {stage.label}
                    <span className="text-[10px] opacity-60">{pipelineStats[stage.key]}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Type</span>
                {ORG_OPTIONS.map(option => (
                  <FilterChip key={option.key} active={orgFilter === option.key} onClick={() => setOrgFilter(option.key)} tone="teal">
                    {option.label}
                  </FilterChip>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sort</span>
                <FilterChip active={sortMode === 'topic'} onClick={() => setSortMode('topic')} tone="indigo">
                  <ArrowDownAZ size={12} className="mr-1 inline" />Topic
                </FilterChip>
                <FilterChip active={sortMode === 'updated'} onClick={() => setSortMode('updated')} tone="indigo">
                  <Clock size={12} className="mr-1 inline" />Updated
                </FilterChip>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-2 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Results</p>
            <p className="text-sm text-slate-500">{filtered.length} of {items.length} shown</p>
          </div>
          {selectedId && (
            <p className="text-xs text-slate-400">Selected item stays open while the list scrolls independently.</p>
          )}
        </div>

        <div className="space-y-3 lg:h-full lg:overflow-y-auto lg:pr-1">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-400">
              {items.length === 0 ? 'No Kahoots yet. Create your first one!' : 'No items match the current filters.'}
            </div>
          ) : (
            filtered.map(item => (
              <KahootCard
                key={item.id}
                item={item}
                isSelected={item.id === selectedId}
                onClick={() => onSelect(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

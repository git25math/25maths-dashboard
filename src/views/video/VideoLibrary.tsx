import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, Check, ChevronDown, ChevronUp, Clock, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { FilterChip } from '../../components/FilterChip';
import { StatCard } from '../../components/StatCard';
import { cn } from '../../lib/utils';
import { VideoScript, VideoBoard, VideoTier, VIDEO_PIPELINE_STAGES, VideoPipelineStage } from '../../types/video';
import { VideoCard } from './VideoCard';

type BoardFilter = 'all' | VideoBoard;
type TierFilter = 'all' | VideoTier;
type SortMode = 'updated' | 'section';
type PipelineFilter = Record<VideoPipelineStage, boolean | null>;

const FILTERS_COLLAPSED_KEY = 'video-library-filters-collapsed';

const INITIAL_PIPELINE_FILTER: PipelineFilter = {
  stub_created: null,
  script_written: null,
  script_validated: null,
  ai_enhanced: null,
  rendered: null,
  cover_generated: null,
  meta_generated: null,
  uploaded: null,
};

const BOARD_OPTIONS: { key: BoardFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cie', label: 'CIE' },
  { key: 'edx', label: 'Edexcel' },
  { key: 'ial', label: 'IAL' },
  { key: 'amc', label: 'AMC' },
  { key: 'ukmt', label: 'UKMT' },
  { key: 'bmmt', label: 'BMMT' },
  { key: 'kangaroo', label: 'Kangaroo' },
  { key: 'asdan', label: 'ASDAN' },
];

const TIER_OPTIONS: { key: TierFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'both', label: 'Both' },
  { key: 'core_only', label: 'Core' },
  { key: 'extended_only', label: 'Extended' },
];

function naturalSectionSort(a: string, b: string): number {
  const parse = (s: string) => s.split('.').map(Number);
  const ap = parse(a), bp = parse(b);
  for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
    const av = ap[i] ?? 0, bv = bp[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function loadCollapsedState(): boolean {
  try {
    return localStorage.getItem(FILTERS_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

interface VideoLibraryProps {
  items: VideoScript[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onVisibleIdsChange?: (ids: string[]) => void;
}

export function VideoLibrary({ items, selectedId, onSelect, onVisibleIdsChange }: VideoLibraryProps) {
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>(INITIAL_PIPELINE_FILTER);
  const [sortMode, setSortMode] = useState<SortMode>('section');
  const [filtersCollapsed, setFiltersCollapsed] = useState(loadCollapsedState);

  useEffect(() => {
    localStorage.setItem(FILTERS_COLLAPSED_KEY, String(filtersCollapsed));
  }, [filtersCollapsed]);

  const chapters = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.chapter) set.add(item.chapter);
    }
    return Array.from(set).sort();
  }, [items]);

  const togglePipeline = useCallback((stage: VideoPipelineStage) => {
    setPipelineFilter(prev => {
      const current = prev[stage];
      const next = current === null ? true : current === true ? false : null;
      return { ...prev, [stage]: next };
    });
  }, []);

  const hasActiveFilters = boardFilter !== 'all' || tierFilter !== 'all' || chapterFilter !== 'all' || search.trim() !== ''
    || Object.values(pipelineFilter).some(v => v !== null);

  const activeFilterCount = useMemo(() => {
    return [
      boardFilter !== 'all',
      tierFilter !== 'all',
      chapterFilter !== 'all',
      search.trim() !== '',
    ].filter(Boolean).length + Object.values(pipelineFilter).filter(v => v !== null).length;
  }, [boardFilter, tierFilter, chapterFilter, pipelineFilter, search]);

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setBoardFilter('all');
    setTierFilter('all');
    setChapterFilter('all');
    setPipelineFilter(INITIAL_PIPELINE_FILTER);
  }, []);

  const pipelineStats = useMemo(() => {
    const result: Record<VideoPipelineStage, number> = {
      stub_created: 0, script_written: 0, script_validated: 0, ai_enhanced: 0,
      rendered: 0, cover_generated: 0, meta_generated: 0, uploaded: 0,
    };
    for (const item of items) {
      for (const key of Object.keys(result) as VideoPipelineStage[]) {
        if (item.pipeline[key]) result[key]++;
      }
    }
    return result;
  }, [items]);

  const completedCount = useMemo(
    () => items.filter(item => Object.values(item.pipeline).every(Boolean)).length,
    [items],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter(item => boardFilter === 'all' || item.board === boardFilter)
      .filter(item => tierFilter === 'all' || item.tier === tierFilter)
      .filter(item => chapterFilter === 'all' || item.chapter === chapterFilter)
      .filter(item => {
        for (const [stage, value] of Object.entries(pipelineFilter) as [VideoPipelineStage, boolean | null][]) {
          if (value === null) continue;
          if (item.pipeline[stage] !== value) return false;
        }
        return true;
      })
      .filter(item => {
        if (!query) return true;
        return [item.id, item.title, item.title_zh, item.section, item.topic, item.chapter]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => sortMode === 'section'
        ? naturalSectionSort(a.section, b.section)
        : b.updated_at.localeCompare(a.updated_at));
  }, [items, boardFilter, tierFilter, chapterFilter, pipelineFilter, search, sortMode]);

  useEffect(() => {
    onVisibleIdsChange?.(filtered.map(item => item.id));
  }, [filtered, onVisibleIdsChange]);

  return (
    <div className="flex flex-col gap-6 lg:h-full lg:min-h-0">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:shrink-0">
        <StatCard label="Total" value={items.length} />
        <StatCard label="All Done" value={completedCount} tone="text-emerald-600" />
        <StatCard label="Written" value={pipelineStats.script_written} tone="text-indigo-600" />
        <StatCard label="Uploaded" value={pipelineStats.uploaded} tone="text-sky-600" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-slate-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Filters</p>
            </div>
            <p className="text-sm text-slate-500">
              {activeFilterCount > 0 ? `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}` : 'Browse video scripts by board, chapter, tier, and pipeline stage.'}
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
                  <FilterChip key={option.key} active={boardFilter === option.key} onClick={() => setBoardFilter(option.key)}>
                    {option.label}
                  </FilterChip>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tier</span>
                {TIER_OPTIONS.map(option => (
                  <FilterChip key={option.key} active={tierFilter === option.key} onClick={() => setTierFilter(option.key)} tone="violet">
                    {option.label}
                  </FilterChip>
                ))}
              </div>

              <label className="relative min-w-[220px] flex-1">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search id, title, section, topic..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>

            {chapters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Chapter</span>
                <FilterChip active={chapterFilter === 'all'} onClick={() => setChapterFilter('all')} tone="teal">All</FilterChip>
                {chapters.map(ch => (
                  <FilterChip key={ch} active={chapterFilter === ch} onClick={() => setChapterFilter(ch)} tone="teal">
                    {ch}
                  </FilterChip>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pipeline</span>
              {VIDEO_PIPELINE_STAGES.map(stage => {
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

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sort</span>
              <FilterChip active={sortMode === 'section'} onClick={() => setSortMode('section')} tone="indigo">
                <ArrowDownAZ size={12} className="mr-1 inline" />Section
              </FilterChip>
              <FilterChip active={sortMode === 'updated'} onClick={() => setSortMode('updated')} tone="indigo">
                <Clock size={12} className="mr-1 inline" />Updated
              </FilterChip>
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
              {items.length === 0 ? 'No video scripts yet. Import from Settings.' : 'No items match the current filters.'}
            </div>
          ) : (
            filtered.map(item => (
              <VideoCard
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

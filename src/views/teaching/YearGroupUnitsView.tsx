import { memo } from 'react';
import { Plus, ChevronRight, BookOpen, Gauge, GraduationCap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TeachingUnit } from '../../types';
import { sortTeachingUnits } from '../../lib/teachingUnitOrder';
import { PrepCompletenessSummary, summarizeUnitPrep, summarizeYearPrep } from '../../lib/prepCompleteness';
import {
  computeUnitLOStats,
  SegmentedProgressBar,
  getPrepCoverageClasses,
  PrepCoverageMeter,
  PrepCoverageBreakdown,
} from './helpers';

interface YearGroupUnitsViewProps {
  selectedYear: string;
  teachingUnits: TeachingUnit[];
  unitPrepMap: Map<string, PrepCompletenessSummary>;
  yearPrepMap: Map<string, PrepCompletenessSummary>;
  onBack: () => void;
  onAddUnit: () => void;
  setSelectedUnit: (unit: TeachingUnit) => void;
}

export const YearGroupUnitsView = memo(function YearGroupUnitsView({
  selectedYear,
  teachingUnits,
  unitPrepMap,
  yearPrepMap,
  onBack,
  onAddUnit,
  setSelectedUnit,
}: YearGroupUnitsViewProps) {
  const yearUnits = sortTeachingUnits(teachingUnits.filter(u => u.year_group === selectedYear));
  const yearPrepSummary = yearPrepMap.get(selectedYear) || summarizeYearPrep(selectedYear, teachingUnits);
  const fullyReadyUnits = yearUnits.filter(unit => (unitPrepMap.get(unit.id)?.readinessPct || 0) === 100).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to Year Groups
        </button>
        <button
          onClick={onAddUnit}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={18} /> New Unit
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">{selectedYear} Units</h2>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600">
              <Gauge size={18} />
              <h3 className="font-bold text-lg text-slate-900">Prep Completeness Snapshot</h3>
            </div>
            <p className="text-sm text-slate-500">
              Objective-ready means the objective has all four prep sections available: vocabulary, concept, examples, and resources.
            </p>
          </div>
          <span className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold', getPrepCoverageClasses(yearPrepSummary.readinessPct).badge)}>
            <GraduationCap size={14} />
            {fullyReadyUnits}/{yearUnits.length} units fully ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Objective Prep</p>
            <p className="text-2xl font-bold text-slate-900">{yearPrepSummary.objectivesReady}/{yearPrepSummary.objectivesTotal}</p>
            <PrepCoverageMeter
              label="Objective-Ready"
              percent={yearPrepSummary.readinessPct}
              subtitle={`${yearPrepSummary.objectivesReady} of ${yearPrepSummary.objectivesTotal} objectives fully ready`}
            />
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Section Coverage</p>
            <p className="text-2xl font-bold text-slate-900">{yearPrepSummary.sectionsReady}/{yearPrepSummary.sectionsTotal}</p>
            <PrepCoverageMeter
              label="Section Coverage"
              percent={yearPrepSummary.sectionPct}
              subtitle={`${yearPrepSummary.sectionsReady} of ${yearPrepSummary.sectionsTotal} prep sections ready`}
            />
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Section Breakdown</p>
            <p className="text-2xl font-bold text-slate-900">{yearPrepSummary.objectivesTotal > 0 ? '4-part pack' : 'No objectives'}</p>
            <PrepCoverageBreakdown summary={yearPrepSummary} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {yearUnits.map(unit => {
          const stats = computeUnitLOStats(unit);
          const completedPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
          const prepSummary = unitPrepMap.get(unit.id) || summarizeUnitPrep(unit);
          return (
            <div
              key={unit.id}
              onClick={() => setSelectedUnit(unit)}
              className="glass-card p-6 hover:border-indigo-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{unit.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {unit.sub_units.length} sub-units &middot; {stats.total} LOs &middot; {completedPct}% done
                </p>
                <PrepCoverageBreakdown summary={prepSummary} />
              </div>
              <div className="mt-4 space-y-3">
                {stats.total > 0 && (
                  <SegmentedProgressBar completed={stats.completed} inProgress={stats.inProgress} total={stats.total} className="h-1.5" />
                )}
                <PrepCoverageMeter
                  label="Prep Coverage"
                  percent={prepSummary.readinessPct}
                  subtitle={`${prepSummary.objectivesReady}/${prepSummary.objectivesTotal} objectives fully ready`}
                />
              </div>
              <div className="mt-3 flex items-center justify-end">
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
        {yearUnits.length === 0 && (
          <div className="col-span-full p-12 text-center glass-card border-dashed">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No units added for {selectedYear} yet.</p>
            <button onClick={onAddUnit} className="mt-4 text-indigo-600 font-bold hover:underline">Add First Unit</button>
          </div>
        )}
      </div>
    </div>
  );
});

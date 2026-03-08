import { memo } from 'react';
import { BookOpen, Gauge } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TeachingUnit, ClassProfile } from '../../types';
import { TEACHING_YEAR_GROUPS } from '../../shared/constants';
import { ClassPrepCompleteness, PrepCompletenessSummary, summarizeYearPrep } from '../../lib/prepCompleteness';
import {
  getPrepCoverageClasses,
  PrepCoverageMeter,
  PrepCoverageBreakdown,
} from './helpers';

interface YearGroupsOverviewProps {
  teachingUnits: TeachingUnit[];
  yearPrepMap: Map<string, PrepCompletenessSummary>;
  classPrepRows: ClassPrepCompleteness[];
  onOpenSyllabus: () => void;
  setSelectedYear: (year: string) => void;
  setSelectedUnit: (unit: TeachingUnit) => void;
  onUpdateClass: (id: string) => void;
}

export const YearGroupsOverview = memo(function YearGroupsOverview({
  teachingUnits,
  yearPrepMap,
  classPrepRows,
  onOpenSyllabus,
  setSelectedYear,
  setSelectedUnit,
  onUpdateClass,
}: YearGroupsOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Teaching Management</h2>
        <div className="flex gap-2">
          <button onClick={onOpenSyllabus} className="btn-secondary text-sm">Curriculum Map</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEACHING_YEAR_GROUPS.map(year => {
          const yearUnits = teachingUnits.filter(u => u.year_group === year);
          const prepSummary = yearPrepMap.get(year) || summarizeYearPrep(year, teachingUnits);
          return (
            <div
              key={year}
              onClick={() => setSelectedYear(year)}
              className="glass-card p-8 hover:border-indigo-400 transition-all cursor-pointer group text-center space-y-4"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <BookOpen size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">{year}</h3>
                <p className="text-sm text-slate-500">
                  {yearUnits.length} Units Available
                </p>
                <p className="text-xs text-slate-500">
                  Prep: <span className="font-bold text-slate-700">{prepSummary.objectivesReady}/{prepSummary.objectivesTotal}</span> objectives ready
                </p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden max-w-[220px] mx-auto">
                  <div
                    className={cn('h-full transition-all duration-500', getPrepCoverageClasses(prepSummary.readinessPct).bar)}
                    style={{ width: `${prepSummary.readinessPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600">
              <Gauge size={18} />
              <h3 className="font-bold text-lg text-slate-900">Prep Completeness Snapshot</h3>
            </div>
            <p className="text-sm text-slate-500">Aggregated by year group across all available units.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {TEACHING_YEAR_GROUPS.map(year => {
            const prepSummary = yearPrepMap.get(year) || summarizeYearPrep(year, teachingUnits);
            return (
              <div key={`${year}-prep-summary`} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{year}</p>
                    <p className="text-[11px] text-slate-500">{teachingUnits.filter(unit => unit.year_group === year).length} units</p>
                  </div>
                  <span className={cn('px-2 py-1 rounded-full border text-[10px] font-bold', getPrepCoverageClasses(prepSummary.readinessPct).badge)}>
                    {prepSummary.readinessPct}% ready
                  </span>
                </div>
                <PrepCoverageMeter
                  label="Objective-Ready"
                  percent={prepSummary.readinessPct}
                  subtitle={`${prepSummary.objectivesReady}/${prepSummary.objectivesTotal} objectives fully ready`}
                />
                <PrepCoverageBreakdown summary={prepSummary} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold text-lg mb-4">Class Progress Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classPrepRows.map(({ classProfile: cls, currentUnit, summary: prepSummary }) => {
            const totalLOs = currentUnit?.sub_units.reduce((sum, su) => sum + su.learning_objectives.length, 0) || 0;
            const completedLOs = currentUnit?.sub_units.reduce((sum, su) => sum + su.learning_objectives.filter(lo => lo.status === 'completed').length, 0) || 0;
            const progress = totalLOs > 0 ? Math.round((completedLOs / totalLOs) * 100) : 0;
            return (
              <div key={cls.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-900">{cls.name}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      {cls.year_group}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Current: <span className="font-medium text-indigo-600">{currentUnit?.title || 'None'}</span>
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>PROGRESS</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-500", progress < 30 ? "bg-red-500" : progress < 70 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400">{completedLOs}/{totalLOs} LOs completed</p>
                  </div>
                  <div className="mt-3">
                    <PrepCoverageMeter
                      label="Prep Coverage"
                      percent={prepSummary.readinessPct}
                      subtitle={`${prepSummary.objectivesReady}/${prepSummary.objectivesTotal} objectives fully ready`}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-3">
                    <button
                      onClick={() => onUpdateClass(cls.id)}
                      className="text-slate-400 font-bold text-[10px] uppercase tracking-wider hover:text-indigo-600 transition-colors"
                    >
                      Change Unit
                    </button>
                    <button
                      onClick={() => currentUnit && setSelectedUnit(currentUnit)}
                      className="text-indigo-600 font-bold text-[10px] uppercase tracking-wider hover:underline"
                    >
                      View Unit
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">{cls.student_ids.length} Students</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

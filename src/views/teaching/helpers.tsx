import { memo } from 'react';
import { BookOpen, ExternalLink, FileText, Layers3, Link2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LearningObjective, PrepResource, SubUnit, TeachingUnit } from '../../types';
import { MarkdownRenderer } from '../../components/RichTextEditor';
import { getObjectivePrepMetrics } from '../../lib/objectivePrep';
import { getPrepCoverageLevel, PrepCompletenessSummary } from '../../lib/prepCompleteness';

export type LOFilterStatus = 'all' | 'not_started' | 'in_progress' | 'completed';

export function computeUnitLOStats(unit: TeachingUnit) {
  const allLOs = unit.sub_units.flatMap(su => su.learning_objectives);
  const allDates = new Set<string>();
  allLOs.forEach(lo => lo.covered_lesson_dates?.forEach(d => allDates.add(d)));
  return {
    total: allLOs.length,
    completed: allLOs.filter(lo => lo.status === 'completed').length,
    inProgress: allLOs.filter(lo => lo.status === 'in_progress').length,
    notStarted: allLOs.filter(lo => lo.status === 'not_started').length,
    totalPeriods: allLOs.reduce((sum, lo) => sum + lo.periods, 0),
    lessonsCovered: allDates.size,
  };
}

export const SegmentedProgressBar = memo(function SegmentedProgressBar({ completed, inProgress, total, className }: { completed: number; inProgress: number; total: number; className?: string }) {
  if (total === 0) return null;
  const completedPct = (completed / total) * 100;
  const inProgressPct = (inProgress / total) * 100;
  return (
    <div className={cn("w-full h-2 bg-slate-200 rounded-full overflow-hidden flex", className)}>
      {completedPct > 0 && (
        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${completedPct}%` }} />
      )}
      {inProgressPct > 0 && (
        <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${inProgressPct}%` }} />
      )}
    </div>
  );
});

export function getPrepCoverageClasses(percent: number) {
  const level = getPrepCoverageLevel(percent);
  if (level === 'high') {
    return {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
      text: 'text-emerald-700',
    };
  }
  if (level === 'medium') {
    return {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      bar: 'bg-amber-500',
      text: 'text-amber-700',
    };
  }
  return {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    bar: 'bg-rose-500',
    text: 'text-rose-700',
  };
}

export const PrepCoverageMeter = memo(function PrepCoverageMeter({ label, percent, subtitle }: { label: string; percent: number; subtitle: string }) {
  const tone = getPrepCoverageClasses(percent);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span>{label}</span>
        <span className={tone.text}>{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={cn('h-full transition-all duration-500', tone.bar)} style={{ width: `${percent}%` }} />
      </div>
      <p className="text-[10px] text-slate-400">{subtitle}</p>
    </div>
  );
});

export const PrepCoverageBreakdown = memo(function PrepCoverageBreakdown({ summary }: { summary: PrepCompletenessSummary }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="px-2 py-1 rounded-full bg-amber-50 text-[10px] font-bold text-amber-700 border border-amber-100">
        Vocab {summary.vocabularyReady}/{summary.objectivesTotal}
      </span>
      <span className="px-2 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-700 border border-blue-100">
        Concept {summary.conceptReady}/{summary.objectivesTotal}
      </span>
      <span className="px-2 py-1 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-100">
        Examples {summary.examplesReady}/{summary.objectivesTotal}
      </span>
      <span className="px-2 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100">
        Resources {summary.resourcesReady}/{summary.objectivesTotal}
      </span>
    </div>
  );
});

export const ResourceBankList = memo(function ResourceBankList({ resources, emptyLabel }: { resources: PrepResource[]; emptyLabel: string }) {
  if (resources.length === 0) {
    return <p className="text-xs text-slate-500 italic">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {resources.map((resource, index) => (
        resource.url ? (
          <a
            key={`${resource.title}-${resource.url}-${index}`}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl border bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">{resource.title}</p>
              {(resource.kind || resource.note) && (
                <p className="text-[11px] text-slate-400">
                  {[resource.kind, resource.note].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <ExternalLink size={14} className="text-slate-400" />
          </a>
        ) : (
          <div key={`${resource.title}-${index}`} className="p-3 rounded-xl border bg-white border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">{resource.title}</p>
                {(resource.kind || resource.note) && (
                  <p className="text-[11px] text-slate-400">
                    {[resource.kind, resource.note].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <span className="px-2 py-1 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Note
              </span>
            </div>
          </div>
        )
      ))}
    </div>
  );
});

export const ObjectivePrepSections = memo(function ObjectivePrepSections({ objective, subUnit }: { objective: LearningObjective; subUnit: SubUnit }) {
  const {
    vocabulary,
    resources,
    examples,
    concept,
    usesSharedVocabulary,
    usesSharedResources,
    usesSharedConcept,
    hasSharedExercises,
  } = getObjectivePrepMetrics(objective, subUnit);
  const hasConcept = !!concept;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-4">
      <section className="p-4 rounded-2xl border border-amber-100 bg-amber-50/60 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <BookOpen size={16} />
            Core Vocabulary
          </h4>
          {usesSharedVocabulary && <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Shared</span>}
        </div>
        {vocabulary.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {vocabulary.map((item, index) => (
              <span key={`${item.english}-${item.chinese}-${index}`} className="px-2.5 py-1.5 rounded-full bg-white border border-amber-200 text-xs text-slate-700">
                <span className="font-semibold">{item.english}</span>
                {item.chinese && <span className="text-slate-400"> / {item.chinese}</span>}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No vocabulary attached to this objective yet.</p>
        )}
      </section>

      <section className="p-4 rounded-2xl border border-blue-100 bg-blue-50/60 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers3 size={16} className="text-blue-600" />
            <h4 className="text-sm font-bold text-blue-900">Concept Explanation</h4>
          </div>
          {usesSharedConcept && <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Shared</span>}
        </div>
        {hasConcept ? (
          <MarkdownRenderer content={concept} className="text-sm text-slate-700" />
        ) : (
          <p className="text-xs text-slate-500 italic">No objective-specific concept explanation yet.</p>
        )}
      </section>

      <section className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 space-y-3 xl:col-span-2">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-indigo-600" />
          <h4 className="text-sm font-bold text-indigo-900">Typical Examples</h4>
        </div>
        {examples.length > 0 ? (
          <div className="space-y-3">
            {examples.map((example, index) => (
              <div key={`${objective.id}-example-${index}`} className="p-3 rounded-xl bg-white border border-indigo-100 space-y-2">
                <div className="text-sm font-semibold text-slate-800">
                  <span className="text-indigo-600 mr-2">Q{index + 1}.</span>
                  <MarkdownRenderer content={example.question} />
                </div>
                <div className="pl-5 border-l-2 border-indigo-100 text-sm text-slate-600">
                  <MarkdownRenderer content={example.solution} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 italic">No objective-specific examples yet.</p>
            {hasSharedExercises && (
              <p className="text-xs text-indigo-700 bg-white border border-indigo-100 rounded-xl px-3 py-2">
                Shared classroom exercises are available in the sub-unit workspace and can be reused for this objective.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 space-y-3 xl:col-span-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
            <Link2 size={16} />
            Prep Resources
          </h4>
          {usesSharedResources && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Shared</span>}
        </div>
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {resources.map((resource, index) => (
              resource.url ? (
                <a
                  key={`${resource.title}-${resource.url}-${index}`}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{resource.title}</p>
                    {(resource.kind || resource.note) && (
                      <p className="text-[11px] text-slate-400">
                        {[resource.kind, resource.note].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <ExternalLink size={14} className="text-emerald-500" />
                </a>
              ) : (
                <div
                  key={`${resource.title}-${index}`}
                  className="p-3 rounded-xl bg-white border border-emerald-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{resource.title}</p>
                      {(resource.kind || resource.note) && (
                        <p className="text-[11px] text-slate-400">
                          {[resource.kind, resource.note].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Note
                    </span>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No prep resources linked yet.</p>
        )}
      </section>
    </div>
  );
});

export const LOStatusPills = memo(function LOStatusPills({ completed, inProgress, notStarted, total, totalPeriods, lessonsCovered }: ReturnType<typeof computeUnitLOStats>) {
  if (total === 0) return <p className="text-xs text-slate-400 italic">No learning objectives defined yet.</p>;
  const pct = Math.round((completed / total) * 100);
  return (
    <div className="space-y-3">
      <SegmentedProgressBar completed={completed} inProgress={inProgress} total={total} />
      <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {completed} Completed
        </span>
        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {inProgress} In Progress
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {notStarted} Not Started
        </span>
        <span className="text-slate-400 ml-auto">
          {pct}% Complete ({completed}/{total} LOs) &middot; {totalPeriods} periods &middot; {lessonsCovered} lessons
        </span>
      </div>
    </div>
  );
});

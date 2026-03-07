import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, ChevronRight, ChevronDown, CheckCircle2, Circle, Clock, BookOpen, ExternalLink, Lightbulb, Settings, Trash2, Edit3, Calendar, MessageSquare, Filter, Zap, Layers3, FileText, Link2, Gauge, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { TeachingUnit, ClassProfile, SubUnit, LearningObjective, PrepResource } from '../types';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { SubUnitForm } from '../components/SubUnitForm';
import { TEACHING_YEAR_GROUPS, NON_TEACHING_GROUPS } from '../shared/constants';
import { getObjectivePrepMetrics, getSharedPrepResources, getTeachingUnitResources } from '../lib/objectivePrep';
import { sortTeachingUnits } from '../lib/teachingUnitOrder';
import { PrepCompletenessSummary, getPrepCoverageLevel, summarizeClassPrep, summarizeUnitPrep, summarizeYearPrep } from '../lib/prepCompleteness';

// --- Helpers ---

function computeUnitLOStats(unit: TeachingUnit) {
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

function SegmentedProgressBar({ completed, inProgress, total, className }: { completed: number; inProgress: number; total: number; className?: string }) {
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
}

function getPrepCoverageClasses(percent: number) {
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

function PrepCoverageMeter({ label, percent, subtitle }: { label: string; percent: number; subtitle: string }) {
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
}

function PrepCoverageBreakdown({ summary }: { summary: PrepCompletenessSummary }) {
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
}

function ResourceBankList({ resources, emptyLabel }: { resources: PrepResource[]; emptyLabel: string }) {
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
}

function ObjectivePrepSections({ objective, subUnit }: { objective: LearningObjective; subUnit: SubUnit }) {
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
}

function LOStatusPills({ completed, inProgress, notStarted, total, totalPeriods, lessonsCovered }: ReturnType<typeof computeUnitLOStats>) {
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
}

// --- Types ---

type LOFilterStatus = 'all' | 'not_started' | 'in_progress' | 'completed';

interface TeachingViewProps {
  teachingUnits: TeachingUnit[];
  onOpenSyllabus: () => void;
  initialUnitId: string | null;
  onClearInitialUnit: () => void;
  onAddUnit: () => void;
  onUpdateUnit: (id: string) => void;
  onDeleteUnit: (id: string) => void;
  onSaveUnit: (unit: TeachingUnit) => void;
  classes: ClassProfile[];
  onUpdateClass: (id: string) => void;
  onToast?: (message: string) => void;
}

export const TeachingView = ({
  teachingUnits,
  onOpenSyllabus,
  initialUnitId,
  onClearInitialUnit,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
  onSaveUnit,
  classes,
  onUpdateClass,
  onToast
}: TeachingViewProps) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<TeachingUnit | null>(null);
  const [selectedSubUnit, setSelectedSubUnit] = useState<SubUnit | null>(null);
  const [isSubUnitFormOpen, setIsSubUnitFormOpen] = useState(false);
  const [editingSubUnit, setEditingSubUnit] = useState<SubUnit | null>(null);
  const [loFilter, setLoFilter] = useState<LOFilterStatus>('all');
  const teachingClasses = classes.filter(cls => !NON_TEACHING_GROUPS.has(cls.year_group));
  const unitPrepMap = useMemo(
    () => new Map(teachingUnits.map(unit => [unit.id, summarizeUnitPrep(unit)])),
    [teachingUnits]
  );
  const yearPrepMap = useMemo<Map<string, PrepCompletenessSummary>>(
    () => new Map(TEACHING_YEAR_GROUPS.map(year => [year, summarizeYearPrep(year, teachingUnits)])),
    [teachingUnits]
  );
  const classPrepRows = useMemo(
    () => teachingClasses.map(cls => summarizeClassPrep(cls, teachingUnits)),
    [teachingClasses, teachingUnits]
  );

  // Drag state
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Keep selectedUnit in sync with teachingUnits changes
  useEffect(() => {
    if (selectedUnit) {
      const updated = teachingUnits.find(u => u.id === selectedUnit.id);
      if (updated) setSelectedUnit(updated);
    }
  }, [teachingUnits]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep selectedSubUnit in sync
  useEffect(() => {
    if (selectedSubUnit && selectedUnit) {
      const updatedUnit = teachingUnits.find(u => u.id === selectedUnit.id);
      if (updatedUnit) {
        const updatedSu = updatedUnit.sub_units.find(su => su.id === selectedSubUnit.id);
        if (updatedSu) setSelectedSubUnit(updatedSu);
      }
    }
  }, [teachingUnits]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialUnitId) {
      const unit = teachingUnits.find(u => u.id === initialUnitId);
      if (unit) {
        setSelectedUnit(unit);
        setSelectedYear(unit.year_group);
      }
      onClearInitialUnit();
    }
  }, [initialUnitId, onClearInitialUnit, teachingUnits]);

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      onToast?.('Prompt copied to clipboard!');
    });
  };

  // --- Sub-Unit CRUD ---
  const handleSaveSubUnit = (subUnit: SubUnit) => {
    if (!selectedUnit) return;
    const existing = selectedUnit.sub_units;
    const idx = existing.findIndex(s => s.id === subUnit.id);
    const newSubUnits = idx >= 0
      ? existing.map(s => s.id === subUnit.id ? subUnit : s)
      : [...existing, subUnit];
    onSaveUnit({ ...selectedUnit, sub_units: newSubUnits });
    setIsSubUnitFormOpen(false);
    setEditingSubUnit(null);
  };

  const handleDeleteSubUnit = (subUnitId: string) => {
    if (!selectedUnit) return;
    if (!confirm('Delete this sub-unit?')) return;
    const newSubUnits = selectedUnit.sub_units.filter(s => s.id !== subUnitId);
    onSaveUnit({ ...selectedUnit, sub_units: newSubUnits });
    setSelectedSubUnit(null);
  };

  // --- Drag-and-drop handlers for LOs ---
  const handleLODragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleLODragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleLODrop = (index: number) => {
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === index || !selectedSubUnit || !selectedUnit) return;
    const los = [...selectedSubUnit.learning_objectives];
    const [moved] = los.splice(fromIndex, 1);
    los.splice(index, 0, moved);
    const newSubUnit = { ...selectedSubUnit, learning_objectives: los };
    const newSubUnits = selectedUnit.sub_units.map(s =>
      s.id === selectedSubUnit.id ? newSubUnit : s
    );
    onSaveUnit({ ...selectedUnit, sub_units: newSubUnits });
    setSelectedSubUnit(newSubUnit);
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleLODragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  // ===== Sub-Unit Detail View =====
  if (selectedSubUnit && selectedUnit) {
    const los = selectedSubUnit.learning_objectives || [];
    const subUnitResourceBank = getSharedPrepResources(selectedSubUnit);
    const completedCount = los.filter(lo => lo.status === 'completed').length;
    const inProgressCount = los.filter(lo => lo.status === 'in_progress').length;
    const notStartedCount = los.filter(lo => lo.status === 'not_started').length;
    const totalCount = los.length;

    const filteredLOs = loFilter === 'all' ? los : los.filter(lo => lo.status === loFilter);

    const filterCounts: Record<LOFilterStatus, number> = {
      all: totalCount,
      not_started: notStartedCount,
      in_progress: inProgressCount,
      completed: completedCount,
    };

    return (
      <div className="space-y-6">
        <button
          onClick={() => { setSelectedSubUnit(null); setLoFilter('all'); }}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to {selectedUnit.title}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                    小单元
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-2">{selectedSubUnit.title}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingSubUnit(selectedSubUnit); setIsSubUnitFormOpen(true); }}
                    className="btn-secondary text-xs flex items-center gap-1"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubUnit(selectedSubUnit.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Learning Objectives */}
              {totalCount > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <CheckCircle2 size={20} className="text-emerald-500" />
                      教学目标 Learning Objectives
                    </h3>
                    <button
                      onClick={() => {
                        if (!selectedUnit || !selectedSubUnit) return;
                        const newLOs = selectedSubUnit.learning_objectives.map(lo => {
                          const coveredCount = lo.covered_lesson_dates?.length || 0;
                          let status: LearningObjective['status'];
                          if (coveredCount === 0) status = 'not_started';
                          else if (coveredCount >= lo.periods) status = 'completed';
                          else status = 'in_progress';
                          return { ...lo, status };
                        });
                        const newSubUnit = { ...selectedSubUnit, learning_objectives: newLOs };
                        const newSubUnits = selectedUnit.sub_units.map(s =>
                          s.id === selectedSubUnit.id ? newSubUnit : s
                        );
                        onSaveUnit({ ...selectedUnit, sub_units: newSubUnits });
                        setSelectedSubUnit(newSubUnit);
                        onToast?.('LO statuses updated from coverage');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Infer LO status from covered lesson count"
                    >
                      <Zap size={12} />
                      Auto-status
                    </button>
                  </div>

                  {/* Summary stats */}
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 size={14} /> {completedCount} completed
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock size={14} /> {inProgressCount} in progress
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Circle size={14} /> {notStartedCount} not started
                    </span>
                  </div>

                  {/* Segmented progress bar */}
                  <SegmentedProgressBar completed={completedCount} inProgress={inProgressCount} total={totalCount} />

                  {/* Filter buttons */}
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" />
                    {(['all', 'not_started', 'in_progress', 'completed'] as LOFilterStatus[]).map(status => {
                      const labels: Record<LOFilterStatus, string> = {
                        all: 'All',
                        not_started: 'Not Started',
                        in_progress: 'In Progress',
                        completed: 'Completed',
                      };
                      const colors: Record<LOFilterStatus, string> = {
                        all: loFilter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                        not_started: loFilter === status ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                        in_progress: loFilter === status ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                        completed: loFilter === status ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                      };
                      return (
                        <button
                          key={status}
                          onClick={() => setLoFilter(status)}
                          className={cn("px-3 py-1.5 rounded-full text-[11px] font-bold transition-all", colors[status])}
                        >
                          {labels[status]} ({filterCounts[status]})
                        </button>
                      );
                    })}
                  </div>

                  {/* LO list with drag-and-drop */}
                  <div className="grid grid-cols-1 gap-2">
                    {filteredLOs.map((lo, displayIdx) => {
                      const realIndex = los.indexOf(lo);
                      const statusColors = {
                        not_started: 'bg-slate-100 text-slate-600 border-slate-200',
                        in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
                        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      };
                      const StatusIcon = lo.status === 'completed' ? CheckCircle2 : lo.status === 'in_progress' ? Clock : Circle;
                      const iconColor = lo.status === 'completed' ? 'text-emerald-500' : lo.status === 'in_progress' ? 'text-amber-500' : 'text-slate-400';
                      const cycleStatus = (current: LearningObjective['status']): LearningObjective['status'] => {
                        const cycle: Record<string, LearningObjective['status']> = { not_started: 'in_progress', in_progress: 'completed', completed: 'not_started' };
                        return cycle[current];
                      };
                      const prepMetrics = getObjectivePrepMetrics(lo, selectedSubUnit);
                      const objectiveVocabularyCount = prepMetrics.vocabulary.length;
                      const objectiveExampleCount = prepMetrics.examples.length;
                      const objectiveResourceCount = prepMetrics.resources.length;
                      const hasConceptExplanation = !!prepMetrics.concept;
                      const isDragging = dragIndexRef.current === realIndex;
                      const isDragOver = dragOverIndex === realIndex;
                      return (
                        <div
                          key={lo.id}
                          draggable={loFilter === 'all'}
                          onDragStart={() => handleLODragStart(realIndex)}
                          onDragOver={(e) => handleLODragOver(e, realIndex)}
                          onDrop={() => handleLODrop(realIndex)}
                          onDragEnd={handleLODragEnd}
                          className={cn(
                            "p-3 rounded-xl border transition-all",
                            statusColors[lo.status],
                            isDragging && "opacity-50",
                            isDragOver && "ring-2 ring-indigo-400",
                            loFilter === 'all' && "cursor-grab active:cursor-grabbing"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              title="Click to change status"
                              onClick={() => {
                                if (!selectedUnit) return;
                                const newLOs = (selectedSubUnit.learning_objectives || []).map(l =>
                                  l.id === lo.id ? { ...l, status: cycleStatus(l.status) } : l
                                );
                                const newSubUnit = { ...selectedSubUnit, learning_objectives: newLOs };
                                const newSubUnits = selectedUnit.sub_units.map(s =>
                                  s.id === selectedSubUnit.id ? newSubUnit : s
                                );
                                onSaveUnit({ ...selectedUnit, sub_units: newSubUnits });
                                setSelectedSubUnit(newSubUnit);
                              }}
                              className={cn("mt-0.5 shrink-0 transition-all hover:scale-110", iconColor)}
                            >
                              <StatusIcon size={20} />
                            </button>
                            <div className="flex-1 space-y-1">
                              <MarkdownRenderer content={lo.objective} className="text-sm" />
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400">
                                  {lo.periods} periods · {lo.covered_lesson_dates?.length || 0} covered
                                </span>
                                {lo.notes && <p className="text-xs text-slate-500 italic">{lo.notes}</p>}
                              </div>
                              {lo.covered_lesson_dates && lo.covered_lesson_dates.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {lo.covered_lesson_dates.map(d => (
                                    <span key={d} className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-mono">
                                      {format(new Date(d + 'T00:00:00'), 'dd MMM')}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                  {objectiveVocabularyCount} vocab
                                </span>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                  {objectiveExampleCount} examples
                                </span>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                  {objectiveResourceCount} resources
                                </span>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                  {prepMetrics.readySections}/{prepMetrics.totalSections} prep ready
                                </span>
                                {hasConceptExplanation && (
                                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                    concept ready
                                  </span>
                                )}
                              </div>
                              <details className="mt-3 rounded-xl border border-white/70 bg-white/60">
                                <summary className="list-none cursor-pointer px-3 py-2 flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Objective Prep Pack</span>
                                  <ChevronDown size={14} className="text-slate-400" />
                                </summary>
                                <div className="px-3 pb-3 border-t border-white/70">
                                  <ObjectivePrepSections objective={lo} subUnit={selectedSubUnit} />
                                </div>
                              </details>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Periods */}
              <section className="flex items-center gap-3">
                <Clock size={18} className="text-indigo-500" />
                <span className="font-bold text-sm text-slate-700">课时安排</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
                  {selectedSubUnit.periods} 课时
                </span>
              </section>

              {/* Vocabulary */}
              {selectedSubUnit.vocabulary.length > 0 && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <BookOpen size={20} className="text-amber-500" />
                    双语核心词汇 Vocabulary
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">English</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">中文</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSubUnit.vocabulary.map((v, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-4 py-2 text-sm text-slate-700">{v.english}</td>
                            <td className="px-4 py-2 text-sm text-slate-700">{v.chinese}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Classroom Exercises */}
              {selectedSubUnit.classroom_exercises && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Edit3 size={20} className="text-indigo-500" />
                    课堂讲练 Classroom Exercises
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <MarkdownRenderer content={selectedSubUnit.classroom_exercises} className="text-sm text-slate-700" />
                  </div>
                </section>
              )}

              {/* Homework */}
              {(selectedSubUnit.homework_content || selectedSubUnit.homework_url) && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-violet-500" />
                    课后作业 Homework
                  </h3>
                  {selectedSubUnit.homework_content && (
                    <div className="p-4 bg-violet-50/50 rounded-xl border border-violet-100">
                      <MarkdownRenderer content={selectedSubUnit.homework_content} className="text-sm text-slate-700" />
                    </div>
                  )}
                  {selectedSubUnit.homework_url && (
                    <a
                      href={selectedSubUnit.homework_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:underline"
                    >
                      <ExternalLink size={14} /> Open Homework Link
                    </a>
                  )}
                </section>
              )}

              {/* Teaching Reflection */}
              {selectedSubUnit.reflection && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <MessageSquare size={20} className="text-rose-500" />
                    教学总结及反思 Teaching Reflection
                  </h3>
                  <div className="p-6 bg-rose-50/50 rounded-xl border border-rose-100 space-y-4">
                    {selectedSubUnit.reflection.lesson_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-rose-400" />
                        <span className="font-bold text-slate-600">上课时间:</span>
                        <span className="text-slate-700">{selectedSubUnit.reflection.lesson_date}</span>
                      </div>
                    )}
                    {selectedSubUnit.reflection.student_reception && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">学生接受状态</p>
                        <p className="text-sm text-slate-700">{selectedSubUnit.reflection.student_reception}</p>
                      </div>
                    )}
                    {selectedSubUnit.reflection.planned_content && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">计划讲解</p>
                        <MarkdownRenderer content={selectedSubUnit.reflection.planned_content} className="text-sm text-slate-700" />
                      </div>
                    )}
                    {selectedSubUnit.reflection.actual_content && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">实际讲解</p>
                        <MarkdownRenderer content={selectedSubUnit.reflection.actual_content} className="text-sm text-slate-700" />
                      </div>
                    )}
                    {selectedSubUnit.reflection.improvements && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">下次改进方向</p>
                        <MarkdownRenderer content={selectedSubUnit.reflection.improvements} className="text-sm text-slate-700" />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* AI Summary */}
              {selectedSubUnit.ai_summary && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Lightbulb size={20} className="text-amber-500" />
                    AI总结 AI Summary
                  </h3>
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <MarkdownRenderer content={selectedSubUnit.ai_summary} className="text-sm text-slate-700" />
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">资源链接 Resources</h3>
              <ResourceBankList resources={subUnitResourceBank} emptyLabel="No sub-unit resources linked yet." />
            </div>
          </div>
        </div>

        {isSubUnitFormOpen && (
          <SubUnitForm
            subUnit={editingSubUnit}
            onSave={handleSaveSubUnit}
            onCancel={() => { setIsSubUnitFormOpen(false); setEditingSubUnit(null); }}
          />
        )}
      </div>
    );
  }

  // ===== Unit Detail View =====
  if (selectedUnit) {
    const subUnits = selectedUnit.sub_units;
    const loStats = computeUnitLOStats(selectedUnit);
    const unitResourceBank = getTeachingUnitResources(selectedUnit);
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedUnit(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to {selectedYear}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                    {selectedUnit.year_group}
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-2">{selectedUnit.title}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateUnit(selectedUnit.id)}
                    className="btn-secondary text-xs"
                  >
                    Edit Unit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this unit?')) {
                        onDeleteUnit(selectedUnit.id);
                        setSelectedUnit(null);
                      }
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* LO Progress Summary (replaces old learning_objectives text list) */}
              <section className="space-y-4">
                <h3 className="font-bold text-lg">教学目标进度 (Learning Objectives Progress)</h3>
                <LOStatusPills {...loStats} />
              </section>

              {/* Sub-Units Section */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">小单元模块 (Sub-Units)</h3>
                  <button
                    onClick={() => { setEditingSubUnit(null); setIsSubUnitFormOpen(true); }}
                    className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Add Sub-Unit
                  </button>
                </div>
                <div className="space-y-3">
                  {subUnits.map(su => {
                    const suLOs = su.learning_objectives || [];
                    const suCompleted = suLOs.filter(lo => lo.status === 'completed').length;
                    const suInProgress = suLOs.filter(lo => lo.status === 'in_progress').length;
                    const suTotal = suLOs.length;
                    const sharedResources = getSharedPrepResources(su);
                    return (
                      <details
                        key={su.id}
                        className="group rounded-2xl border border-slate-200 bg-slate-50/80 open:bg-white open:border-indigo-200 transition-all"
                      >
                        <summary className="list-none cursor-pointer p-4 md:p-5">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                  Sub-Unit
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-slate-200 text-slate-600">
                                  {su.periods} periods
                                </span>
                              </div>
                              <p className="font-bold text-slate-900 text-lg group-open:text-indigo-700 transition-colors">{su.title}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span>{suCompleted}/{suTotal} LOs completed</span>
                                <span>{su.vocabulary.length} shared vocab</span>
                                <span>{sharedResources.length} shared resources</span>
                                <span>{su.classroom_exercises ? 'shared class notes ready' : 'no shared class notes'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {suTotal > 0 && (
                                <div className="w-24">
                                  <SegmentedProgressBar completed={suCompleted} inProgress={suInProgress} total={suTotal} className="h-1.5" />
                                </div>
                              )}
                              <ChevronDown size={18} className="text-slate-400 transition-transform group-open:rotate-180" />
                            </div>
                          </div>
                        </summary>

                        <div className="px-4 md:px-5 pb-5 space-y-4 border-t border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Shared Vocabulary</p>
                              <p className="mt-1 text-lg font-bold text-amber-900">{su.vocabulary.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Shared Notes</p>
                              <p className="mt-1 text-sm font-bold text-blue-900">{su.classroom_exercises ? 'Available' : 'Missing'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Shared Resources</p>
                              <p className="mt-1 text-lg font-bold text-emerald-900">{sharedResources.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Homework</p>
                              <p className="mt-1 text-sm font-bold text-violet-900">{su.homework_content || su.homework_url ? 'Available' : 'Missing'}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {suLOs.map((lo, objectiveIndex) => {
                              const prepMetrics = getObjectivePrepMetrics(lo, su);
                              const objectiveVocabularyCount = prepMetrics.vocabulary.length;
                              const objectiveExampleCount = prepMetrics.examples.length;
                              const objectiveResourceCount = prepMetrics.resources.length;
                              return (
                                <details key={lo.id} className="rounded-xl border border-slate-200 bg-white group/objective">
                                  <summary className="list-none cursor-pointer px-4 py-3 flex justify-between items-start gap-4">
                                    <div className="space-y-2 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                          Objective {objectiveIndex + 1}
                                        </span>
                                        <span className={cn(
                                          "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                                          lo.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                          lo.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                                          'bg-slate-100 text-slate-600'
                                        )}>
                                          {lo.status.replace('_', ' ')}
                                        </span>
                                      </div>
                                      <div className="text-sm text-slate-800">
                                        <MarkdownRenderer content={lo.objective} />
                                      </div>
                                      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                                        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">{objectiveVocabularyCount} vocab</span>
                                        <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">{objectiveExampleCount} examples</span>
                                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{objectiveResourceCount} resources</span>
                                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{prepMetrics.readySections}/{prepMetrics.totalSections} prep ready</span>
                                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{lo.periods} periods</span>
                                      </div>
                                    </div>
                                    <ChevronDown size={16} className="text-slate-400 transition-transform group-open/objective:rotate-180 shrink-0 mt-1" />
                                  </summary>
                                  <div className="px-4 pb-4 border-t border-slate-100">
                                    <ObjectivePrepSections objective={lo} subUnit={su} />
                                  </div>
                                </details>
                              );
                            })}
                            {suLOs.length === 0 && (
                              <p className="text-xs text-slate-400 italic p-4">No objectives defined inside this sub-unit yet.</p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSubUnit(su)}
                              className="text-indigo-600 text-xs font-bold hover:underline"
                            >
                              Open Sub-Unit Workspace
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEditingSubUnit(su); setIsSubUnitFormOpen(true); }}
                              className="text-slate-500 text-xs font-bold hover:text-indigo-600 transition-colors"
                            >
                              Edit Sub-Unit
                            </button>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
                {subUnits.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400">No sub-units yet.</p>
                    <button
                      onClick={() => { setEditingSubUnit(null); setIsSubUnitFormOpen(true); }}
                      className="mt-2 text-indigo-600 text-sm font-bold hover:underline"
                    >
                      Add First Sub-Unit
                    </button>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="font-bold text-lg">典型例题 (Typical Examples)</h3>
                <div className="space-y-4">
                  {selectedUnit.typical_examples.map((ex, i) => (
                    <div key={i} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                      <div className="font-bold text-indigo-900 text-sm flex gap-2">
                        <span className="shrink-0">Q:</span>
                        <MarkdownRenderer content={ex.question} />
                      </div>
                      <div className="text-sm text-slate-600 pl-4 border-l-2 border-indigo-200 flex gap-2">
                        <span className="shrink-0">A:</span>
                        <MarkdownRenderer content={ex.solution} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="glass-card p-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">教学总结 (Teaching Summary)</h3>
                <button disabled className="flex items-center gap-2 text-slate-400 text-sm font-bold cursor-not-allowed" title="Coming Soon">
                  <Lightbulb size={16} /> AI Summary
                </button>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                {selectedUnit.teaching_summary || "No summary recorded for this unit yet."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">资料库 (Resources)</h3>
              <ResourceBankList resources={unitResourceBank} emptyLabel="No unit-level resources linked yet." />
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">备课提示 (AI Prompt)</h3>
              <div className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-indigo-300 leading-relaxed">
                {selectedUnit.ai_prompt_template}
              </div>
              <button
                onClick={() => handleCopyPrompt(selectedUnit.ai_prompt_template)}
                className="w-full btn-primary text-xs py-3"
              >
                Copy Prompt
              </button>
            </div>
          </div>
        </div>

        {isSubUnitFormOpen && (
          <SubUnitForm
            subUnit={editingSubUnit}
            onSave={handleSaveSubUnit}
            onCancel={() => { setIsSubUnitFormOpen(false); setEditingSubUnit(null); }}
          />
        )}
      </div>
    );
  }

  // ===== Year Group Units List =====
  if (selectedYear) {
    const yearUnits = sortTeachingUnits(teachingUnits.filter(u => u.year_group === selectedYear));
    const yearPrepSummary = yearPrepMap.get(selectedYear) || summarizeYearPrep(selectedYear, teachingUnits);
    const fullyReadyUnits = yearUnits.filter(unit => (unitPrepMap.get(unit.id)?.readinessPct || 0) === 100).length;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelectedYear(null)}
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
  }

  // ===== Year Groups Overview =====
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
};

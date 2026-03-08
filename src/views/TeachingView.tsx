import { useState, useEffect, useRef, useMemo } from 'react';
import { TeachingUnit, ClassProfile, SubUnit } from '../types';
import { TEACHING_YEAR_GROUPS, NON_TEACHING_GROUPS } from '../shared/constants';
import { getTeachingUnitResources } from '../lib/objectivePrep';
import { summarizeClassPrep, summarizeUnitPrep, summarizeYearPrep } from '../lib/prepCompleteness';
import { geminiService } from '../services/geminiService';
import { LOFilterStatus } from './teaching/helpers';
import { SubUnitDetailView } from './teaching/SubUnitDetailView';
import { UnitDetailView } from './teaching/UnitDetailView';
import { YearGroupUnitsView } from './teaching/YearGroupUnitsView';
import { YearGroupsOverview } from './teaching/YearGroupsOverview';

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
  const [isGeneratingUnitSummary, setIsGeneratingUnitSummary] = useState(false);
  const [unitSummaryError, setUnitSummaryError] = useState<string | null>(null);
  const teachingClasses = classes.filter(cls => !NON_TEACHING_GROUPS.has(cls.year_group));
  const unitPrepMap = useMemo(
    () => new Map(teachingUnits.map(unit => [unit.id, summarizeUnitPrep(unit)])),
    [teachingUnits]
  );
  const yearPrepMap = useMemo(
    () => new Map(TEACHING_YEAR_GROUPS.map(year => [year, summarizeYearPrep(year, teachingUnits)])),
    [teachingUnits]
  );
  const classPrepRows = useMemo(
    () => teachingClasses.map(cls => summarizeClassPrep(cls, teachingUnits)),
    [teachingClasses, teachingUnits]
  );

  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedUnit) {
      const updated = teachingUnits.find(u => u.id === selectedUnit.id);
      if (updated) setSelectedUnit(updated);
    }
  }, [teachingUnits]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    setUnitSummaryError(null);
  }, [selectedUnit?.id]);

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      onToast?.('Copied to clipboard!');
    });
  };

  const buildUnitPlanningContext = (unit: TeachingUnit) => ({
    yearGroup: unit.year_group,
    unitTitle: unit.title,
    prepMaterialTemplate: unit.prep_material_template,
    aiPromptTemplate: unit.ai_prompt_template,
    teachingSummary: unit.teaching_summary,
    typicalExamples: unit.typical_examples,
    resourceTitles: getTeachingUnitResources(unit).map(resource => resource.title.trim()).filter(Boolean),
    subUnits: unit.sub_units.map(subUnit => ({
      title: subUnit.title,
      objectives: subUnit.learning_objectives.map(objective => objective.objective).filter(Boolean),
      reflectionNotes: [
        subUnit.ai_summary,
        subUnit.classroom_exercises,
        subUnit.homework_content,
        subUnit.reflection?.student_reception,
        subUnit.reflection?.planned_content,
        subUnit.reflection?.actual_content,
        subUnit.reflection?.improvements,
      ].filter((value): value is string => !!value?.trim()),
    })),
  });

  const handleGenerateUnitSummary = async () => {
    if (!selectedUnit) return;

    setIsGeneratingUnitSummary(true);
    setUnitSummaryError(null);

    try {
      const summary = await geminiService.generateUnitTeachingSummary(buildUnitPlanningContext(selectedUnit));
      await Promise.resolve(onSaveUnit({ ...selectedUnit, teaching_summary: summary }));
      onToast?.('Teaching summary generated.');
    } catch (error) {
      setUnitSummaryError(error instanceof Error ? error.message : 'Failed to generate teaching summary.');
    } finally {
      setIsGeneratingUnitSummary(false);
    }
  };

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

  if (selectedSubUnit && selectedUnit) {
    return (
      <SubUnitDetailView
        selectedUnit={selectedUnit}
        selectedSubUnit={selectedSubUnit}
        loFilter={loFilter}
        setLoFilter={setLoFilter}
        onBack={() => { setSelectedSubUnit(null); setLoFilter('all'); }}
        onEditSubUnit={() => { setEditingSubUnit(selectedSubUnit); setIsSubUnitFormOpen(true); }}
        onDeleteSubUnit={handleDeleteSubUnit}
        onSaveUnit={onSaveUnit}
        onToast={onToast}
        setSelectedSubUnit={setSelectedSubUnit}
        isSubUnitFormOpen={isSubUnitFormOpen}
        editingSubUnit={editingSubUnit}
        onSaveSubUnit={handleSaveSubUnit}
        onCancelSubUnitForm={() => { setIsSubUnitFormOpen(false); setEditingSubUnit(null); }}
        dragOverIndex={dragOverIndex}
        onLODragStart={handleLODragStart}
        onLODragOver={handleLODragOver}
        onLODrop={handleLODrop}
        onLODragEnd={handleLODragEnd}
        dragIndexRef={dragIndexRef}
      />
    );
  }

  if (selectedUnit) {
    return (
      <UnitDetailView
        selectedUnit={selectedUnit}
        selectedYear={selectedYear}
        onBack={() => setSelectedUnit(null)}
        onUpdateUnit={onUpdateUnit}
        onDeleteUnit={onDeleteUnit}
        onSaveUnit={onSaveUnit}
        setSelectedUnit={setSelectedUnit}
        setSelectedSubUnit={setSelectedSubUnit}
        isSubUnitFormOpen={isSubUnitFormOpen}
        editingSubUnit={editingSubUnit}
        setEditingSubUnit={setEditingSubUnit}
        setIsSubUnitFormOpen={setIsSubUnitFormOpen}
        onSaveSubUnit={handleSaveSubUnit}
        onCancelSubUnitForm={() => { setIsSubUnitFormOpen(false); setEditingSubUnit(null); }}
        isGeneratingUnitSummary={isGeneratingUnitSummary}
        unitSummaryError={unitSummaryError}
        onGenerateUnitSummary={handleGenerateUnitSummary}
        onCopyPrompt={handleCopyPrompt}
      />
    );
  }

  if (selectedYear) {
    return (
      <YearGroupUnitsView
        selectedYear={selectedYear}
        teachingUnits={teachingUnits}
        unitPrepMap={unitPrepMap}
        yearPrepMap={yearPrepMap}
        onBack={() => setSelectedYear(null)}
        onAddUnit={onAddUnit}
        setSelectedUnit={setSelectedUnit}
      />
    );
  }

  return (
    <YearGroupsOverview
      teachingUnits={teachingUnits}
      yearPrepMap={yearPrepMap}
      classPrepRows={classPrepRows}
      onOpenSyllabus={onOpenSyllabus}
      setSelectedYear={setSelectedYear}
      setSelectedUnit={setSelectedUnit}
      onUpdateClass={onUpdateClass}
    />
  );
};

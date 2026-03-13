import { memo, lazy, Suspense, Dispatch, SetStateAction } from 'react';
import { Student, TeachingUnit, ClassProfile, TimetableEntry, WorkLog, SOP, Idea, Goal, SchoolEvent, Task, Project, ParentCommunication, ParentCommMethod, StudentWeakness } from '../types';
import { useAppData } from '../hooks/useAppData';

const StudentForm = lazy(() => import('./StudentForm').then(m => ({ default: m.StudentForm })));
const TeachingUnitForm = lazy(() => import('./TeachingUnitForm').then(m => ({ default: m.TeachingUnitForm })));
const ClassForm = lazy(() => import('./ClassForm').then(m => ({ default: m.ClassForm })));
const TimetableEntryForm = lazy(() => import('./TimetableEntryForm').then(m => ({ default: m.TimetableEntryForm })));
const WorkLogForm = lazy(() => import('./WorkLogForm').then(m => ({ default: m.WorkLogForm })));
const SOPForm = lazy(() => import('./SOPForm').then(m => ({ default: m.SOPForm })));
const IdeaForm = lazy(() => import('./IdeaForm').then(m => ({ default: m.IdeaForm })));
const GoalForm = lazy(() => import('./GoalForm').then(m => ({ default: m.GoalForm })));
const SchoolEventForm = lazy(() => import('./SchoolEventForm').then(m => ({ default: m.SchoolEventForm })));
const TaskForm = lazy(() => import('./TaskForm').then(m => ({ default: m.TaskForm })));
const ProjectForm = lazy(() => import('./ProjectForm').then(m => ({ default: m.ProjectForm })));
const ParentCommForm = lazy(() => import('./ParentCommForm').then(m => ({ default: m.ParentCommForm })));
const WeaknessForm = lazy(() => import('./WeaknessForm').then(m => ({ default: m.WeaknessForm })));
const GenericForm = lazy(() => import('./GenericForm').then(m => ({ default: m.GenericForm })));

export interface FormModalsState {
  isStudentFormOpen: boolean;
  editingStudent: Student | null;
  isTeachingUnitFormOpen: boolean;
  editingTeachingUnit: TeachingUnit | null;
  pendingNewUnitData: { year_group: string; title: string } | null;
  isClassFormOpen: boolean;
  editingClass: ClassProfile | null;
  isTimetableFormOpen: boolean;
  editingTimetableEntry: TimetableEntry | null;
  editingContextDate: string;
  isWorkLogFormOpen: boolean;
  editingWorkLog: WorkLog | null;
  isSOPFormOpen: boolean;
  editingSOP: SOP | null;
  isIdeaFormOpen: boolean;
  editingIdea: Idea | null;
  isGoalFormOpen: boolean;
  editingGoal: Goal | null;
  isEventFormOpen: boolean;
  editingEvent: SchoolEvent | null;
  isTaskFormOpen: boolean;
  editingTask: Task | null;
  taskFormInitialProjectId: string;
  isProjectFormOpen: boolean;
  editingProject: Project | null;
  parentCommFormConfig: {
    isOpen: boolean;
    title: string;
    initialValue?: ParentCommunication;
    onSave: (data: { date: string; method: ParentCommMethod; content: string; needs_follow_up: boolean; follow_up_plan?: string }) => void;
  };
  weaknessFormConfig: {
    isOpen: boolean;
    title: string;
    initialValue?: StudentWeakness;
    onSave: (weakness: StudentWeakness) => void;
  };
  genericFormConfig: {
    isOpen: boolean;
    title: string;
    label: string;
    initialValue?: string;
    onSave: (content: string) => void;
    placeholder?: string;
  };
}

export interface FormModalsSetters {
  setIsStudentFormOpen: (v: boolean) => void;
  setEditingStudent: (v: Student | null) => void;
  setIsTeachingUnitFormOpen: (v: boolean) => void;
  setEditingTeachingUnit: (v: TeachingUnit | null) => void;
  setPendingNewUnitData: (v: { year_group: string; title: string } | null) => void;
  setIsClassFormOpen: (v: boolean) => void;
  setEditingClass: (v: ClassProfile | null) => void;
  setIsTimetableFormOpen: (v: boolean) => void;
  setEditingTimetableEntry: (v: TimetableEntry | null) => void;
  setEditingContextDate: (v: string) => void;
  setIsWorkLogFormOpen: (v: boolean) => void;
  setEditingWorkLog: (v: WorkLog | null) => void;
  setIsSOPFormOpen: (v: boolean) => void;
  setEditingSOP: (v: SOP | null) => void;
  setIsIdeaFormOpen: (v: boolean) => void;
  setEditingIdea: (v: Idea | null) => void;
  setIsGoalFormOpen: (v: boolean) => void;
  setEditingGoal: (v: Goal | null) => void;
  setIsEventFormOpen: (v: boolean) => void;
  setEditingEvent: (v: SchoolEvent | null) => void;
  setIsTaskFormOpen: (v: boolean) => void;
  setEditingTask: (v: Task | null) => void;
  setTaskFormInitialProjectId: (v: string) => void;
  setIsProjectFormOpen: (v: boolean) => void;
  setEditingProject: (v: Project | null) => void;
  setParentCommFormConfig: Dispatch<SetStateAction<FormModalsState['parentCommFormConfig']>>;
  setWeaknessFormConfig: Dispatch<SetStateAction<FormModalsState['weaknessFormConfig']>>;
  setGenericFormConfig: Dispatch<SetStateAction<FormModalsState['genericFormConfig']>>;
}

interface FormModalsProps {
  state: FormModalsState;
  setters: FormModalsSetters;
  data: ReturnType<typeof useAppData>;
}

export const FormModals = memo(function FormModals({ state, setters, data }: FormModalsProps) {
  return (
    <Suspense fallback={null}>
      {state.isStudentFormOpen && (
        <StudentForm
          student={state.editingStudent}
          onSave={async (s) => { await data.saveStudent(s); setters.setIsStudentFormOpen(false); setters.setEditingStudent(null); }}
          onCancel={() => { setters.setIsStudentFormOpen(false); setters.setEditingStudent(null); }}
        />
      )}
      {state.isTeachingUnitFormOpen && (
        <TeachingUnitForm
          unit={state.editingTeachingUnit}
          onSave={async (u) => { await data.saveTeachingUnit(u); setters.setIsTeachingUnitFormOpen(false); setters.setEditingTeachingUnit(null); setters.setPendingNewUnitData(null); }}
          onCancel={() => { setters.setIsTeachingUnitFormOpen(false); setters.setEditingTeachingUnit(null); setters.setPendingNewUnitData(null); }}
          initialData={state.pendingNewUnitData}
        />
      )}
      {state.isClassFormOpen && (
        <ClassForm
          classProfile={state.editingClass}
          teachingUnits={data.teachingUnits}
          onSave={async (c) => { await data.saveClass(c); setters.setIsClassFormOpen(false); setters.setEditingClass(null); }}
          onCancel={() => { setters.setIsClassFormOpen(false); setters.setEditingClass(null); }}
        />
      )}
      {state.isTimetableFormOpen && state.editingTimetableEntry && (
        <TimetableEntryForm
          entry={state.editingTimetableEntry}
          classes={data.classes}
          teachingUnits={data.teachingUnits}
          allEntries={data.timetable}
          onSave={(e) => { data.updateTimetableEntry(e); setters.setIsTimetableFormOpen(false); setters.setEditingTimetableEntry(null); }}
          onCancel={() => { setters.setIsTimetableFormOpen(false); setters.setEditingTimetableEntry(null); }}
          contextDate={state.editingContextDate}
          onCreateOverride={(e) => { data.addTimetableEntry(e); setters.setIsTimetableFormOpen(false); setters.setEditingTimetableEntry(null); }}
          onDeleteOverride={(id) => { data.deleteTimetableEntry(id); setters.setIsTimetableFormOpen(false); setters.setEditingTimetableEntry(null); }}
          lessonRecords={data.lessonRecords}
          onUpdateLessonRecord={data.updateLessonRecord}
          onAddLessonRecord={data.addLessonRecord}
          students={data.students}
          meetings={data.meetings}
          onSaveUnit={(unit) => data.saveTeachingUnit(unit)}
        />
      )}
      {state.isWorkLogFormOpen && (
        <WorkLogForm
          workLog={state.editingWorkLog}
          onSave={(d) => {
            if (state.editingWorkLog) {
              data.updateWorkLog(state.editingWorkLog.id, d);
            } else {
              data.addWorkLog(d);
            }
            setters.setIsWorkLogFormOpen(false);
            setters.setEditingWorkLog(null);
          }}
          onCancel={() => { setters.setIsWorkLogFormOpen(false); setters.setEditingWorkLog(null); }}
        />
      )}
      {state.isSOPFormOpen && (
        <SOPForm
          sop={state.editingSOP}
          onSave={(d) => {
            if (state.editingSOP) {
              data.updateSOP(state.editingSOP.id, d);
            } else {
              data.addSOP(d);
            }
            setters.setIsSOPFormOpen(false);
            setters.setEditingSOP(null);
          }}
          onCancel={() => { setters.setIsSOPFormOpen(false); setters.setEditingSOP(null); }}
        />
      )}
      {state.isIdeaFormOpen && (
        <IdeaForm
          idea={state.editingIdea}
          onSave={(d) => {
            if (state.editingIdea) {
              data.updateIdea(state.editingIdea.id, d);
            } else {
              data.addIdea(d);
            }
            setters.setIsIdeaFormOpen(false);
            setters.setEditingIdea(null);
          }}
          onCancel={() => { setters.setIsIdeaFormOpen(false); setters.setEditingIdea(null); }}
        />
      )}
      {state.isGoalFormOpen && (
        <GoalForm
          goal={state.editingGoal}
          onSave={(d) => {
            if (state.editingGoal) {
              data.updateGoal(state.editingGoal.id, d);
            } else {
              data.addGoal(d);
            }
            setters.setIsGoalFormOpen(false);
            setters.setEditingGoal(null);
          }}
          onCancel={() => { setters.setIsGoalFormOpen(false); setters.setEditingGoal(null); }}
        />
      )}
      {state.isEventFormOpen && (
        <SchoolEventForm
          event={state.editingEvent}
          onSave={(d) => {
            if (state.editingEvent) {
              data.updateSchoolEvent(state.editingEvent.id, d);
            } else {
              data.addSchoolEvent(d);
            }
            setters.setIsEventFormOpen(false);
            setters.setEditingEvent(null);
          }}
          onCancel={() => { setters.setIsEventFormOpen(false); setters.setEditingEvent(null); }}
        />
      )}
      {state.isTaskFormOpen && (
        <TaskForm
          task={state.editingTask}
          projects={data.projects}
          milestones={data.milestones}
          initialProjectId={state.taskFormInitialProjectId || undefined}
          onSave={(d) => {
            if (state.editingTask) {
              data.updateTask(state.editingTask.id, d);
            } else {
              data.addTask(d);
            }
            setters.setIsTaskFormOpen(false);
            setters.setEditingTask(null);
            setters.setTaskFormInitialProjectId('');
          }}
          onCancel={() => { setters.setIsTaskFormOpen(false); setters.setEditingTask(null); setters.setTaskFormInitialProjectId(''); }}
        />
      )}
      {state.isProjectFormOpen && (
        <ProjectForm
          project={state.editingProject}
          onSave={(d) => {
            if (state.editingProject) {
              data.updateProject(state.editingProject.id, d);
            } else {
              data.addProject({ ...d, created_at: new Date().toISOString() });
            }
            setters.setIsProjectFormOpen(false);
            setters.setEditingProject(null);
          }}
          onCancel={() => { setters.setIsProjectFormOpen(false); setters.setEditingProject(null); }}
        />
      )}
      {state.parentCommFormConfig.isOpen && (
        <ParentCommForm
          title={state.parentCommFormConfig.title}
          initialValue={state.parentCommFormConfig.initialValue}
          onSave={state.parentCommFormConfig.onSave}
          onCancel={() => setters.setParentCommFormConfig(prev => ({ ...prev, isOpen: false }))}
        />
      )}
      {state.weaknessFormConfig.isOpen && (
        <WeaknessForm
          title={state.weaknessFormConfig.title}
          initialValue={state.weaknessFormConfig.initialValue}
          onSave={state.weaknessFormConfig.onSave}
          onCancel={() => setters.setWeaknessFormConfig(prev => ({ ...prev, isOpen: false }))}
        />
      )}
      {state.genericFormConfig.isOpen && (
        <GenericForm
          title={state.genericFormConfig.title}
          label={state.genericFormConfig.label}
          initialValue={state.genericFormConfig.initialValue}
          onSave={state.genericFormConfig.onSave}
          onCancel={() => setters.setGenericFormConfig(prev => ({ ...prev, isOpen: false }))}
          placeholder={state.genericFormConfig.placeholder}
        />
      )}
    </Suspense>
  );
});

import { memo } from 'react';
import { Settings } from 'lucide-react';
import { format } from 'date-fns';
import { FormModalsSetters } from './FormModals';
import type { useAppData } from '../hooks/useAppData';

type AppData = ReturnType<typeof useAppData>;

interface ViewRouterProps {
  activeTab: string;
  data: AppData;
  formSetters: FormModalsSetters;
  navigateTo: (tab: string) => void;
  currentTime: Date;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;
  selectedTeachingUnitId: string | null;
  setSelectedTeachingUnitId: (id: string | null) => void;
  hpHistoryStudentFilter: string | null;
  setHpHistoryStudentFilter: (id: string | null) => void;
  pendingCalendarDate: string | undefined;
  setPendingCalendarDate: (date: string | undefined) => void;
  setIsSyllabusModalOpen: (open: boolean) => void;

  // All views passed in as lazy components
  DashboardView: React.ComponentType<any>;
  StudentsView: React.ComponentType<any>;
  TeachingView: React.ComponentType<any>;
  TasksView: React.ComponentType<any>;
  CalendarView: React.ComponentType<any>;
  SOPView: React.ComponentType<any>;
  WorkLogView: React.ComponentType<any>;
  IdeasView: React.ComponentType<any>;
  MeetingsView: React.ComponentType<any>;
  LessonRecordsView: React.ComponentType<any>;
  GoalsView: React.ComponentType<any>;
  SchoolEventsView: React.ComponentType<any>;
  HousePointHistoryView: React.ComponentType<any>;
  EmailDigestView: React.ComponentType<any>;
  ProjectsView: React.ComponentType<any>;
  ProjectDetailView: React.ComponentType<any>;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  SettingsView: React.ComponentType<any>;
  KahootHub: React.ComponentType<any>;
  PayhipHub: React.ComponentType<any>;
  PaperHub: React.ComponentType<any>;
  CoverHub: React.ComponentType<any>;
  TikzHub: React.ComponentType<any>;
}

export const ViewRouter = memo(function ViewRouter({
  activeTab,
  data,
  formSetters,
  navigateTo,
  currentTime,
  selectedStudentId,
  setSelectedStudentId,
  selectedClassId,
  setSelectedClassId,
  selectedTeachingUnitId,
  setSelectedTeachingUnitId,
  hpHistoryStudentFilter,
  setHpHistoryStudentFilter,
  pendingCalendarDate,
  setPendingCalendarDate,
  setIsSyllabusModalOpen,
  DashboardView,
  StudentsView,
  TeachingView,
  TasksView,
  CalendarView,
  SOPView,
  WorkLogView,
  IdeasView,
  MeetingsView,
  LessonRecordsView,
  GoalsView,
  SchoolEventsView,
  HousePointHistoryView,
  EmailDigestView,
  ProjectsView,
  ProjectDetailView,
  selectedProjectId,
  setSelectedProjectId,
  SettingsView,
  KahootHub,
  PayhipHub,
  PaperHub,
  CoverHub,
  TikzHub,
}: ViewRouterProps) {
  const {
    setGenericFormConfig, setWeaknessFormConfig, setParentCommFormConfig,
    setEditingStudent, setIsStudentFormOpen,
    setEditingClass, setIsClassFormOpen,
    setEditingTeachingUnit, setIsTeachingUnitFormOpen, setPendingNewUnitData,
    setEditingGoal, setIsGoalFormOpen,
    setEditingEvent, setIsEventFormOpen,
    setEditingTask, setIsTaskFormOpen,
    setTaskFormInitialProjectId,
    setEditingProject, setIsProjectFormOpen,
    setEditingWorkLog, setIsWorkLogFormOpen,
    setEditingSOP, setIsSOPFormOpen,
    setEditingIdea, setIsIdeaFormOpen,
    setEditingTimetableEntry, setEditingContextDate, setIsTimetableFormOpen,
  } = formSetters;

  const getCurrentEvent = () => {
    const todayStr = format(currentTime, 'yyyy-MM-dd');
    const timeStr = format(currentTime, 'HH:mm');
    const isoWeekday = currentTime.getDay() === 0 ? 7 : currentTime.getDay();
    return data.timetable.find(e => e.date === todayStr && timeStr >= e.start_time && timeStr <= e.end_time)
      || data.timetable.find(e => !e.date && e.day === isoWeekday && timeStr >= e.start_time && timeStr <= e.end_time);
  };

  const getNextEvent = () => {
    const todayStr = format(currentTime, 'yyyy-MM-dd');
    const timeStr = format(currentTime, 'HH:mm');
    const isoWeekday = currentTime.getDay() === 0 ? 7 : currentTime.getDay();
    const dateSpecific = data.timetable.filter(e => e.date === todayStr);
    const recurring = data.timetable.filter(e => !e.date && e.day === isoWeekday);
    const overriddenTimes = new Set(dateSpecific.map(e => e.start_time));
    const merged = [...dateSpecific, ...recurring.filter(e => !overriddenTimes.has(e.start_time))];
    return merged.sort((a, b) => a.start_time.localeCompare(b.start_time)).find(e => e.start_time > timeStr);
  };

  const openStatusRecordForm = (studentId: string) => {
    setGenericFormConfig({
      isOpen: true,
      title: 'Add Learning Status',
      label: 'Status Content',
      placeholder: "Describe the student's learning status (supports Markdown and LaTeX)...",
      onSave: async (content) => {
        await data.addStatusRecord(studentId, content);
        setGenericFormConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const openParentCommForm = (studentId: string) => {
    setParentCommFormConfig({
      isOpen: true,
      title: '新增家校沟通记录',
      onSave: async (formData) => {
        await data.addParentCommunication(studentId, formData);
        setParentCommFormConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const openRequestForm = (studentId: string) => {
    setGenericFormConfig({
      isOpen: true,
      title: 'New Student Request',
      label: 'Request Details',
      placeholder: 'What is the student requesting? (supports Markdown and LaTeX)...',
      onSave: async (content) => {
        await data.addStudentRequest(studentId, content);
        setGenericFormConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  switch (activeTab) {
    case 'dashboard':
      return (
        <DashboardView
          currentEvent={getCurrentEvent()}
          nextEvent={getNextEvent()}
          onSelectUnit={(id) => { setSelectedTeachingUnitId(id); navigateTo('teaching'); }}
          classes={data.classes}
          teachingUnits={data.teachingUnits}
          goals={data.goals}
          schoolEvents={data.schoolEvents}
          workLogs={data.workLogs}
          ideas={data.ideas}
          tasks={data.tasks}
          projects={data.projects}
          milestones={data.milestones}
          devlogs={data.devlogs}
          students={data.students}
          onNavigate={navigateTo}
        />
      );
    case 'timetable':
      return (
        <CalendarView
          timetable={data.timetable}
          onEditEntry={(entry: any, contextDate: string) => {
            setEditingTimetableEntry(entry);
            setEditingContextDate(contextDate);
            setIsTimetableFormOpen(true);
          }}
          onAddEntry={data.addTimetableEntry}
          onUpdateEntry={data.updateTimetableEntry}
          classes={data.classes}
          teachingUnits={data.teachingUnits}
          lessonRecords={data.lessonRecords}
          initialDate={pendingCalendarDate}
        />
      );
    case 'students':
      return (
        <StudentsView
          students={data.students}
          classes={data.classes}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          selectedClassId={selectedClassId}
          onSelectClass={setSelectedClassId}
          onAddStudent={() => { setEditingStudent(null); setIsStudentFormOpen(true); }}
          onUpdateStudent={(id) => {
            const s = data.students.find(s => s.id === id);
            if (s) { setEditingStudent(s); setIsStudentFormOpen(true); }
          }}
          onDeleteStudent={data.deleteStudent}
          onAddClass={() => { setEditingClass(null); setIsClassFormOpen(true); }}
          onUpdateClass={(id) => {
            const c = data.classes.find(c => c.id === id);
            if (c) { setEditingClass(c); setIsClassFormOpen(true); }
          }}
          onDeleteClass={data.deleteClass}
          onAddStatusRecord={openStatusRecordForm}
          onEditStatusRecord={(studentId, recordId, currentContent) => {
            setGenericFormConfig({
              isOpen: true,
              title: 'Edit Status Record',
              label: 'Status Content',
              initialValue: currentContent,
              placeholder: "Describe the student's learning status (supports Markdown and LaTeX)...",
              onSave: async (content) => {
                await data.updateStatusRecord(studentId, recordId, content);
                setGenericFormConfig(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
          onDeleteStatusRecord={data.deleteStatusRecord}
          onAddWeakness={(studentId) => {
            setWeaknessFormConfig({
              isOpen: true,
              title: 'Add Weakness',
              onSave: async (weakness) => {
                await data.addWeakness(studentId, weakness);
                setWeaknessFormConfig(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
          onEditWeakness={(studentId, index, weakness) => {
            setWeaknessFormConfig({
              isOpen: true,
              title: 'Edit Weakness',
              initialValue: weakness,
              onSave: async (updated) => {
                await data.updateWeakness(studentId, index, updated);
                setWeaknessFormConfig(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
          onDeleteWeakness={data.deleteWeakness}
          onAddRequest={openRequestForm}
          onEditRequest={(studentId, requestId, currentContent) => {
            setGenericFormConfig({
              isOpen: true,
              title: 'Edit Request',
              label: 'Request Details',
              initialValue: currentContent,
              placeholder: 'What is the student requesting? (supports Markdown and LaTeX)...',
              onSave: async (content) => {
                await data.updateStudentRequest(studentId, requestId, content);
                setGenericFormConfig(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
          onDeleteRequest={data.deleteStudentRequest}
          onToggleRequestStatus={data.toggleRequestStatus}
          onUpdateRequestDate={data.updateRequestDate}
          onAddParentComm={openParentCommForm}
          onEditParentComm={(studentId, comm) => {
            setParentCommFormConfig({
              isOpen: true,
              title: '编辑家校沟通记录',
              initialValue: comm,
              onSave: async (formData) => {
                await data.updateParentCommunication(studentId, comm.id, formData);
                setParentCommFormConfig(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
          onAddParentCommFollowUp={(studentId, commId) => {
            setGenericFormConfig({
              isOpen: true,
              title: '追加跟进记录',
              label: '跟进状况',
              placeholder: '记录后续跟进状况...',
              onSave: async (content) => {
                await data.addParentCommFollowUp(studentId, commId, content);
                setGenericFormConfig(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
          onDeleteParentComm={data.deleteParentCommunication}
          onToggleParentCommStatus={data.toggleParentCommunicationStatus}
          onUpdateParentCommDate={data.updateParentCommDate}
          onAddExamRecord={data.addExamRecord}
          onBatchAwardHP={(awards) => data.batchAwardHP(awards)}
          hpAwardLogs={data.hpAwardLogs}
          onNavigateToHPHistory={(studentId) => {
            setHpHistoryStudentFilter(studentId);
            navigateTo('hp-history');
          }}
        />
      );
    case 'teaching':
      return (
        <TeachingView
          teachingUnits={data.teachingUnits}
          onOpenSyllabus={() => setIsSyllabusModalOpen(true)}
          initialUnitId={selectedTeachingUnitId}
          onClearInitialUnit={() => setSelectedTeachingUnitId(null)}
          onAddUnit={() => { setEditingTeachingUnit(null); setPendingNewUnitData(null); setIsTeachingUnitFormOpen(true); }}
          onUpdateUnit={(id) => {
            const u = data.teachingUnits.find(u => u.id === id);
            if (u) { setEditingTeachingUnit(u); setIsTeachingUnitFormOpen(true); }
          }}
          onDeleteUnit={data.deleteTeachingUnit}
          onSaveUnit={(unit) => data.saveTeachingUnit(unit)}
          classes={data.classes}
          onUpdateClass={(id) => {
            const c = data.classes.find(c => c.id === id);
            if (c) { setEditingClass(c); setIsClassFormOpen(true); }
          }}
          onToast={(msg) => data.toast.success(msg)}
        />
      );
    case 'sop':
      return (
        <SOPView
          sops={data.sops}
          onAddSOP={() => { setEditingSOP(null); setIsSOPFormOpen(true); }}
          onDeleteSOP={data.deleteSOP}
          onEditSOP={(sop) => { setEditingSOP(sop); setIsSOPFormOpen(true); }}
          onConsolidate={data.consolidateSOPs}
        />
      );
    case 'worklogs':
      return (
        <WorkLogView
          workLogs={data.workLogs}
          onAddLog={() => { setEditingWorkLog(null); setIsWorkLogFormOpen(true); }}
          onDeleteLog={data.deleteWorkLog}
          onEditLog={(log) => { setEditingWorkLog(log); setIsWorkLogFormOpen(true); }}
          onConsolidate={data.consolidateWorkLogs}
        />
      );
    case 'ideas':
      return (
        <IdeasView
          ideas={data.ideas}
          onAddIdea={() => { setEditingIdea(null); setIsIdeaFormOpen(true); }}
          onDeleteIdea={data.deleteIdea}
          onEditIdea={(idea) => { setEditingIdea(idea); setIsIdeaFormOpen(true); }}
          onToggleStatus={data.toggleIdeaStatus}
          onToggleDashboard={data.toggleIdeaDashboard}
          onConsolidate={data.consolidateIdeas}
          onConvertToTask={(idea) => {
            data.addTask({ title: idea.title, description: idea.content, status: 'inbox', priority: idea.priority, source_type: 'idea', source_id: idea.id });
          }}
        />
      );
    case 'tasks':
      return (
        <TasksView
          tasks={data.tasks}
          projects={data.projects}
          onAddTask={() => { setTaskFormInitialProjectId(''); setEditingTask(null); setIsTaskFormOpen(true); }}
          onEditTask={(task) => { setTaskFormInitialProjectId(''); setEditingTask(task); setIsTaskFormOpen(true); }}
          onDeleteTask={data.deleteTask}
          onCycleStatus={data.cycleTaskStatus}
          onNavigate={navigateTo}
        />
      );
    case 'meetings':
      return (
        <MeetingsView
          meetings={data.meetings}
          onAddMeeting={data.addMeeting}
          onUpdateMeeting={data.updateMeeting}
          onDeleteMeeting={data.deleteMeeting}
          onAddTask={data.addTask}
          tasks={data.tasks}
          onCycleTaskStatus={data.cycleTaskStatus}
          onAddSOP={data.addSOP}
        />
      );
    case 'email-digest':
      return (
        <EmailDigestView
          emailDigests={data.emailDigests}
          onAddEmailDigest={data.addEmailDigest}
          onUpdateEmailDigest={data.updateEmailDigest}
          onDeleteEmailDigest={data.deleteEmailDigest}
          onAddTask={data.addTask}
          tasks={data.tasks}
          onCycleTaskStatus={data.cycleTaskStatus}
        />
      );
    case 'hp-history':
      return (
        <HousePointHistoryView
          hpAwardLogs={data.hpAwardLogs}
          students={data.students}
          classes={data.classes}
          onDeleteLog={data.deleteHPAwardLog}
          initialStudentFilter={hpHistoryStudentFilter}
          onClearInitialFilter={() => setHpHistoryStudentFilter(null)}
        />
      );
    case 'lessons':
      return (
        <LessonRecordsView
          lessonRecords={data.lessonRecords}
          classes={data.classes}
          students={data.students}
          onAdd={data.addLessonRecord}
          onUpdate={data.updateLessonRecord}
          onDelete={data.deleteLessonRecord}
          onViewInCalendar={(date) => {
            setPendingCalendarDate(date);
            navigateTo('timetable');
          }}
        />
      );
    case 'goals':
      return (
        <GoalsView
          goals={data.goals}
          onAddGoal={() => { setEditingGoal(null); setIsGoalFormOpen(true); }}
          onDeleteGoal={data.deleteGoal}
          onEditGoal={(goal) => { setEditingGoal(goal); setIsGoalFormOpen(true); }}
          onUpdateGoal={(id, updates) => data.updateGoal(id, updates)}
        />
      );
    case 'events':
      return (
        <SchoolEventsView
          schoolEvents={data.schoolEvents}
          onAddEvent={() => { setEditingEvent(null); setIsEventFormOpen(true); }}
          onDeleteEvent={data.deleteSchoolEvent}
          onEditEvent={(event) => { setEditingEvent(event); setIsEventFormOpen(true); }}
        />
      );
    case 'projects':
      return (
        <ProjectsView
          projects={data.projects}
          tasks={data.tasks}
          milestones={data.milestones}
          devlogs={data.devlogs}
          onAddProject={() => { setEditingProject(null); setIsProjectFormOpen(true); }}
          onEditProject={(project) => { setEditingProject(project); setIsProjectFormOpen(true); }}
          onDeleteProject={data.deleteProject}
          onUpdateProject={(id, updates) => data.updateProject(id, updates)}
          onAddTaskForProject={(projectId) => { setTaskFormInitialProjectId(projectId); setEditingTask(null); setIsTaskFormOpen(true); }}
          onEditTask={(task) => { setTaskFormInitialProjectId(''); setEditingTask(task); setIsTaskFormOpen(true); }}
          onNavigate={navigateTo}
          onOpenProject={(id) => { setSelectedProjectId(id); navigateTo('project-detail'); }}
        />
      );
    case 'project-detail': {
      const project = data.projects.find(p => p.id === selectedProjectId);
      if (!project) return <div className="glass-card p-12 text-center text-slate-400">Project not found.</div>;
      return (
        <ProjectDetailView
          project={project}
          allProjects={data.projects}
          onSwitchProject={(id) => { setSelectedProjectId(id); }}
          tasks={data.tasks}
          milestones={data.milestones}
          devlogs={data.devlogs}
          threads={data.threads}
          onBack={() => navigateTo('projects')}
          onEditProject={(p) => { setEditingProject(p); setIsProjectFormOpen(true); }}
          onDeleteProject={data.deleteProject}
          onUpdateProject={(id, updates) => data.updateProject(id, updates)}
          onAddTaskForProject={(projectId) => { setTaskFormInitialProjectId(projectId); setEditingTask(null); setIsTaskFormOpen(true); }}
          addTask={data.addTask}
          addMilestone={data.addMilestone}
          updateMilestone={data.updateMilestone}
          deleteMilestone={data.deleteMilestone}
          cycleMilestoneStatus={data.cycleMilestoneStatus}
          saveMilestoneReview={data.saveMilestoneReview}
          reorderMilestones={data.reorderMilestones}
          addDevLog={data.addDevLog}
          updateDevLog={data.updateDevLog}
          deleteDevLog={data.deleteDevLog}
          addThread={data.addThread}
          updateThread={data.updateThread}
          deleteThread={data.deleteThread}
        />
      );
    }
    case 'kahoot-upload':
      return (
        <KahootHub
          kahootItems={data.kahootItems}
          onAddKahoot={data.addKahoot}
          onUpdateKahoot={data.updateKahoot}
          onDeleteKahoot={data.deleteKahoot}
          onDuplicateKahoot={data.duplicateKahoot}
          toast={data.toast}
        />
      );
    case 'payhip-upload':
      return (
        <PayhipHub
          payhipItems={data.payhipItems}
          onUpdatePayhip={data.updatePayhip}
          onTogglePipeline={data.togglePayhipPipelineStage}
          onBulkPipeline={data.bulkSetPayhipPipeline}
          toast={data.toast}
        />
      );
    case 'paper-gen':
      return <PaperHub />;
    case 'cover-design':
      return <CoverHub />;
    case 'tikz-vault':
      return <TikzHub />;
    case 'settings':
      return (
        <SettingsView
          data={{
            timetable: data.timetable,
            students: data.students,
            teachingUnits: data.teachingUnits,
            classes: data.classes,
            ideas: data.ideas,
            sops: data.sops,
            goals: data.goals,
            schoolEvents: data.schoolEvents,
            workLogs: data.workLogs,
            meetings: data.meetings,
            lessonRecords: data.lessonRecords,
            tasks: data.tasks,
            hpAwardLogs: data.hpAwardLogs,
            emailDigests: data.emailDigests,
            projects: data.projects,
            milestones: data.milestones,
            devlogs: data.devlogs,
            kahootItems: data.kahootItems,
            payhipItems: data.payhipItems,
          }}
          onImport={data.bulkImport}
        />
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <Settings size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">Coming Soon</p>
          <p className="text-sm">This module is under development.</p>
        </div>
      );
  }
});

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { CheckCircle2, Menu, X, Settings, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Student, StudentWeakness, ParentCommunication, ParentCommMethod, TeachingUnit, ClassProfile, TimetableEntry, Idea, SOP, WorkLog, MeetingRecord, Goal, SchoolEvent, LessonRecord, Task, EmailDigest, Project } from './types';
import { useAppData } from './hooks/useAppData';
import { SIDEBAR_ITEMS, SIDEBAR_GROUPS } from './shared/sidebarConfig';
import { SidebarItem } from './components/SidebarItem';
import { QuickCapture } from './components/QuickCapture';
import { SyllabusModal } from './components/SyllabusModal';
import { ToastContainer } from './components/ToastContainer';
import { StudentForm } from './components/StudentForm';
import { TeachingUnitForm } from './components/TeachingUnitForm';
import { ClassForm } from './components/ClassForm';
import { GenericForm } from './components/GenericForm';
import { WeaknessForm } from './components/WeaknessForm';
import { ParentCommForm } from './components/ParentCommForm';
import { TimetableEntryForm } from './components/TimetableEntryForm';
import { WorkLogForm } from './components/WorkLogForm';
import { SOPForm } from './components/SOPForm';
import { IdeaForm } from './components/IdeaForm';
import { GoalForm } from './components/GoalForm';
import { SchoolEventForm } from './components/SchoolEventForm';
import { TaskForm } from './components/TaskForm';
import { ProjectForm } from './components/ProjectForm';
import { LoginGate, useAuth } from './components/LoginGate';
import { GlobalSearch } from './components/GlobalSearch';
import { DashboardView } from './views/DashboardView';
import { CalendarView } from './views/CalendarView';
import { StudentsView } from './views/StudentsView';
import { TeachingView } from './views/TeachingView';
import { SOPView } from './views/SOPView';
import { WorkLogView } from './views/WorkLogView';
import { IdeasView } from './views/IdeasView';
import { MeetingsView } from './views/MeetingsView';
import { LessonRecordsView } from './views/LessonRecordsView';
import { GoalsView } from './views/GoalsView';
import { SchoolEventsView } from './views/SchoolEventsView';
import { TasksView } from './views/TasksView';
import { HousePointHistoryView } from './views/HousePointHistoryView';
import { EmailDigestView } from './views/EmailDigestView';
import { ProjectsView } from './views/ProjectsView';
import { SettingsView } from './views/SettingsView';

// Lazy-load Kahoot Hub (large module with 202-item seed data)
const KahootHub = lazy(() => import('./views/kahoot/KahootHub').then(m => ({ default: m.KahootHub })));

function LazyFallback() {
  return (
    <div className="flex items-center justify-center h-[40vh] text-slate-400">
      <Loader2 size={24} className="animate-spin mr-3" />
      <span className="text-sm font-medium">Loading module...</span>
    </div>
  );
}

function AppContent() {
  const data = useAppData();
  const { logout } = useAuth();
  // --- UI State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [selectedTeachingUnitId, setSelectedTeachingUnitId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [hpHistoryStudentFilter, setHpHistoryStudentFilter] = useState<string | null>(null);
  const [pendingNewUnitData, setPendingNewUnitData] = useState<{ year_group: string; title: string } | null>(null);

  // Form modals
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isTeachingUnitFormOpen, setIsTeachingUnitFormOpen] = useState(false);
  const [editingTeachingUnit, setEditingTeachingUnit] = useState<TeachingUnit | null>(null);
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassProfile | null>(null);
  const [isTimetableFormOpen, setIsTimetableFormOpen] = useState(false);
  const [editingTimetableEntry, setEditingTimetableEntry] = useState<TimetableEntry | null>(null);
  const [editingContextDate, setEditingContextDate] = useState<string>('');
  const [pendingCalendarDate, setPendingCalendarDate] = useState<string | undefined>(undefined);
  const [isWorkLogFormOpen, setIsWorkLogFormOpen] = useState(false);
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | null>(null);
  const [isSOPFormOpen, setIsSOPFormOpen] = useState(false);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // ParentCommForm
  const [parentCommFormConfig, setParentCommFormConfig] = useState<{
    isOpen: boolean;
    title: string;
    initialValue?: ParentCommunication;
    onSave: (data: { date: string; method: ParentCommMethod; content: string; needs_follow_up: boolean; follow_up_plan?: string }) => void;
  }>({ isOpen: false, title: '', onSave: () => {} });

  // WeaknessForm
  const [weaknessFormConfig, setWeaknessFormConfig] = useState<{
    isOpen: boolean;
    title: string;
    initialValue?: StudentWeakness;
    onSave: (weakness: StudentWeakness) => void;
  }>({ isOpen: false, title: '', onSave: () => {} });

  // GenericForm for student status/requests
  const [genericFormConfig, setGenericFormConfig] = useState<{
    isOpen: boolean;
    title: string;
    label: string;
    initialValue?: string;
    onSave: (content: string) => void;
    placeholder?: string;
  }>({ isOpen: false, title: '', label: '', onSave: () => {} });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- Timetable/Calendar helpers ---
  const getCurrentEvent = () => {
    const todayStr = format(currentTime, 'yyyy-MM-dd');
    const timeStr = format(currentTime, 'HH:mm');
    const isoWeekday = currentTime.getDay() === 0 ? 7 : currentTime.getDay();
    // Date-specific entries take priority over recurring
    return data.timetable.find(e => e.date === todayStr && timeStr >= e.start_time && timeStr <= e.end_time)
      || data.timetable.find(e => !e.date && e.day === isoWeekday && timeStr >= e.start_time && timeStr <= e.end_time);
  };

  const getNextEvent = () => {
    const todayStr = format(currentTime, 'yyyy-MM-dd');
    const timeStr = format(currentTime, 'HH:mm');
    const isoWeekday = currentTime.getDay() === 0 ? 7 : currentTime.getDay();
    const dateSpecific = data.timetable.filter(e => e.date === todayStr);
    const recurring = data.timetable.filter(e => !e.date && e.day === isoWeekday);
    // Date-specific entries override recurring at the same start_time
    const overriddenTimes = new Set(dateSpecific.map(e => e.start_time));
    const merged = [...dateSpecific, ...recurring.filter(e => !overriddenTimes.has(e.start_time))];
    return merged
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .find(e => e.start_time > timeStr);
  };

  // --- GenericForm openers for student sub-records ---
  const openStatusRecordForm = (studentId: string) => {
    setGenericFormConfig({
      isOpen: true,
      title: 'Add Learning Status',
      label: 'Status Content',
      placeholder: 'Describe the student\'s learning status (supports Markdown and LaTeX)...',
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

  // --- Scroll ref ---
  const mainRef = useRef<HTMLElement>(null);

  // --- Sidebar navigation helper ---
  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeSidebarItem = SIDEBAR_ITEMS.find(item => item.key === activeTab);
  const MobileTabIcon = activeSidebarItem?.icon || Settings;

  // --- Content Renderer ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            currentEvent={getCurrentEvent()}
            nextEvent={getNextEvent()}
            onSelectUnit={(id) => { setSelectedTeachingUnitId(id); setActiveTab('teaching'); }}
            classes={data.classes}
            teachingUnits={data.teachingUnits}
            goals={data.goals}
            schoolEvents={data.schoolEvents}
            workLogs={data.workLogs}
            ideas={data.ideas}
            tasks={data.tasks}
            projects={data.projects}
            students={data.students}
            onNavigate={(tab) => {
              setActiveTab(tab);
            }}
          />
        );
      case 'timetable':
        return (
          <CalendarView
            timetable={data.timetable}
            onEditEntry={(entry, contextDate) => {
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
                placeholder: 'Describe the student\'s learning status (supports Markdown and LaTeX)...',
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
              setActiveTab('hp-history');
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
            onAddTask={() => { setEditingTask(null); setIsTaskFormOpen(true); }}
            onEditTask={(task) => { setEditingTask(task); setIsTaskFormOpen(true); }}
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
              setActiveTab('timetable');
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
            onAddProject={() => { setEditingProject(null); setIsProjectFormOpen(true); }}
            onEditProject={(project) => { setEditingProject(project); setIsProjectFormOpen(true); }}
            onDeleteProject={data.deleteProject}
            onUpdateProject={(id, updates) => data.updateProject(id, updates)}
          />
        );
      case 'kahoot-upload':
        return (
          <Suspense fallback={<LazyFallback />}>
            <KahootHub
              kahootItems={data.kahootItems}
              onAddKahoot={data.addKahoot}
              onUpdateKahoot={data.updateKahoot}
              onDeleteKahoot={data.deleteKahoot}
              onDuplicateKahoot={data.duplicateKahoot}
              toast={data.toast}
            />
          </Suspense>
        );
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
              kahootItems: data.kahootItems,
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
  };

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 space-y-6">
        <div className="flex items-center gap-3 px-2 shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">25</div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <nav className="flex-1 overflow-y-auto min-h-0 pr-1">
          {SIDEBAR_GROUPS.map(group => {
            const items = SIDEBAR_ITEMS.filter(i => i.group === group.key);
            if (!items.length) return null;
            const hasActiveItem = items.some(i => i.key === activeTab);
            const isCollapsed = group.label && collapsedGroups.has(group.key) && !hasActiveItem;
            return (
              <div key={group.key}>
                {group.label ? (
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-4 pb-1 hover:text-slate-600 transition-colors"
                  >
                    {group.label}
                    <ChevronDown size={12} className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                  </button>
                ) : null}
                {!isCollapsed && (
                  <div className="space-y-1">
                    {items.map(item => (
                      <SidebarItem key={item.key} icon={item.icon} label={item.label} active={activeTab === item.key} onClick={() => navigateTo(item.key)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-100 rounded-2xl shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Role</p>
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
            <CheckCircle2 size={16} /> Math Teacher
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors px-2 shrink-0">
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">25</div>
          <MobileTabIcon size={16} className="text-indigo-600" />
          <span className="font-bold">{activeSidebarItem?.label || 'Dashboard'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600"><Menu size={24} /></button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 flex flex-col shadow-2xl lg:hidden">
              <div className="flex justify-between items-center mb-8 shrink-0">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
              </div>
              <nav className="flex-1 overflow-y-auto min-h-0">
                {SIDEBAR_GROUPS.map(group => {
                  const items = SIDEBAR_ITEMS.filter(i => i.group === group.key);
                  if (!items.length) return null;
                  const hasActiveItem = items.some(i => i.key === activeTab);
                  const isCollapsed = group.label && collapsedGroups.has(group.key) && !hasActiveItem;
                  return (
                    <div key={group.key}>
                      {group.label ? (
                        <button
                          onClick={() => toggleGroup(group.key)}
                          className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-4 pb-1 hover:text-slate-600 transition-colors"
                        >
                          {group.label}
                          <ChevronDown size={12} className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                        </button>
                      ) : null}
                      {!isCollapsed && (
                        <div className="space-y-1">
                          {items.map(item => (
                            <SidebarItem key={item.key} icon={item.icon} label={item.label} active={activeTab === item.key} onClick={() => navigateTo(item.key)} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
              <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors px-2 py-3">
                <LogOut size={16} /> Logout
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div key={activeTab} className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">{renderContent()}</div>
      </main>

      {/* Floating & Global UI */}
      <GlobalSearch
        data={{
          students: data.students,
          teachingUnits: data.teachingUnits,
          ideas: data.ideas,
          sops: data.sops,
          workLogs: data.workLogs,
          goals: data.goals,
          schoolEvents: data.schoolEvents,
          meetings: data.meetings,
          lessonRecords: data.lessonRecords,
          classes: data.classes,
          timetable: data.timetable,
          tasks: data.tasks,
          emailDigests: data.emailDigests,
          projects: data.projects,
        }}
        onNavigate={navigateTo}
      />
      <QuickCapture onSave={data.quickCapture} />
      <ToastContainer toasts={data.toasts} />
      <SyllabusModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        teachingUnits={data.teachingUnits}
        onNavigateToUnit={(unitId) => {
          setSelectedTeachingUnitId(unitId);
          setActiveTab('teaching');
        }}
        onCreateUnit={(yearGroup, title) => {
          setPendingNewUnitData({ year_group: yearGroup, title });
          setEditingTeachingUnit(null);
          setIsTeachingUnitFormOpen(true);
        }}
      />

      {/* Form Modals */}
      {isStudentFormOpen && (
        <StudentForm
          student={editingStudent}
          onSave={async (s) => { await data.saveStudent(s); setIsStudentFormOpen(false); setEditingStudent(null); }}
          onCancel={() => { setIsStudentFormOpen(false); setEditingStudent(null); }}
        />
      )}
      {isTeachingUnitFormOpen && (
        <TeachingUnitForm
          unit={editingTeachingUnit}
          onSave={async (u) => { await data.saveTeachingUnit(u); setIsTeachingUnitFormOpen(false); setEditingTeachingUnit(null); setPendingNewUnitData(null); }}
          onCancel={() => { setIsTeachingUnitFormOpen(false); setEditingTeachingUnit(null); setPendingNewUnitData(null); }}
          initialData={pendingNewUnitData}
        />
      )}
      {isClassFormOpen && (
        <ClassForm
          classProfile={editingClass}
          teachingUnits={data.teachingUnits}
          onSave={async (c) => { await data.saveClass(c); setIsClassFormOpen(false); setEditingClass(null); }}
          onCancel={() => { setIsClassFormOpen(false); setEditingClass(null); }}
        />
      )}
      {isTimetableFormOpen && editingTimetableEntry && (
        <TimetableEntryForm
          entry={editingTimetableEntry}
          classes={data.classes}
          teachingUnits={data.teachingUnits}
          allEntries={data.timetable}
          onSave={(e) => { data.updateTimetableEntry(e); setIsTimetableFormOpen(false); setEditingTimetableEntry(null); }}
          onCancel={() => { setIsTimetableFormOpen(false); setEditingTimetableEntry(null); }}
          contextDate={editingContextDate}
          onCreateOverride={(e) => { data.addTimetableEntry(e); setIsTimetableFormOpen(false); setEditingTimetableEntry(null); }}
          onDeleteOverride={(id) => { data.deleteTimetableEntry(id); setIsTimetableFormOpen(false); setEditingTimetableEntry(null); }}
          lessonRecords={data.lessonRecords}
          onUpdateLessonRecord={data.updateLessonRecord}
          onAddLessonRecord={data.addLessonRecord}
          students={data.students}
          meetings={data.meetings}
          onSaveUnit={(unit) => data.saveTeachingUnit(unit)}
        />
      )}
      {isWorkLogFormOpen && (
        <WorkLogForm
          workLog={editingWorkLog}
          onSave={(d) => {
            if (editingWorkLog) {
              data.updateWorkLog(editingWorkLog.id, d);
            } else {
              data.addWorkLog(d);
            }
            setIsWorkLogFormOpen(false);
            setEditingWorkLog(null);
          }}
          onCancel={() => { setIsWorkLogFormOpen(false); setEditingWorkLog(null); }}
        />
      )}
      {isSOPFormOpen && (
        <SOPForm
          sop={editingSOP}
          onSave={(d) => {
            if (editingSOP) {
              data.updateSOP(editingSOP.id, d);
            } else {
              data.addSOP(d);
            }
            setIsSOPFormOpen(false);
            setEditingSOP(null);
          }}
          onCancel={() => { setIsSOPFormOpen(false); setEditingSOP(null); }}
        />
      )}
      {isIdeaFormOpen && (
        <IdeaForm
          idea={editingIdea}
          onSave={(d) => {
            if (editingIdea) {
              data.updateIdea(editingIdea.id, d);
            } else {
              data.addIdea(d);
            }
            setIsIdeaFormOpen(false);
            setEditingIdea(null);
          }}
          onCancel={() => { setIsIdeaFormOpen(false); setEditingIdea(null); }}
        />
      )}
      {isGoalFormOpen && (
        <GoalForm
          goal={editingGoal}
          onSave={(d) => {
            if (editingGoal) {
              data.updateGoal(editingGoal.id, d);
            } else {
              data.addGoal(d);
            }
            setIsGoalFormOpen(false);
            setEditingGoal(null);
          }}
          onCancel={() => { setIsGoalFormOpen(false); setEditingGoal(null); }}
        />
      )}
      {isEventFormOpen && (
        <SchoolEventForm
          event={editingEvent}
          onSave={(d) => {
            if (editingEvent) {
              data.updateSchoolEvent(editingEvent.id, d);
            } else {
              data.addSchoolEvent(d);
            }
            setIsEventFormOpen(false);
            setEditingEvent(null);
          }}
          onCancel={() => { setIsEventFormOpen(false); setEditingEvent(null); }}
        />
      )}
      {isTaskFormOpen && (
        <TaskForm
          task={editingTask}
          projects={data.projects}
          onSave={(d) => {
            if (editingTask) {
              data.updateTask(editingTask.id, d);
            } else {
              data.addTask(d);
            }
            setIsTaskFormOpen(false);
            setEditingTask(null);
          }}
          onCancel={() => { setIsTaskFormOpen(false); setEditingTask(null); }}
        />
      )}
      {isProjectFormOpen && (
        <ProjectForm
          project={editingProject}
          onSave={(d) => {
            if (editingProject) {
              data.updateProject(editingProject.id, d);
            } else {
              data.addProject({ ...d, created_at: new Date().toISOString() });
            }
            setIsProjectFormOpen(false);
            setEditingProject(null);
          }}
          onCancel={() => { setIsProjectFormOpen(false); setEditingProject(null); }}
        />
      )}
      {parentCommFormConfig.isOpen && (
        <ParentCommForm
          title={parentCommFormConfig.title}
          initialValue={parentCommFormConfig.initialValue}
          onSave={parentCommFormConfig.onSave}
          onCancel={() => setParentCommFormConfig(prev => ({ ...prev, isOpen: false }))}
        />
      )}
      {weaknessFormConfig.isOpen && (
        <WeaknessForm
          title={weaknessFormConfig.title}
          initialValue={weaknessFormConfig.initialValue}
          onSave={weaknessFormConfig.onSave}
          onCancel={() => setWeaknessFormConfig(prev => ({ ...prev, isOpen: false }))}
        />
      )}
      {genericFormConfig.isOpen && (
        <GenericForm
          title={genericFormConfig.title}
          label={genericFormConfig.label}
          initialValue={genericFormConfig.initialValue}
          onSave={genericFormConfig.onSave}
          onCancel={() => setGenericFormConfig(prev => ({ ...prev, isOpen: false }))}
          placeholder={genericFormConfig.placeholder}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LoginGate>
      <AppContent />
    </LoginGate>
  );
}

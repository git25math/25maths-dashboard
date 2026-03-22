import { useState, useEffect, useRef, lazy, Suspense, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Student, StudentWeakness, ParentCommunication, ParentCommMethod, TeachingUnit, ClassProfile, TimetableEntry, Idea, SOP, WorkLog, MeetingRecord, Goal, Bookmark, SchoolEvent, LessonRecord, Task, EmailDigest, Project } from './types';
import { useAppData } from './hooks/useAppData';
import { Sidebar } from './components/Sidebar';
import { FormModals, FormModalsState, FormModalsSetters } from './components/FormModals';
import { ViewRouter } from './components/ViewRouter';
import { ToastContainer } from './components/ToastContainer';
import { LoginGate, useAuth } from './components/LoginGate';

const GlobalSearch = lazy(() => import('./components/GlobalSearch').then(m => ({ default: m.GlobalSearch })));
const QuickCapture = lazy(() => import('./components/QuickCapture').then(m => ({ default: m.QuickCapture })));
const SyllabusModal = lazy(() => import('./components/SyllabusModal').then(m => ({ default: m.SyllabusModal })));

const CalendarView = lazy(() => import('./views/CalendarView').then(m => ({ default: m.CalendarView })));
const SOPView = lazy(() => import('./views/SOPView').then(m => ({ default: m.SOPView })));
const WorkLogView = lazy(() => import('./views/WorkLogView').then(m => ({ default: m.WorkLogView })));
const IdeasView = lazy(() => import('./views/IdeasView').then(m => ({ default: m.IdeasView })));
const MeetingsView = lazy(() => import('./views/MeetingsView').then(m => ({ default: m.MeetingsView })));
const LessonRecordsView = lazy(() => import('./views/LessonRecordsView').then(m => ({ default: m.LessonRecordsView })));
const GoalsView = lazy(() => import('./views/GoalsView').then(m => ({ default: m.GoalsView })));
const BookmarksView = lazy(() => import('./views/BookmarksView').then(m => ({ default: m.BookmarksView })));
const SchoolEventsView = lazy(() => import('./views/SchoolEventsView').then(m => ({ default: m.SchoolEventsView })));
const HousePointHistoryView = lazy(() => import('./views/HousePointHistoryView').then(m => ({ default: m.HousePointHistoryView })));
const EmailDigestView = lazy(() => import('./views/EmailDigestView').then(m => ({ default: m.EmailDigestView })));
const ProjectsView = lazy(() => import('./views/ProjectsView').then(m => ({ default: m.ProjectsView })));
const ProjectDetailView = lazy(() => import('./views/ProjectDetailView').then(m => ({ default: m.ProjectDetailView })));
const SettingsView = lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));
const KahootHub = lazy(() => import('./views/kahoot/KahootHub').then(m => ({ default: m.KahootHub })));
const PayhipHub = lazy(() => import('./views/payhip/PayhipHub').then(m => ({ default: m.PayhipHub })));
const PaperHub = lazy(() => import('./views/papers/PaperHub').then(m => ({ default: m.PaperHub })));
const CoverHub = lazy(() => import('./views/covers/CoverHub').then(m => ({ default: m.CoverHub })));
const TikzHub = lazy(() => import('./views/tikz/TikzHub').then(m => ({ default: m.TikzHub })));
const FiguresQaHub = lazy(() => import('./views/figures/FiguresQaHub').then(m => ({ default: m.FiguresQaHub })));
const FiguresQa4MA1 = lazy(() => import('./views/figures/FiguresQa4MA1').then(m => ({ default: m.FiguresQa4MA1 })));
const VideoHub = lazy(() => import('./views/video/VideoHub').then(m => ({ default: m.VideoHub })));
const DashboardView = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const StudentsView = lazy(() => import('./views/StudentsView').then(m => ({ default: m.StudentsView })));
const TeachingView = lazy(() => import('./views/TeachingView').then(m => ({ default: m.TeachingView })));
const TasksView = lazy(() => import('./views/TasksView').then(m => ({ default: m.TasksView })));

class ViewErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ViewErrorBoundary]', error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 gap-4">
          <AlertTriangle size={32} className="text-amber-500" />
          <h2 className="text-lg font-bold text-slate-700">Something went wrong</h2>
          <p className="text-sm max-w-md text-center">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [selectedTeachingUnitId, setSelectedTeachingUnitId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [hpHistoryStudentFilter, setHpHistoryStudentFilter] = useState<string | null>(null);
  const [pendingCalendarDate, setPendingCalendarDate] = useState<string | undefined>(undefined);

  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isTeachingUnitFormOpen, setIsTeachingUnitFormOpen] = useState(false);
  const [editingTeachingUnit, setEditingTeachingUnit] = useState<TeachingUnit | null>(null);
  const [pendingNewUnitData, setPendingNewUnitData] = useState<{ year_group: string; title: string } | null>(null);
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassProfile | null>(null);
  const [isTimetableFormOpen, setIsTimetableFormOpen] = useState(false);
  const [editingTimetableEntry, setEditingTimetableEntry] = useState<TimetableEntry | null>(null);
  const [editingContextDate, setEditingContextDate] = useState<string>('');
  const [isWorkLogFormOpen, setIsWorkLogFormOpen] = useState(false);
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | null>(null);
  const [isSOPFormOpen, setIsSOPFormOpen] = useState(false);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isBookmarkFormOpen, setIsBookmarkFormOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormInitialProjectId, setTaskFormInitialProjectId] = useState('');
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [parentCommFormConfig, setParentCommFormConfig] = useState<FormModalsState['parentCommFormConfig']>({ isOpen: false, title: '', onSave: () => {} });
  const [weaknessFormConfig, setWeaknessFormConfig] = useState<FormModalsState['weaknessFormConfig']>({ isOpen: false, title: '', onSave: () => {} });
  const [genericFormConfig, setGenericFormConfig] = useState<FormModalsState['genericFormConfig']>({ isOpen: false, title: '', label: '', onSave: () => {} });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const mainRef = useRef<HTMLElement>(null);

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formState: FormModalsState = {
    isStudentFormOpen, editingStudent,
    isTeachingUnitFormOpen, editingTeachingUnit, pendingNewUnitData,
    isClassFormOpen, editingClass,
    isTimetableFormOpen, editingTimetableEntry, editingContextDate,
    isWorkLogFormOpen, editingWorkLog,
    isSOPFormOpen, editingSOP,
    isIdeaFormOpen, editingIdea,
    isGoalFormOpen, editingGoal,
    isBookmarkFormOpen, editingBookmark,
    isEventFormOpen, editingEvent,
    isTaskFormOpen, editingTask, taskFormInitialProjectId,
    isProjectFormOpen, editingProject,
    parentCommFormConfig, weaknessFormConfig, genericFormConfig,
  };

  const formSetters: FormModalsSetters = {
    setIsStudentFormOpen, setEditingStudent,
    setIsTeachingUnitFormOpen, setEditingTeachingUnit, setPendingNewUnitData,
    setIsClassFormOpen, setEditingClass,
    setIsTimetableFormOpen, setEditingTimetableEntry, setEditingContextDate: setEditingContextDate as (v: string) => void,
    setIsWorkLogFormOpen, setEditingWorkLog,
    setIsSOPFormOpen, setEditingSOP,
    setIsIdeaFormOpen, setEditingIdea,
    setIsGoalFormOpen, setEditingGoal,
    setIsBookmarkFormOpen, setEditingBookmark,
    setIsEventFormOpen, setEditingEvent,
    setIsTaskFormOpen, setEditingTask,
    setTaskFormInitialProjectId,
    setIsProjectFormOpen, setEditingProject,
    setParentCommFormConfig, setWeaknessFormConfig, setGenericFormConfig,
  };

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} onNavigate={navigateTo} onLogout={logout} />

      <main ref={mainRef} className="flex-1 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <Suspense fallback={<LazyFallback />}>
          <ViewErrorBoundary key={activeTab}>
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
            <ViewRouter
              activeTab={activeTab}
              data={data}
              formSetters={formSetters}
              navigateTo={navigateTo}
              currentTime={currentTime}
              selectedStudentId={selectedStudentId}
              setSelectedStudentId={setSelectedStudentId}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
              selectedTeachingUnitId={selectedTeachingUnitId}
              setSelectedTeachingUnitId={setSelectedTeachingUnitId}
              hpHistoryStudentFilter={hpHistoryStudentFilter}
              setHpHistoryStudentFilter={setHpHistoryStudentFilter}
              pendingCalendarDate={pendingCalendarDate}
              setPendingCalendarDate={setPendingCalendarDate}
              setIsSyllabusModalOpen={setIsSyllabusModalOpen}
              DashboardView={DashboardView}
              StudentsView={StudentsView}
              TeachingView={TeachingView}
              TasksView={TasksView}
              CalendarView={CalendarView}
              SOPView={SOPView}
              WorkLogView={WorkLogView}
              IdeasView={IdeasView}
              MeetingsView={MeetingsView}
              LessonRecordsView={LessonRecordsView}
              GoalsView={GoalsView}
              BookmarksView={BookmarksView}
              SchoolEventsView={SchoolEventsView}
              HousePointHistoryView={HousePointHistoryView}
              EmailDigestView={EmailDigestView}
              ProjectsView={ProjectsView}
              ProjectDetailView={ProjectDetailView}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              SettingsView={SettingsView}
              KahootHub={KahootHub}
              PayhipHub={PayhipHub}
              PaperHub={PaperHub}
              CoverHub={CoverHub}
              TikzHub={TikzHub}
              FiguresQaHub={FiguresQaHub}
              FiguresQa4MA1={FiguresQa4MA1}
              VideoHub={VideoHub}
            />
          </div>
          </ViewErrorBoundary>
        </Suspense>
      </main>

      <Suspense fallback={null}>
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
            milestones: data.milestones,
            devlogs: data.devlogs,
          }}
          onNavigate={navigateTo}
        />
        <QuickCapture onSave={data.quickCapture} />
        {isSyllabusModalOpen && (
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
        )}
      </Suspense>
      <ToastContainer toasts={data.toasts} />

      <FormModals state={formState} setters={formSetters} data={data} />
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

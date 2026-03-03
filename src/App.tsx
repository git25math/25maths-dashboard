import { useState, useEffect } from 'react';
import { CheckCircle2, Menu, X, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Student, TeachingUnit, ClassProfile, TimetableEntry, Idea, SOP, WorkLog, MeetingRecord, Goal, SchoolEvent, LessonRecord } from './types';
import { useAppData } from './hooks/useAppData';
import { SIDEBAR_ITEMS } from './shared/sidebarConfig';
import { SidebarItem } from './components/SidebarItem';
import { QuickCapture } from './components/QuickCapture';
import { SyllabusModal } from './components/SyllabusModal';
import { ToastContainer } from './components/ToastContainer';
import { StudentForm } from './components/StudentForm';
import { TeachingUnitForm } from './components/TeachingUnitForm';
import { ClassForm } from './components/ClassForm';
import { GenericForm } from './components/GenericForm';
import { TimetableEntryForm } from './components/TimetableEntryForm';
import { WorkLogForm } from './components/WorkLogForm';
import { SOPForm } from './components/SOPForm';
import { IdeaForm } from './components/IdeaForm';
import { GoalForm } from './components/GoalForm';
import { SchoolEventForm } from './components/SchoolEventForm';
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
import { SettingsView } from './views/SettingsView';
import { DevConsoleView } from './views/DevConsoleView';

function AppContent() {
  const data = useAppData();
  const { logout } = useAuth();
  // --- UI State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [selectedTeachingUnitId, setSelectedTeachingUnitId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

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

  // --- Sidebar navigation helper ---
  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

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
            onNavigate={(tab) => {
              setActiveTab(tab);
              if (tab === 'worklogs') {
                setEditingWorkLog(null);
                setIsWorkLogFormOpen(true);
              }
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
            onAddRequest={openRequestForm}
            onAddExamRecord={data.addExamRecord}
          />
        );
      case 'teaching':
        return (
          <TeachingView
            teachingUnits={data.teachingUnits}
            onOpenSyllabus={() => setIsSyllabusModalOpen(true)}
            initialUnitId={selectedTeachingUnitId}
            onClearInitialUnit={() => setSelectedTeachingUnitId(null)}
            onAddUnit={() => { setEditingTeachingUnit(null); setIsTeachingUnitFormOpen(true); }}
            onUpdateUnit={(id) => {
              const u = data.teachingUnits.find(u => u.id === id);
              if (u) { setEditingTeachingUnit(u); setIsTeachingUnitFormOpen(true); }
            }}
            onDeleteUnit={data.deleteTeachingUnit}
            onSaveUnit={(unit) => data.saveTeachingUnit(unit)}
            classes={data.classes}
            onUpdateClassProgress={data.updateClassProgress}
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
          />
        );
      case 'meetings':
        return (
          <MeetingsView
            meetings={data.meetings}
            onAddMeeting={data.addMeeting}
            onUpdateMeeting={data.updateMeeting}
            onDeleteMeeting={data.deleteMeeting}
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
      case 'dev-console':
        return <DevConsoleView />;
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
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">25</div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {SIDEBAR_ITEMS.map(item => (
            <SidebarItem key={item.key} icon={item.icon} label={item.label} active={activeTab === item.key} onClick={() => setActiveTab(item.key)} />
          ))}
        </nav>
        <div className="p-4 bg-slate-50 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Role</p>
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
            <CheckCircle2 size={16} /> Math Teacher
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors px-2">
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">25</div>
          <span className="font-bold">Dashboard</span>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 w-64 bg-white z-50 p-6 flex flex-col lg:hidden">
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
              </div>
              <nav className="flex-1 space-y-2">
                {SIDEBAR_ITEMS.map(item => (
                  <SidebarItem key={item.key} icon={item.icon} label={item.label} active={activeTab === item.key} onClick={() => navigateTo(item.key)} />
                ))}
              </nav>
              <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors px-2 py-3">
                <LogOut size={16} /> Logout
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">{renderContent()}</div>
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
        }}
        onNavigate={navigateTo}
      />
      <QuickCapture onSave={data.quickCapture} />
      <ToastContainer toasts={data.toasts} />
      <SyllabusModal isOpen={isSyllabusModalOpen} onClose={() => setIsSyllabusModalOpen(false)} />

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
          onSave={async (u) => { await data.saveTeachingUnit(u); setIsTeachingUnitFormOpen(false); setEditingTeachingUnit(null); }}
          onCancel={() => { setIsTeachingUnitFormOpen(false); setEditingTeachingUnit(null); }}
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
          onUpdateClassProgress={data.updateClassProgress}
          contextDate={editingContextDate}
          onCreateOverride={(e) => { data.addTimetableEntry(e); setIsTimetableFormOpen(false); setEditingTimetableEntry(null); }}
          onDeleteOverride={(id) => { data.deleteTimetableEntry(id); setIsTimetableFormOpen(false); setEditingTimetableEntry(null); }}
          lessonRecords={data.lessonRecords}
          onUpdateLessonRecord={data.updateLessonRecord}
          onAddLessonRecord={data.addLessonRecord}
          students={data.students}
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

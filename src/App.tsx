import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Lightbulb, 
  BookOpen, 
  Settings, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Star,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isWithinInterval, parse } from 'date-fns';
import { cn } from './lib/utils';
import { MOCK_TIMETABLE, MOCK_STUDENTS, MOCK_IDEAS, MOCK_SOPS, MOCK_TEACHING_UNITS, MOCK_SCHOOL_EVENTS, MOCK_GOALS, MOCK_WORK_LOGS, SYLLABUS, MOCK_CLASSES } from './constants';
import { Role, TimetableEntry, Idea, Student, TeachingUnit, SchoolEvent, Goal, WorkLog, ClassProfile, LessonPlanItem } from './types';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const QuickCapture = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<'work' | 'student' | 'startup'>('work');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving idea:', { text, category });
    setText('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 glass-card p-4 mb-2"
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-900">Quick Capture</h3>
                <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-24 p-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
              />
              <div className="flex gap-2">
                {(['work', 'student', 'startup'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border",
                      category === cat 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
                        : "bg-white border-slate-200 text-slate-400"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button type="submit" className="w-full btn-primary py-2 text-sm">
                Save Note
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95"
      >
        <Plus size={28} className={cn("transition-transform duration-300", isOpen && "rotate-45")} />
      </button>
    </div>
  );
};

// --- Views ---

const TimetableView = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Weekly Timetable</h2>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm">Download PDF</button>
          <button className="btn-primary text-sm">Edit Schedule</button>
        </div>
      </div>

      <div className="glass-card p-4 bg-indigo-50/30 border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <Plus size={16} /> Quick Add / Customize Event
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input type="text" placeholder="Subject (e.g. Flag Raising)" className="text-xs p-2 rounded-lg border border-indigo-100 bg-white" />
          <input type="text" placeholder="Class (e.g. Y11/Ma/B)" className="text-xs p-2 rounded-lg border border-indigo-100 bg-white" />
          <input type="text" placeholder="Room (e.g. A327)" className="text-xs p-2 rounded-lg border border-indigo-100 bg-white" />
          <input type="time" className="text-xs p-2 rounded-lg border border-indigo-100 bg-white" />
          <button className="btn-primary text-xs py-2 bg-indigo-600 border-none">Add to Schedule</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-6 gap-4">
          <div className="col-span-1"></div>
          {days.map(day => (
            <div key={day} className="text-center font-bold text-slate-500 uppercase text-xs tracking-widest pb-2">
              {day}
            </div>
          ))}

          {/* Time Slots - Expanded to cover full day routine */}
          {[
            '05:20', '06:20', '07:35', '07:45', '08:20', '09:10', '09:55', '10:25', 
            '11:15', '12:05', '12:50', '13:35', '13:50', '14:40', '15:25', '15:30', '16:20', '16:30', '17:20'
          ].map(time => (
            <React.Fragment key={time}>
              <div className="text-right pr-4 text-[10px] font-medium text-slate-400 py-4 border-t border-slate-100">
                {time}
              </div>
              {[1, 2, 3, 4, 5].map(day => {
                const entry = MOCK_TIMETABLE.find(e => e.day === day && e.start_time === time);
                return (
                  <div key={`${day}-${time}`} className="border-t border-slate-100 py-1">
                    {entry ? (
                      <div className={cn(
                        "p-2 rounded-lg text-[10px] h-full border shadow-sm transition-all hover:scale-[1.02]",
                        entry.type === 'lesson' ? "bg-indigo-50 border-indigo-100 text-indigo-700" :
                        entry.type === 'tutor' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                        entry.type === 'duty' ? "bg-amber-50 border-amber-100 text-amber-700" :
                        entry.type === 'meeting' ? "bg-purple-50 border-purple-100 text-purple-700" :
                        "bg-slate-50 border-slate-200 text-slate-600"
                      )}>
                        <div className="flex justify-between items-start">
                          <p className="font-bold truncate">{entry.subject}</p>
                          {entry.is_prepared !== undefined && (
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              entry.is_prepared ? "bg-emerald-500" : "bg-red-500"
                            )} />
                          )}
                        </div>
                        <p className="opacity-80 truncate">{entry.class_name}</p>
                        <p className="opacity-60 truncate">{entry.room}</p>
                        {entry.topic && <p className="mt-1 font-medium text-[8px] italic truncate">Topic: {entry.topic}</p>}
                      </div>
                    ) : (
                      <div className="h-full min-h-[40px] rounded-lg border border-dashed border-slate-100 bg-slate-50/10 flex items-center justify-center">
                        <span className="text-[8px] text-slate-300 font-medium uppercase tracking-tighter">Free / Cover</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const StudentsView = ({ 
  selectedStudentId, 
  onSelectStudent, 
  selectedClassId, 
  onSelectClass 
}: { 
  selectedStudentId: string | null; 
  onSelectStudent: (id: string | null) => void;
  selectedClassId: string | null;
  onSelectClass: (id: string | null) => void;
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'students'>('classes');

  const selectedStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId);
  const selectedClass = MOCK_CLASSES.find(c => c.id === selectedClassId);

  if (selectedStudent) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => onSelectStudent(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to List
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{selectedStudent.name}</h2>
                    <p className="text-slate-500">{selectedStudent.year_group} • {selectedStudent.class_name}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100">
                  {selectedStudent.house_points} House Points
                </div>
              </div>

              <section className="space-y-4">
                <h3 className="font-bold text-lg border-b border-slate-100 pb-2">学习状况记录 (Learning Status)</h3>
                <div className="space-y-4">
                  {selectedStudent.status_records?.map(record => (
                    <div key={record.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{record.date}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                          {record.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{record.content}</p>
                    </div>
                  ))}
                  {(!selectedStudent.status_records || selectedStudent.status_records.length === 0) && (
                    <p className="text-sm text-slate-400 italic">No status records found.</p>
                  )}
                  <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all">
                    + Add Status Record
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-bold text-lg border-b border-slate-100 pb-2">薄弱环节 (Weaknesses)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStudent.weaknesses?.map((w, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-900">{w.topic}</p>
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                          w.level === 'high' ? "bg-red-100 text-red-600" : 
                          w.level === 'medium' ? "bg-amber-100 text-amber-600" : 
                          "bg-blue-100 text-blue-600"
                        )}>
                          {w.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{w.notes}</p>
                      <button className="text-[10px] font-bold text-indigo-600 hover:underline">Recommend Practice</button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">平时诉求 (Requests)</h3>
              <div className="space-y-3">
                {selectedStudent.requests?.map(req => (
                  <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <p className="text-xs text-slate-700">{req.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400">{req.date}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase",
                        req.status === 'resolved' ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
                <button className="w-full btn-secondary text-xs py-2">+ New Request</button>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => window.location.href = `mailto:upperoncall@harrowhaikou.cn?subject=Missing ${selectedStudent.name} from A219`}
                  className="w-full py-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertCircle size={16} /> Report Missing
                </button>
                <button className="w-full py-3 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                  Generate Subject Report
                </button>
                <button className="w-full py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors">
                  Parent Meeting Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedClass) {
    const classStudents = MOCK_STUDENTS.filter(s => selectedClass.student_ids.includes(s.id));
    return (
      <div className="space-y-6">
        <button 
          onClick={() => onSelectClass(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to Classes
        </button>

        <div className="glass-card p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{selectedClass.name}</h2>
              <p className="text-slate-500 mt-1">{selectedClass.year_group} • {selectedClass.description}</p>
            </div>
            <button className="btn-primary text-sm">Edit Profile</button>
          </div>

          <section className="space-y-4">
            <h3 className="font-bold text-lg border-b border-slate-100 pb-2">学生名单 (Student List)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classStudents.map(student => (
                <div 
                  key={student.id}
                  onClick={() => onSelectStudent(student.id)}
                  className="p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{student.house_points} HP • {student.weaknesses?.length || 0} Weaknesses</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Student & Class Management</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveSubTab('classes')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeSubTab === 'classes' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Classes
          </button>
          <button 
            onClick={() => setActiveSubTab('students')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeSubTab === 'students' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            All Students
          </button>
        </div>
      </div>

      {activeSubTab === 'classes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CLASSES.map(cls => (
            <div 
              key={cls.id}
              onClick={() => onSelectClass(cls.id)}
              className="glass-card p-6 hover:border-indigo-400 transition-all cursor-pointer group space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Users size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                  {cls.year_group}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{cls.description}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cls.student_ids.length} Students</span>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_STUDENTS.map(student => (
            <div 
              key={student.id} 
              onClick={() => onSelectStudent(student.id)}
              className="glass-card p-5 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                  <p className="text-sm text-slate-500">{student.year_group} • {student.class_name}</p>
                </div>
                <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">
                  {student.house_points} HP
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                  student.is_tutor_group ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                )}>
                  {student.is_tutor_group ? 'Tutor Group' : 'Subject Student'}
                </span>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TeachingView = ({ 
  onOpenSyllabus, 
  initialUnitId, 
  onClearInitialUnit 
}: { 
  onOpenSyllabus: () => void;
  initialUnitId: string | null;
  onClearInitialUnit: () => void;
}) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<TeachingUnit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlanItem | null>(null);

  useEffect(() => {
    if (initialUnitId) {
      const unit = MOCK_TEACHING_UNITS.find(u => u.id === initialUnitId);
      if (unit) {
        setSelectedUnit(unit);
        setSelectedYear(unit.year_group);
      }
      onClearInitialUnit();
    }
  }, [initialUnitId, onClearInitialUnit]);

  const years = ['Year 7', 'Year 8', 'Year 10', 'Year 11', 'Year 12'];

  if (selectedLesson && selectedUnit) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to {selectedUnit.title}
        </button>
        
        <div className="glass-card p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">{selectedLesson.title}</h2>
            <p className="text-slate-500">Lesson Plan & Resources</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  Lesson Objectives
                </h3>
                <ul className="space-y-2">
                  {selectedLesson.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Clock size={20} className="text-indigo-500" />
                  Activities
                </h3>
                <div className="space-y-3">
                  {selectedLesson.activities.map((act, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700">
                      {act}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <BookOpen size={20} className="text-amber-500" />
                  Resources
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedLesson.resources?.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-sm">
                      <span className="text-slate-700">{res}</span>
                      <ExternalLink size={14} className="text-slate-400" />
                    </div>
                  ))}
                  {(!selectedLesson.resources || selectedLesson.resources.length === 0) && (
                    <p className="text-sm text-slate-400 italic">No specific resources listed for this lesson.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedUnit) {
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
                <button className="btn-secondary text-xs flex items-center gap-2">
                  <Plus size={14} /> Add Resource
                </button>
              </div>

              <section className="space-y-4">
                <h3 className="font-bold text-lg">教学目标 (Learning Objectives)</h3>
                <ul className="space-y-2">
                  {selectedUnit.learning_objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-bold text-lg">课时拆分 (Lesson Breakdown)</h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedUnit.lessons.map((lesson, i) => (
                    <button 
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all text-left group"
                    >
                      <div>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Lesson {i + 1}</p>
                        <p className="font-bold text-slate-900">{lesson.title}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-bold text-lg">典型例题 (Typical Examples)</h3>
                <div className="space-y-4">
                  {selectedUnit.typical_examples.map((ex, i) => (
                    <div key={i} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                      <p className="font-bold text-indigo-900 text-sm">Q: {ex.question}</p>
                      <p className="text-sm text-slate-600 pl-4 border-l-2 border-indigo-200">A: {ex.solution}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="glass-card p-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">教学总结 (Teaching Summary)</h3>
                <button className="flex items-center gap-2 text-indigo-600 text-sm font-bold hover:underline">
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
              <div className="space-y-2">
                {[
                  { label: '练习单 (Worksheet)', url: selectedUnit.worksheet_url, icon: BookOpen },
                  { label: '作业单 (Homework)', url: selectedUnit.homework_url, icon: CheckCircle2 },
                  { label: '线上练习 (Online)', url: selectedUnit.online_practice_url, icon: ExternalLink },
                  { label: 'Kahoot链接', url: selectedUnit.kahoot_url, icon: Star },
                  { label: '词汇练习 (Vocab)', url: selectedUnit.vocab_practice_url, icon: Settings },
                ].map((res, i) => (
                  <a 
                    key={i}
                    href={res.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      res.url 
                        ? "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm" 
                        : "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <res.icon size={16} className={res.url ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-sm font-medium">{res.label}</span>
                    </div>
                    {res.url && <ExternalLink size={14} className="text-slate-400" />}
                  </a>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">备课提示 (AI Prompt)</h3>
              <div className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-indigo-300 leading-relaxed">
                {selectedUnit.ai_prompt_template}
              </div>
              <button className="w-full btn-primary text-xs py-3">Copy Prompt</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedYear) {
    const yearUnits = MOCK_TEACHING_UNITS.filter(u => u.year_group === selectedYear);
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedYear(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to Year Groups
        </button>
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">{selectedYear} Units</h2>
          <button className="btn-primary text-sm flex items-center gap-2">
            <Plus size={18} /> New Unit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yearUnits.map(unit => (
            <div 
              key={unit.id} 
              onClick={() => setSelectedUnit(unit)}
              className="glass-card p-6 hover:border-indigo-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{unit.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2">{unit.learning_objectives[0]}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {unit.lessons.length} Lessons
                </span>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
          {yearUnits.length === 0 && (
            <div className="col-span-full p-12 text-center glass-card border-dashed">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No units added for {selectedYear} yet.</p>
              <button className="mt-4 text-indigo-600 font-bold hover:underline">Add First Unit</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Teaching Management</h2>
        <div className="flex gap-2">
          <button onClick={onOpenSyllabus} className="btn-secondary text-sm">Curriculum Map</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {years.map(year => (
          <div 
            key={year}
            onClick={() => setSelectedYear(year)}
            className="glass-card p-8 hover:border-indigo-400 transition-all cursor-pointer group text-center space-y-4"
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <BookOpen size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{year}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {MOCK_TEACHING_UNITS.filter(u => u.year_group === year).length} Units Available
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold text-lg mb-4">Class Progress Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CLASSES.map(cls => {
            const currentUnit = MOCK_TEACHING_UNITS.find(u => u.id === cls.current_unit_id);
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
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-slate-400">{cls.student_ids.length} Students</span>
                  <button 
                    onClick={() => currentUnit && setSelectedUnit(currentUnit)}
                    className="text-indigo-600 font-semibold text-sm hover:underline"
                  >
                    View Unit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ 
  currentEvent, 
  nextEvent, 
  onSelectUnit 
}: { 
  currentEvent: TimetableEntry | undefined; 
  nextEvent: TimetableEntry | undefined;
  onSelectUnit: (id: string) => void;
}) => {
  return (
    <div className="space-y-8">
      {/* Header & Current Context */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Hello, Nalo!</h2>
          <p className="text-slate-500 mt-1">It's {format(new Date(), 'EEEE, MMMM do, HH:mm')}</p>
        </div>
        
        <div className="flex gap-3">
          <a href="https://teams.microsoft.com" target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm">
            <ExternalLink size={20} />
          </a>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>New Record</span>
          </button>
        </div>
      </header>

      {/* Context Card */}
      <section className="glass-card p-6 border-l-4 border-l-indigo-600">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest">
              <Clock size={16} />
              <span>Current Context</span>
            </div>
            
            {currentEvent ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-900">{currentEvent.subject}</h3>
                  {currentEvent.type === 'lesson' && (
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                      currentEvent.is_prepared ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {currentEvent.is_prepared ? '已备课' : '未备课'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1"><Users size={16} /> {currentEvent.class_name}</span>
                  <span className="flex items-center gap-1"><Calendar size={16} /> Room {currentEvent.room}</span>
                  {currentEvent.topic && (
                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                      <BookOpen size={16} /> {currentEvent.topic}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Free Time / Planning</h3>
                <p className="text-slate-500 mt-1">Perfect time to review your startup ideas or prep for next class.</p>
              </div>
            )}
          </div>
          
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Event</p>
            {nextEvent ? (
              <div className="mt-1">
                <p className="font-bold text-slate-900">{nextEvent.subject}</p>
                <p className="text-xs text-slate-500">
                  {nextEvent.start_time} · {nextEvent.class_name} · Room {nextEvent.room}
                </p>
              </div>
            ) : (
              <p className="font-semibold text-slate-400 mt-1 italic">No more events today</p>
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Class Progress Tracking */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900">Class Progress Tracking</h4>
            <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_CLASSES.slice(0, 4).map(cls => {
              const currentUnit = MOCK_TEACHING_UNITS.find(u => u.id === cls.current_unit_id);
              return (
                <div key={cls.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{cls.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      Unit: <span className="text-indigo-600 font-medium">{currentUnit?.title || 'None'}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => currentUnit && onSelectUnit(currentUnit.id)}
                    className="mt-3 text-[10px] font-bold text-indigo-600 hover:underline text-left"
                  >
                    View Module →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals / OKRs */}
        <div className="glass-card p-6 space-y-4">
          <h4 className="font-bold text-slate-900">Active Goals</h4>
          <div className="space-y-3">
            {MOCK_GOALS.filter(g => g.status === 'in-progress').slice(0, 2).map(goal => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-600">{goal.title}</span>
                  <span className="text-indigo-600">{goal.progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Support */}
        <div className="glass-card p-6 bg-red-50 border-red-100 space-y-4">
          <h4 className="font-bold text-red-900">Emergency Support</h4>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = 'mailto:upperoncall@harrowhaikou.cn?subject=Emergency Support Needed in A219'}
              className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <AlertCircle size={14} /> Upper On-Call
            </button>
            <button className="w-full py-2 bg-white text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors">
              Medical Alert
            </button>
          </div>
        </div>

        {/* School Events */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900">Recent Events</h4>
            <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {MOCK_SCHOOL_EVENTS.slice(0, 3).map(event => (
              <div key={event.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start">
                  <h5 className="text-xs font-bold text-slate-900">{event.title}</h5>
                  <span className="text-[9px] text-slate-400">{event.date}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Work Logs */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900">Recent Work Logs</h4>
            <button className="text-indigo-600 text-xs font-bold hover:underline">View History</button>
          </div>
          <div className="space-y-3">
            {MOCK_WORK_LOGS.slice(0, 3).map(log => (
              <div key={log.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className={cn(
                  "w-1 h-auto rounded-full",
                  log.category === 'tutor' ? "bg-indigo-500" : "bg-emerald-500"
                )} />
                <div>
                  <p className="text-xs font-bold text-slate-900">{log.content}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SOPView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">SOP Library</h2>
        <button className="btn-primary text-sm">Add New SOP</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_SOPS.map((sop) => (
          <div key={sop.id} className="glass-card p-5 hover:border-indigo-300 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                {sop.category}
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{sop.title}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {sop.content.split(' ').map((word, i) => {
                if (word.includes('@')) {
                  return <a key={i} href={`mailto:${word.replace(/[.,]$/, '')}`} className="text-indigo-600 hover:underline">{word} </a>;
                }
                return word + ' ';
              })}
            </p>
            <div className="mt-4 flex items-center gap-2 text-indigo-600 text-sm font-semibold">
              Read Procedure <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkLogView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Work Logs (工作日志)</h2>
        <button className="btn-primary text-sm flex items-center gap-2">
          <Plus size={18} /> New Log Entry
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-bottom border-slate-100">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Timestamp</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Content</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_WORK_LOGS.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-xs font-mono text-slate-500">{log.timestamp}</td>
                <td className="p-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                    log.category === 'tutor' ? "bg-indigo-50 text-indigo-600" :
                    log.category === 'teaching' ? "bg-emerald-50 text-emerald-600" :
                    log.category === 'admin' ? "bg-blue-50 text-blue-600" :
                    log.category === 'startup' ? "bg-purple-50 text-purple-600" :
                    "bg-slate-100 text-slate-500"
                  )}>
                    {log.category}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-700 font-medium">{log.content}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {log.tags?.map(tag => (
                      <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SyllabusModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [selectedYear, setSelectedYear] = useState<string>('Year 7');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Curriculum Syllabus</h3>
                <p className="text-sm text-slate-500">Browse units by year group</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Year Selector */}
              <div className="w-48 border-r border-slate-100 bg-slate-50/30 p-4 space-y-2">
                {Object.keys(SYLLABUS).map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      selectedYear === year 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>

              {/* Units List */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SYLLABUS[selectedYear].map((unit, index) => (
                    <motion.div
                      key={unit}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                          {unit.split(': ')[1] || unit}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [selectedTeachingUnitId, setSelectedTeachingUnitId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentEvent = () => {
    const day = currentTime.getDay();
    const timeStr = format(currentTime, 'HH:mm');
    
    return MOCK_TIMETABLE.find(entry => {
      if (entry.day !== day) return false;
      return timeStr >= entry.start_time && timeStr <= entry.end_time;
    });
  };

  const currentEvent = getCurrentEvent();

  const getNextEvent = () => {
    const day = currentTime.getDay();
    const timeStr = format(currentTime, 'HH:mm');
    
    const todaysEvents = MOCK_TIMETABLE
      .filter(entry => entry.day === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
      
    return todaysEvents.find(entry => entry.start_time > timeStr);
  };

  const nextEvent = getNextEvent();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            currentEvent={currentEvent} 
            nextEvent={nextEvent} 
            onSelectUnit={(id) => {
              setSelectedTeachingUnitId(id);
              setActiveTab('teaching');
            }}
          />
        );
      case 'timetable':
        return <TimetableView />;
      case 'students':
        return (
          <StudentsView 
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            selectedClassId={selectedClassId}
            onSelectClass={setSelectedClassId}
          />
        );
      case 'teaching':
        return (
          <TeachingView 
            onOpenSyllabus={() => setIsSyllabusModalOpen(true)} 
            initialUnitId={selectedTeachingUnitId}
            onClearInitialUnit={() => setSelectedTeachingUnitId(null)}
          />
        );
      case 'sop':
        return <SOPView />;
      case 'worklogs':
        return <WorkLogView />;
      case 'ideas':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Startup灵感池 (25maths)</h2>
              <button className="btn-primary text-sm">New Idea</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_IDEAS.map((idea) => (
                <div key={idea.id} className="glass-card p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-3 inline-block",
                    idea.category === 'startup' ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {idea.category}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900">{idea.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-3">{idea.content}</p>
                </div>
              ))}
            </div>
          </div>
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
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            25
          </div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Calendar} label="Timetable" active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} />
          <SidebarItem icon={Users} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
          <SidebarItem icon={BookOpen} label="Teaching" active={activeTab === 'teaching'} onClick={() => setActiveTab('teaching')} />
          <SidebarItem icon={Lightbulb} label="Idea Pool" active={activeTab === 'ideas'} onClick={() => setActiveTab('ideas')} />
          <SidebarItem icon={Clock} label="Work Logs" active={activeTab === 'worklogs'} onClick={() => setActiveTab('worklogs')} />
          <SidebarItem icon={Settings} label="SOP Library" active={activeTab === 'sop'} onClick={() => setActiveTab('sop')} />
        </nav>

        <div className="p-4 bg-slate-50 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Role</p>
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
            <CheckCircle2 size={16} />
            Math Teacher
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">25</div>
          <span className="font-bold">Dashboard</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 p-6 flex flex-col lg:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
              </div>
              <nav className="flex-1 space-y-2">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Calendar} label="Timetable" active={activeTab === 'timetable'} onClick={() => { setActiveTab('timetable'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Users} label="Students" active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={BookOpen} label="Teaching" active={activeTab === 'teaching'} onClick={() => { setActiveTab('teaching'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Lightbulb} label="Idea Pool" active={activeTab === 'ideas'} onClick={() => { setActiveTab('ideas'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Clock} label="Work Logs" active={activeTab === 'worklogs'} onClick={() => { setActiveTab('worklogs'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Settings} label="SOP Library" active={activeTab === 'sop'} onClick={() => { setActiveTab('sop'); setIsSidebarOpen(false); }} />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {renderContent()}
        </div>
      </main>

      <QuickCapture />
      <SyllabusModal 
        isOpen={isSyllabusModalOpen} 
        onClose={() => setIsSyllabusModalOpen(false)} 
      />
    </div>
  );
}

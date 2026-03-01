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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isWithinInterval, parse } from 'date-fns';
import { cn } from './lib/utils';
import { MOCK_TIMETABLE, MOCK_STUDENTS, MOCK_IDEAS, MOCK_SOPS, MOCK_TEACHING_UNITS, MOCK_SCHOOL_EVENTS } from './constants';
import { Role, TimetableEntry, Idea, Student, TeachingUnit, SchoolEvent } from './types';

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
            '05:20', '06:20', '07:45', '08:20', '09:10', '09:55', '10:25', 
            '11:15', '12:05', '12:50', '13:35', '13:50', '14:40', '15:25', '16:20', '17:20'
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
                        <p className="font-bold truncate">{entry.subject}</p>
                        <p className="opacity-80 truncate">{entry.class_name}</p>
                        <p className="opacity-60 truncate">{entry.room}</p>
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

const StudentsView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Student Database</h2>
        <button className="btn-primary text-sm flex items-center gap-2">
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_STUDENTS.map(student => (
          <div key={student.id} className="glass-card p-5 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                <p className="text-sm text-slate-500">{student.year_group} • {student.class_name}</p>
              </div>
              <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">
                {student.house_points} HP
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-4 line-clamp-2 italic">"{student.notes}"</p>
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
    </div>
  );
};

const TeachingView = () => {
  const [selectedUnit, setSelectedUnit] = useState<TeachingUnit | null>(null);

  if (selectedUnit) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedUnit(null)}
          className="flex items-center gap-2 text-indigo-600 font-semibold hover:underline mb-4"
        >
          <ChevronRight size={18} className="rotate-180" /> Back to Units
        </button>

        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              {selectedUnit.year_group}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">{selectedUnit.title}</h2>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">Edit Unit</button>
            <button className="btn-primary text-sm">Share with Team</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Teaching Plan */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-600" /> 教学计划 (Teaching Plan)
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedUnit.teaching_plan}</p>
            </div>

            {/* Typical Examples */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" /> 典型例题 (Typical Examples)
              </h3>
              <div className="space-y-4">
                {selectedUnit.typical_examples.map((ex, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900">Q: {ex.question}</p>
                    <p className="text-sm text-slate-600 mt-2 bg-white p-3 rounded border border-slate-100 italic">
                      A: {ex.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Prompt Template */}
            <div className="glass-card p-6 border-indigo-200 bg-indigo-50/30">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-indigo-900">
                <Lightbulb size={20} className="text-indigo-600" /> AI 指令模板 (AI Prompt Template)
              </h3>
              <div className="relative group">
                <pre className="text-sm text-indigo-900 bg-white p-4 rounded-xl border border-indigo-100 whitespace-pre-wrap font-mono">
                  {selectedUnit.ai_prompt_template}
                </pre>
                <button className="absolute top-2 right-2 p-2 bg-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-xs">
                  Copy Template
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Resources */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">资源链接 (Resources)</h3>
              <div className="space-y-3">
                <a href={selectedUnit.worksheet_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-300 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={18} /></div>
                    <span className="text-sm font-medium">Worksheet 练习单</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
                <a href={selectedUnit.homework_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-300 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Calendar size={18} /></div>
                    <span className="text-sm font-medium">Homework 课后作业</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              </div>
            </div>

            {/* Vocabulary */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">核心词汇 (Vocabulary)</h3>
              <div className="flex flex-wrap gap-2">
                {selectedUnit.core_vocabulary.map(word => (
                  <span key={word} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Prep Template */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">备课资料模板</h3>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-900 italic leading-relaxed">
                "{selectedUnit.prep_material_template}"
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Teaching Management</h2>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm">Curriculum Map</button>
          <button className="btn-primary text-sm flex items-center gap-2">
            <Plus size={18} /> New Unit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-4">教学单元 (Teaching Units)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_TEACHING_UNITS.map(unit => (
                <div 
                  key={unit.id} 
                  onClick={() => setSelectedUnit(unit)}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                      {unit.year_group}
                    </span>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h4 className="font-bold text-slate-900">{unit.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{unit.teaching_plan}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-4">Class Progress Tracking</h3>
            <div className="space-y-4">
              {['Y10-Math-A', 'Y12-Math-HL', 'Y8-Math-B'].map(cls => (
                <div key={cls} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{cls}</p>
                    <p className="text-sm text-slate-500">Last Topic: Quadratic Equations</p>
                  </div>
                  <button className="text-indigo-600 font-semibold text-sm hover:underline">Update</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-4">Homework Registry</h3>
            <div className="space-y-3">
              {[
                { class: 'Y10-A', status: 'Pending', count: '12/25' },
                { class: 'Y12-HL', status: 'Completed', count: '18/18' },
                { class: 'Y8-B', status: 'Pending', count: '5/20' }
              ].map((hw, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                  <span className="font-medium text-slate-700">{hw.class}</span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-bold",
                    hw.status === 'Completed' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {hw.count}
                  </span>
                </div>
              ))}
            </div>
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

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Header & Current Context */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Hello, Teacher!</h2>
                <p className="text-slate-500 mt-1">It's {format(currentTime, 'EEEE, MMMM do, HH:mm')}</p>
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
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{currentEvent.subject}</h3>
                      <div className="flex items-center gap-4 text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Users size={16} /> {currentEvent.class_name}</span>
                        <span className="flex items-center gap-1"><Calendar size={16} /> Room {currentEvent.room}</span>
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
                  <p className="text-xs font-bold text-slate-400 uppercase">Next Event</p>
                  <p className="font-semibold text-slate-900">Mathematics @ 08:05</p>
                </div>
              </div>
            </section>

            {/* Recent Events / School Announcements */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle size={20} className="text-amber-500" /> 近期安排 (Recent Events)
                </h3>
                <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['personal', 'school-wide', 'house', 'event'] as const).map(cat => (
                  <div key={cat} className="glass-card p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                        cat === 'personal' ? "bg-red-50 text-red-600" :
                        cat === 'school-wide' ? "bg-blue-50 text-blue-600" :
                        cat === 'house' ? "bg-emerald-50 text-emerald-600" :
                        "bg-purple-50 text-purple-600"
                      )}>
                        {cat === 'personal' ? '与我有关' : 
                         cat === 'school-wide' ? '学校级别' :
                         cat === 'house' ? '院舍活动' : '学校活动'}
                      </span>
                    </div>
                    
                    <div className="space-y-3 flex-grow">
                      {MOCK_SCHOOL_EVENTS.filter(e => e.category === cat).map(event => (
                        <div key={event.id} className="group cursor-pointer">
                          <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {event.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{event.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-slate-400 font-medium">{event.date}</span>
                            {event.is_action_required && (
                              <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold">
                                <AlertCircle size={10} /> Action
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {MOCK_SCHOOL_EVENTS.filter(e => e.category === cat).length === 0 && (
                        <p className="text-xs text-slate-400 italic">No recent updates</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bento Grid Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Quick Links */}
              <div className="md:col-span-1 space-y-6">
                <div className="glass-card p-5 space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <ExternalLink size={18} className="text-slate-400" />
                    Shortcuts
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Teams', 'iSAMS', 'WeChat', 'Email', 'Drive', 'IS'].map(link => (
                      <button key={link} className="p-3 text-xs font-semibold bg-slate-50 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-100">
                        {link}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 space-y-4 border-red-100 bg-red-50/30">
                  <h4 className="font-bold flex items-center gap-2 text-red-700">
                    <AlertCircle size={18} />
                    Emergency Support
                  </h4>
                  <a 
                    href="mailto:upperoncall@harrowhaikou.cn?subject=Need support @A219C"
                    className="flex flex-col gap-1 p-3 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <span className="text-xs font-bold text-red-600">USLT & HOY Support</span>
                    <span className="text-[10px] text-slate-500">upperoncall@harrowhaikou.cn</span>
                  </a>
                </div>

                <div className="glass-card p-5 space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <AlertCircle size={18} className="text-amber-500" />
                    Urgent Tasks
                  </h4>
                  <div className="space-y-3">
                    {[
                      'Register Y10 Homework',
                      'Contact Li Si\'s parents',
                      'Prep for Y12 Calculus'
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-sm text-amber-900">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teaching Progress */}
              <div className="md:col-span-2 glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg">Teaching Progress</h4>
                  <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
                </div>
                <div className="space-y-6">
                  {[
                    { class: 'Y10-Math-A', topic: 'Quadratic Equations', progress: 65 },
                    { class: 'Y12-Math-HL', topic: 'Differentiation', progress: 40 },
                    { class: 'Y8-Math-B', topic: 'Probability', progress: 90 }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-700">{item.class}</span>
                        <span className="text-slate-500">{item.topic}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className="h-full bg-indigo-600 rounded-full" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Startup Ideas / Dream Board */}
              <div className="md:col-span-3 glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Lightbulb size={20} className="text-indigo-600" />
                    Startup灵感池 (25maths)
                  </h4>
                  <button className="btn-secondary text-xs">Manage Board</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Interactive Geometry Tool', desc: 'A web app for students to visualize 3D shapes.' },
                    { title: 'AI Math Tutor Bot', desc: 'LLM based assistant for solving word problems.' },
                    { title: 'Curriculum Mapping', desc: 'Aligning IGCSE with local math standards.' }
                  ].map((idea, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                      <h5 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{idea.title}</h5>
                      <p className="text-sm text-slate-500 mt-1">{idea.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'timetable':
        return <TimetableView />;
      case 'students':
        return <StudentsView />;
      case 'teaching':
        return <TeachingView />;
      case 'sop':
        return <SOPView />;
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
    </div>
  );
}

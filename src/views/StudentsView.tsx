import { useState } from 'react';
import { Plus, ChevronRight, AlertCircle, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { Student, ClassProfile } from '../types';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { USER_CONFIG } from '../shared/constants';

interface StudentsViewProps {
  students: Student[];
  classes: ClassProfile[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
  selectedClassId: string | null;
  onSelectClass: (id: string | null) => void;
  onAddStudent: () => void;
  onUpdateStudent: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onAddClass: () => void;
  onUpdateClass: (id: string) => void;
  onDeleteClass: (id: string) => void;
  onAddStatusRecord: (studentId: string) => void;
  onAddRequest: (studentId: string) => void;
}

export const StudentsView = ({
  students,
  classes,
  selectedStudentId,
  onSelectStudent,
  selectedClassId,
  onSelectClass,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddStatusRecord,
  onAddRequest
}: StudentsViewProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'students'>('classes');

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedClass = classes.find(c => c.id === selectedClassId);

  if (selectedStudent) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onSelectStudent(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ChevronRight size={20} className="rotate-180" /> Back to List
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStudent(selectedStudent.id)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Edit Student
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this student?')) {
                  onDeleteStudent(selectedStudent.id);
                  onSelectStudent(null);
                }
              }}
              className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
            >
              Delete
            </button>
          </div>
        </div>

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
                      <MarkdownRenderer content={record.content} className="text-sm text-slate-700 leading-relaxed" />
                    </div>
                  ))}
                  {(!selectedStudent.status_records || selectedStudent.status_records.length === 0) && (
                    <p className="text-sm text-slate-400 italic">No status records found.</p>
                  )}
                  <button
                    onClick={() => onAddStatusRecord(selectedStudent.id)}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all"
                  >
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
                      <button disabled className="text-[10px] font-bold text-slate-400 cursor-not-allowed" title="Coming Soon">Recommend Practice</button>
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
                    <MarkdownRenderer content={req.content} className="text-xs text-slate-700" />
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
                <button
                  onClick={() => onAddRequest(selectedStudent.id)}
                  className="w-full btn-secondary text-xs py-2"
                >
                  + New Request
                </button>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => window.location.href = `mailto:${USER_CONFIG.email}?subject=Missing ${selectedStudent.name} from ${USER_CONFIG.room}`}
                  className="w-full py-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertCircle size={16} /> Report Missing
                </button>
                <button disabled className="w-full py-3 bg-indigo-50 text-indigo-400 text-xs font-bold rounded-xl cursor-not-allowed" title="Coming Soon">
                  Generate Subject Report
                </button>
                <button disabled className="w-full py-3 bg-slate-50 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed" title="Coming Soon">
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
    const classStudents = students.filter(s => selectedClass.student_ids.includes(s.id));
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onSelectClass(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ChevronRight size={20} className="rotate-180" /> Back to Classes
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateClass(selectedClass.id)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Edit Class
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this class?')) {
                  onDeleteClass(selectedClass.id);
                  onSelectClass(null);
                }
              }}
              className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="glass-card p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{selectedClass.name}</h2>
              <p className="text-slate-500 mt-1">{selectedClass.year_group} • {selectedClass.description}</p>
            </div>
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
        <div className="flex items-center gap-4">
          <button
            onClick={activeSubTab === 'students' ? onAddStudent : onAddClass}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            {activeSubTab === 'students' ? 'Add Student' : 'Add Class'}
          </button>
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
      </div>

      {activeSubTab === 'classes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
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
          {students.map(student => (
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
          {students.length === 0 && (
            <div className="col-span-full glass-card p-12 text-center border-dashed">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No students added yet.</p>
              <button onClick={onAddStudent} className="mt-4 text-indigo-600 font-bold hover:underline">Add First Student</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, ChevronRight, X, LayoutGrid, Table as TableIcon, Edit3, Users, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import { Student, ClassProfile, ExamRecord, HPAwardLog, ParentCommunication, StudentWeakness } from '../types';
import { FilterChip } from '../components/FilterChip';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { StudentDetailView } from './students/StudentDetailView';
import { ClassDetailView } from './students/ClassDetailView';

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
  onEditStatusRecord?: (studentId: string, recordId: string, currentContent: string) => void;
  onDeleteStatusRecord?: (studentId: string, recordId: string) => void;
  onAddWeakness?: (studentId: string) => void;
  onEditWeakness?: (studentId: string, index: number, weakness: StudentWeakness) => void;
  onDeleteWeakness?: (studentId: string, index: number) => void;
  onAddRequest: (studentId: string) => void;
  onEditRequest?: (studentId: string, requestId: string, currentContent: string) => void;
  onDeleteRequest?: (studentId: string, requestId: string) => void;
  onToggleRequestStatus?: (studentId: string, requestId: string) => void;
  onUpdateRequestDate?: (studentId: string, requestId: string, field: 'date' | 'resolved_date', value: string) => void;
  onAddParentComm: (studentId: string) => void;
  onEditParentComm?: (studentId: string, comm: ParentCommunication) => void;
  onAddParentCommFollowUp?: (studentId: string, commId: string) => void;
  onDeleteParentComm?: (studentId: string, commId: string) => void;
  onToggleParentCommStatus?: (studentId: string, commId: string) => void;
  onUpdateParentCommDate?: (studentId: string, commId: string, field: 'date' | 'resolved_date', value: string) => void;
  onAddExamRecord: (studentId: string, record: Omit<ExamRecord, 'id'>) => void;
  onBatchAwardHP: (awards: { student_id: string; points: number; reason: string }[]) => void;
  hpAwardLogs?: HPAwardLog[];
  onNavigateToHPHistory?: (studentId: string) => void;
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
  onEditStatusRecord,
  onDeleteStatusRecord,
  onAddWeakness,
  onEditWeakness,
  onDeleteWeakness,
  onAddRequest,
  onEditRequest,
  onDeleteRequest,
  onToggleRequestStatus,
  onUpdateRequestDate,
  onAddParentComm,
  onEditParentComm,
  onAddParentCommFollowUp,
  onDeleteParentComm,
  onToggleParentCommStatus,
  onUpdateParentCommDate,
  onAddExamRecord,
  onBatchAwardHP,
  hpAwardLogs,
  onNavigateToHPHistory,
}: StudentsViewProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'students'>('classes');

  // View toggle, class filter, batch HP
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [batchPoints, setBatchPoints] = useState(1);
  const [batchReason, setBatchReason] = useState('');

  // Derived data
  const classNames = useMemo(() => Array.from(new Set(students.map(s => s.class_name).filter(Boolean))).sort(), [students]);
  const filteredStudents = useMemo(() => classFilter === 'all' ? students : students.filter(s => s.class_name === classFilter), [students, classFilter]);

  // Clear selection when filter or sub-tab changes
  useEffect(() => { setSelectedStudentIds(new Set()); }, [classFilter, activeSubTab]);

  // Helpers
  const toggleStudent = useCallback((id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const toggleAll = useCallback(() => {
    setSelectedStudentIds(prev =>
      prev.size === filteredStudents.length ? new Set() : new Set(filteredStudents.map(s => s.id))
    );
  }, [filteredStudents]);
  const clearSelection = useCallback(() => { setSelectedStudentIds(new Set()); setBatchPoints(1); setBatchReason(''); }, []);

  const handleBatchAward = useCallback(() => {
    if (selectedStudentIds.size === 0) return;
    const awards = Array.from(selectedStudentIds).map(student_id => ({
      student_id,
      points: batchPoints,
      reason: batchReason || 'House Points Award',
    }));
    onBatchAwardHP(awards);
    clearSelection();
  }, [selectedStudentIds, batchPoints, batchReason, onBatchAwardHP, clearSelection]);

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);
  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

  if (selectedStudent) {
    return (
      <StudentDetailView
        student={selectedStudent}
        hpAwardLogs={hpAwardLogs}
        onBack={() => onSelectStudent(null)}
        onUpdateStudent={onUpdateStudent}
        onDeleteStudent={onDeleteStudent}
        onAddExamRecord={onAddExamRecord}
        onAddStatusRecord={onAddStatusRecord}
        onEditStatusRecord={onEditStatusRecord}
        onDeleteStatusRecord={onDeleteStatusRecord}
        onAddWeakness={onAddWeakness}
        onEditWeakness={onEditWeakness}
        onDeleteWeakness={onDeleteWeakness}
        onAddRequest={onAddRequest}
        onEditRequest={onEditRequest}
        onDeleteRequest={onDeleteRequest}
        onToggleRequestStatus={onToggleRequestStatus}
        onUpdateRequestDate={onUpdateRequestDate}
        onAddParentComm={onAddParentComm}
        onEditParentComm={onEditParentComm}
        onAddParentCommFollowUp={onAddParentCommFollowUp}
        onDeleteParentComm={onDeleteParentComm}
        onToggleParentCommStatus={onToggleParentCommStatus}
        onUpdateParentCommDate={onUpdateParentCommDate}
        onNavigateToHPHistory={onNavigateToHPHistory}
      />
    );
  }

  if (selectedClass) {
    return (
      <ClassDetailView
        classProfile={selectedClass}
        students={students}
        onBack={() => onSelectClass(null)}
        onUpdateClass={onUpdateClass}
        onDeleteClass={onDeleteClass}
        onSelectStudent={(id) => onSelectStudent(id)}
      />
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
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
          {/* View mode toggle (only visible on students tab) */}
          {activeSubTab === 'students' && (
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('card')}
                className={cn(
                  "p-1.5 rounded transition-all",
                  viewMode === 'card' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
                title="Card View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-1.5 rounded transition-all",
                  viewMode === 'table' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
                title="Table View"
              >
                <TableIcon size={18} />
              </button>
            </div>
          )}
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
                {cls.description && (
                  <MarkdownRenderer content={cls.description} className="text-sm text-slate-500 mt-1 line-clamp-2 [&_p]:inline [&_p]:m-0" />
                )}
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cls.student_ids.length} Students</span>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Class filter tabs */}
          <div className="flex flex-wrap gap-2">
            <FilterChip
              onClick={() => setClassFilter('all')}
              active={classFilter === 'all'}
            >
              All Classes
            </FilterChip>
            {classNames.map(name => (
              <FilterChip
                key={name}
                onClick={() => setClassFilter(name)}
                active={classFilter === name}
              >
                {name}
              </FilterChip>
            ))}
          </div>

          {/* Select All toolbar */}
          {filteredStudents.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-500">
                  {selectedStudentIds.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </span>
              </label>
              {selectedStudentIds.size > 0 && (
                <span className="text-xs text-emerald-600 font-medium">
                  {selectedStudentIds.size} / {filteredStudents.length} selected
                </span>
              )}
            </div>
          )}

          {/* Card View */}
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  className={cn(
                    "glass-card p-5 hover:shadow-md transition-shadow cursor-pointer group relative",
                    selectedStudentIds.has(student.id) && "ring-2 ring-emerald-400"
                  )}
                >
                  {/* Checkbox */}
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.has(student.id)}
                      onChange={(e) => { e.stopPropagation(); toggleStudent(student.id); }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div onClick={() => onSelectStudent(student.id)} className="pl-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {student.name}
                          {student.chinese_name && <span className="text-sm text-slate-400 ml-1.5 font-normal">{student.chinese_name}</span>}
                        </h3>
                        <p className="text-sm text-slate-500">{student.year_group} • {student.class_name}{student.house && ` • ${student.house}`}</p>
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
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="col-span-full glass-card p-12 text-center border-dashed">
                  <Users size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">{classFilter === 'all' ? 'No students added yet.' : 'No students in this class.'}</p>
                  {classFilter === 'all' && (
                    <button onClick={onAddStudent} className="mt-4 text-indigo-600 font-bold hover:underline">Add First Student</button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Table View */
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="py-3 px-3 w-10">
                        <input
                          type="checkbox"
                          checked={filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length}
                          onChange={toggleAll}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-slate-400 uppercase">Name</th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-slate-400 uppercase">Class</th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-slate-400 uppercase">Year</th>
                      <th className="text-center py-3 px-3 text-xs font-bold text-slate-400 uppercase">HP</th>
                      <th className="text-center py-3 px-3 text-xs font-bold text-slate-400 uppercase">Weaknesses</th>
                      <th className="text-center py-3 px-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr
                        key={student.id}
                        className={cn(
                          "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                          selectedStudentIds.has(student.id) && "bg-emerald-50/50"
                        )}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.has(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td
                          className="py-3 px-3 cursor-pointer"
                          onClick={() => onSelectStudent(student.id)}
                        >
                          <span className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                            {student.name}
                          </span>
                          {student.chinese_name && (
                            <span className="text-slate-400 ml-1.5 text-xs">{student.chinese_name}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{student.class_name}</td>
                        <td className="py-3 px-3 text-slate-500">{student.year_group}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-bold border border-emerald-100">
                            {student.house_points}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500">
                          {student.weaknesses?.length || 0}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => onUpdateStudent(student.id)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredStudents.length === 0 && (
                <div className="p-12 text-center">
                  <Users size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">{classFilter === 'all' ? 'No students added yet.' : 'No students in this class.'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Batch HP Action Bar */}
      {selectedStudentIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[50] bg-white border border-emerald-200 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 max-w-2xl w-[90vw]">
          <Award size={20} className="text-emerald-600 shrink-0" />
          <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
            {selectedStudentIds.size} selected
          </span>
          <select
            value={batchPoints}
            onChange={e => setBatchPoints(Number(e.target.value))}
            className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-medium bg-white min-w-[70px]"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} HP</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Reason (optional)"
            value={batchReason}
            onChange={e => setBatchReason(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm min-w-0"
          />
          <button
            onClick={handleBatchAward}
            className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            Award HP
          </button>
          <button
            onClick={clearSelection}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            title="Cancel"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

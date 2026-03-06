import { useState, useEffect } from 'react';
import { Plus, ChevronRight, AlertCircle, Users, Mail, Key, Trophy, X, Loader2, LayoutGrid, Table as TableIcon, Award, Edit3, CheckCircle2, Circle, Trash2, Pencil, MessageSquare, Phone, MessageCircle, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { Student, ClassProfile, ExamRecord, HPAwardLog, ParentCommunication, StudentWeakness } from '../types';
import { FilterChip } from '../components/FilterChip';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { USER_CONFIG } from '../shared/constants';
import { geminiService } from '../services/geminiService';
import { ActionPlanModal } from '../components/ActionPlanModal';

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
  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm] = useState({ exam_name: '', date: '', score: '', total_score: '', weaknesses: '' });
  const [recommendationLoading, setRecommendationLoading] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});

  // New state for view toggle, class filter, batch HP
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [batchPoints, setBatchPoints] = useState(1);
  const [batchReason, setBatchReason] = useState('');
  const [subjectReportLoading, setSubjectReportLoading] = useState(false);
  const [subjectReportMarkdown, setSubjectReportMarkdown] = useState<string | null>(null);
  const [parentNotesLoading, setParentNotesLoading] = useState(false);
  const [parentNotesMarkdown, setParentNotesMarkdown] = useState<string | null>(null);

  // Derived data
  const classNames = Array.from(new Set(students.map(s => s.class_name).filter(Boolean))).sort();
  const filteredStudents = classFilter === 'all' ? students : students.filter(s => s.class_name === classFilter);

  // Clear selection when filter or sub-tab changes
  useEffect(() => { setSelectedStudentIds(new Set()); }, [classFilter, activeSubTab]);

  // Helpers
  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelectedStudentIds(prev =>
      prev.size === filteredStudents.length ? new Set() : new Set(filteredStudents.map(s => s.id))
    );
  };
  const clearSelection = () => { setSelectedStudentIds(new Set()); setBatchPoints(1); setBatchReason(''); };

  const handleBatchAward = () => {
    if (selectedStudentIds.size === 0) return;
    const awards = Array.from(selectedStudentIds).map(student_id => ({
      student_id,
      points: batchPoints,
      reason: batchReason || 'House Points Award',
    }));
    onBatchAwardHP(awards);
    clearSelection();
  };

  const handleGenerateSubjectReport = async (student: Student) => {
    setSubjectReportLoading(true);
    try {
      const result = await geminiService.generateSubjectReport({
        studentName: student.name,
        chineseName: student.chinese_name,
        yearGroup: student.year_group,
        className: student.class_name,
        examRecords: (student.exam_records ?? []).map(e => ({ exam_name: e.exam_name, date: e.date, score: e.score, total_score: e.total_score })),
        weaknesses: (student.weaknesses ?? []).map(w => ({ topic: w.topic, level: w.level, notes: w.notes })),
        statusRecords: (student.status_records ?? []).map(s => ({ content: s.content, timestamp: s.date })),
        requests: (student.requests ?? []).map(r => ({ content: r.content, timestamp: r.date })),
      });
      setSubjectReportMarkdown(result);
    } catch (err) {
      console.error('Failed to generate subject report:', err);
      alert('Failed to generate subject report. Please try again.');
    } finally {
      setSubjectReportLoading(false);
    }
  };

  const handleGenerateParentNotes = async (student: Student) => {
    setParentNotesLoading(true);
    try {
      const result = await geminiService.generateParentMeetingNotes({
        studentName: student.name,
        chineseName: student.chinese_name,
        yearGroup: student.year_group,
        className: student.class_name,
        examRecords: (student.exam_records ?? []).map(e => ({ exam_name: e.exam_name, date: e.date, score: e.score, total_score: e.total_score })),
        weaknesses: (student.weaknesses ?? []).map(w => ({ topic: w.topic, level: w.level, notes: w.notes })),
        statusRecords: (student.status_records ?? []).map(s => ({ content: s.content, timestamp: s.date })),
        parentCommunications: (student.parent_communications ?? []).map(c => ({ type: c.method, content: c.content, timestamp: c.date })),
      });
      setParentNotesMarkdown(result);
    } catch (err) {
      console.error('Failed to generate parent meeting notes:', err);
      alert('Failed to generate parent meeting notes. Please try again.');
    } finally {
      setParentNotesLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedClass = classes.find(c => c.id === selectedClassId);

  if (selectedStudent) {
    return (
      <>
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
                    <h2 className="text-3xl font-bold text-slate-900">
                      {selectedStudent.name}
                      {selectedStudent.chinese_name && <span className="text-xl text-slate-400 ml-2">{selectedStudent.chinese_name}</span>}
                    </h2>
                    <p className="text-slate-500">
                      {selectedStudent.year_group} • {selectedStudent.class_name}
                      {selectedStudent.tutor_group && <> • Tutor: {selectedStudent.tutor_group}</>}
                      {selectedStudent.house && <> • {selectedStudent.house}</>}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100">
                  {selectedStudent.house_points} HP
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedStudent.parent_email && (
                  <a href={`mailto:${selectedStudent.parent_email}`} className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                    <Mail size={14} className="text-blue-500" />
                    <span className="text-xs text-blue-700 truncate">{selectedStudent.parent_email}</span>
                  </a>
                )}
                {selectedStudent.dfm_username && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <Key size={14} className="text-purple-500" />
                    <span className="text-xs text-purple-700">DFM: {selectedStudent.dfm_username} / {selectedStudent.dfm_password || '—'}</span>
                  </div>
                )}
              </div>

              {/* Tutors */}
              {(selectedStudent.tutor_1 || selectedStudent.tutor_2) && (
                <div className="flex gap-4">
                  {selectedStudent.tutor_1 && (
                    <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-sm">
                      <span className="text-amber-500 font-bold text-xs uppercase">导师1</span> <span className="text-amber-800">{selectedStudent.tutor_1}</span>
                    </div>
                  )}
                  {selectedStudent.tutor_2 && (
                    <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-sm">
                      <span className="text-amber-500 font-bold text-xs uppercase">导师2</span> <span className="text-amber-800">{selectedStudent.tutor_2}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Exam Records */}
              <section className="space-y-4">
                <h3 className="font-bold text-lg border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" /> 成绩登记 (Exam Records)
                </h3>
                {selectedStudent.exam_records && selectedStudent.exam_records.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase">考试</th>
                          <th className="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase">日期</th>
                          <th className="text-center py-2 px-3 text-xs font-bold text-slate-400 uppercase">成绩</th>
                          <th className="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase">薄弱环节</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.exam_records.map(exam => {
                          const pct = exam.total_score > 0 ? Math.round((exam.score / exam.total_score) * 100) : 0;
                          return (
                            <tr key={exam.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-3 font-medium text-slate-900">{exam.exam_name}</td>
                              <td className="py-3 px-3 text-slate-500">{exam.date}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={cn(
                                  "font-bold",
                                  pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-red-600"
                                )}>
                                  {exam.score}/{exam.total_score}
                                </span>
                                <span className="text-slate-400 text-xs ml-1">({pct}%)</span>
                              </td>
                              <td className="py-3 px-3 text-slate-500">{exam.weaknesses || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No exam records yet.</p>
                )}

                {showExamForm ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700">添加考试成绩</span>
                      <button onClick={() => setShowExamForm(false)} className="p-1 hover:bg-slate-200 rounded-full"><X size={16} /></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <input
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm col-span-2"
                        placeholder="考试名称 e.g. 第1次考试"
                        value={examForm.exam_name}
                        onChange={e => setExamForm(f => ({ ...f, exam_name: e.target.value }))}
                      />
                      <input
                        type="date" className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        value={examForm.date}
                        onChange={e => setExamForm(f => ({ ...f, date: e.target.value }))}
                      />
                      <div className="flex gap-1 items-center">
                        <input
                          type="number" className="px-3 py-2 rounded-lg border border-slate-200 text-sm w-20"
                          placeholder="成绩"
                          value={examForm.score}
                          onChange={e => setExamForm(f => ({ ...f, score: e.target.value }))}
                        />
                        <span className="text-slate-400">/</span>
                        <input
                          type="number" className="px-3 py-2 rounded-lg border border-slate-200 text-sm w-20"
                          placeholder="总分"
                          value={examForm.total_score}
                          onChange={e => setExamForm(f => ({ ...f, total_score: e.target.value }))}
                        />
                      </div>
                    </div>
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      placeholder="薄弱环节 e.g. Algebra, Trigonometry"
                      value={examForm.weaknesses}
                      onChange={e => setExamForm(f => ({ ...f, weaknesses: e.target.value }))}
                    />
                    <button
                      onClick={() => {
                        if (!examForm.exam_name || !examForm.score) return;
                        onAddExamRecord(selectedStudent.id, {
                          exam_name: examForm.exam_name,
                          date: examForm.date || new Date().toISOString().split('T')[0],
                          score: parseInt(examForm.score) || 0,
                          total_score: parseInt(examForm.total_score) || 100,
                          weaknesses: examForm.weaknesses,
                        });
                        setExamForm({ exam_name: '', date: '', score: '', total_score: '', weaknesses: '' });
                        setShowExamForm(false);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowExamForm(true)}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all"
                  >
                    + 添加考试成绩
                  </button>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="font-bold text-lg border-b border-slate-100 pb-2">学习状况记录 (Learning Status)</h3>
                <div className="space-y-4">
                  {selectedStudent.status_records?.map(record => (
                    <div key={record.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 group">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{record.date}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                            {record.category}
                          </span>
                          {onEditStatusRecord && (
                            <button
                              onClick={() => onEditStatusRecord(selectedStudent.id, record.id, record.content)}
                              className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                          {onDeleteStatusRecord && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this status record?')) onDeleteStatusRecord(selectedStudent.id, record.id);
                              }}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
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
                  {selectedStudent.weaknesses?.map((w, i) => {
                    const wKey = `${selectedStudent.id}-${w.topic}`;
                    const isLoading = recommendationLoading === wKey;
                    const rec = recommendations[wKey];
                    return (
                      <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2 group">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-slate-900">{w.topic}</p>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                              w.level === 'high' ? "bg-red-100 text-red-600" :
                              w.level === 'medium' ? "bg-amber-100 text-amber-600" :
                              "bg-blue-100 text-blue-600"
                            )}>
                              {w.level}
                            </span>
                            {onEditWeakness && (
                              <button
                                onClick={() => onEditWeakness(selectedStudent.id, i, w)}
                                className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                            {onDeleteWeakness && (
                              <button
                                onClick={() => {
                                  if (confirm('Delete this weakness?')) onDeleteWeakness(selectedStudent.id, i);
                                }}
                                className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        {w.notes && <MarkdownRenderer content={w.notes} className="text-xs text-slate-500" />}
                        <button
                          disabled={isLoading}
                          onClick={async () => {
                            setRecommendationLoading(wKey);
                            try {
                              const result = await geminiService.recommendPractice({
                                topic: w.topic,
                                level: w.level,
                                notes: w.notes,
                                studentYearGroup: selectedStudent.year_group,
                              });
                              setRecommendations(prev => ({ ...prev, [wKey]: result }));
                            } catch {
                              // Silent fail
                            } finally {
                              setRecommendationLoading(null);
                            }
                          }}
                          className={cn(
                            "text-[10px] font-bold flex items-center gap-1",
                            isLoading ? "text-slate-400 cursor-not-allowed" : "text-indigo-600 hover:underline"
                          )}
                        >
                          {isLoading && <Loader2 size={10} className="animate-spin" />}
                          {isLoading ? 'Analysing...' : 'Recommend Practice'}
                        </button>
                        {rec && (
                          <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <MarkdownRenderer content={rec} className="text-xs text-slate-700 leading-relaxed" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(!selectedStudent.weaknesses || selectedStudent.weaknesses.length === 0) && (
                  <p className="text-sm text-slate-400 italic">No weaknesses recorded.</p>
                )}
                {onAddWeakness && (
                  <button
                    onClick={() => onAddWeakness(selectedStudent.id)}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all"
                  >
                    + Add Weakness
                  </button>
                )}
              </section>

              {/* HP History */}
              {hpAwardLogs && (() => {
                const studentLogs = hpAwardLogs
                  .filter(l => l.student_id === selectedStudent.id)
                  .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
                const displayLogs = studentLogs.slice(0, 10);
                const totalHP = studentLogs.reduce((sum, l) => sum + l.points, 0);
                return (
                  <section className="space-y-4">
                    <h3 className="font-bold text-lg border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Award size={18} className="text-emerald-500" /> House Point History
                    </h3>
                    {studentLogs.length > 0 ? (
                      <>
                        <p className="text-sm text-slate-500">
                          <span className="font-bold text-emerald-600">{totalHP} HP</span> from {studentLogs.length} award{studentLogs.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-2">
                          {displayLogs.map(log => (
                            <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-xs text-slate-400 font-mono w-[80px] shrink-0">{log.date}</span>
                              <span className="text-sm text-slate-600 flex-1 truncate">{log.reason}</span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-bold border border-emerald-100">+{log.points}</span>
                              <span className={cn(
                                "text-[10px] font-bold uppercase",
                                log.source === 'lesson' ? "text-indigo-500" : "text-amber-500"
                              )}>{log.source}</span>
                            </div>
                          ))}
                        </div>
                        {studentLogs.length > 10 && onNavigateToHPHistory && (
                          <button
                            onClick={() => onNavigateToHPHistory(selectedStudent.id)}
                            className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:underline"
                          >
                            View All {studentLogs.length} Awards <ChevronRight size={16} />
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No HP awards yet.</p>
                    )}
                  </section>
                );
              })()}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">平时诉求 (Requests)</h3>
              <div className="space-y-3">
                {selectedStudent.requests?.map(req => (
                  <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 group">
                    <MarkdownRenderer content={req.content} className="text-xs text-slate-700" />
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span>提出:</span>
                        {onUpdateRequestDate ? (
                          <input
                            type="date"
                            value={req.date}
                            onChange={e => onUpdateRequestDate(selectedStudent.id, req.id, 'date', e.target.value)}
                            className="text-[10px] text-slate-500 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-400 outline-none px-0.5 w-[95px]"
                          />
                        ) : (
                          <span>{req.date}</span>
                        )}
                      </div>
                      {req.status === 'resolved' && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                          <span>解决:</span>
                          {onUpdateRequestDate ? (
                            <input
                              type="date"
                              value={req.resolved_date || ''}
                              onChange={e => onUpdateRequestDate(selectedStudent.id, req.id, 'resolved_date', e.target.value)}
                              className="text-[10px] text-emerald-500 bg-transparent border-b border-dashed border-emerald-300 focus:border-emerald-500 outline-none px-0.5 w-[95px]"
                            />
                          ) : (
                            <span>{req.resolved_date || '—'}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        {onToggleRequestStatus && (
                          <button
                            onClick={() => onToggleRequestStatus(selectedStudent.id, req.id)}
                            className={cn(
                              "flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded transition-colors cursor-pointer",
                              req.status === 'resolved'
                                ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                            )}
                            title={req.status === 'pending' ? 'Mark as resolved' : 'Mark as pending'}
                          >
                            {req.status === 'resolved' ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                            {req.status}
                          </button>
                        )}
                        {!onToggleRequestStatus && (
                          <span className={cn(
                            "text-[10px] font-bold uppercase",
                            req.status === 'resolved' ? "text-emerald-600" : "text-amber-600"
                          )}>
                            {req.status}
                          </span>
                        )}
                        {onEditRequest && (
                          <button
                            onClick={() => onEditRequest(selectedStudent.id, req.id, req.content)}
                            className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                        {onDeleteRequest && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this request?')) onDeleteRequest(selectedStudent.id, req.id);
                            }}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(!selectedStudent.requests || selectedStudent.requests.length === 0) && (
                  <p className="text-sm text-slate-400 italic">No requests yet.</p>
                )}
                <button
                  onClick={() => onAddRequest(selectedStudent.id)}
                  className="w-full btn-secondary text-xs py-2"
                >
                  + New Request
                </button>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" /> 家校沟通 (Parent Comm.)
              </h3>
              <div className="space-y-3">
                {selectedStudent.parent_communications?.map(comm => {
                  const methodIcon = comm.method === 'phone' ? <Phone size={10} />
                    : comm.method === 'wechat' ? <MessageCircle size={10} />
                    : comm.method === 'email' ? <Mail size={10} />
                    : comm.method === 'face-to-face' ? <Users size={10} />
                    : <MoreHorizontal size={10} />;
                  const methodLabel = comm.method === 'face-to-face' ? '面谈'
                    : comm.method === 'phone' ? '电话'
                    : comm.method === 'wechat' ? '微信'
                    : comm.method === 'email' ? '邮件'
                    : '其他';
                  return (
                    <div key={comm.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 group">
                      {/* Header: date + method + actions */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          {onUpdateParentCommDate ? (
                            <input
                              type="date"
                              value={comm.date}
                              onChange={e => onUpdateParentCommDate(selectedStudent.id, comm.id, 'date', e.target.value)}
                              className="text-[10px] text-slate-500 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-400 outline-none px-0.5 w-[95px]"
                            />
                          ) : (
                            <span>{comm.date}</span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {methodIcon} {methodLabel}
                        </span>
                        {comm.status === 'resolved' && comm.resolved_date && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                            <span>解决:</span>
                            {onUpdateParentCommDate ? (
                              <input
                                type="date"
                                value={comm.resolved_date}
                                onChange={e => onUpdateParentCommDate(selectedStudent.id, comm.id, 'resolved_date', e.target.value)}
                                className="text-[10px] text-emerald-500 bg-transparent border-b border-dashed border-emerald-300 focus:border-emerald-500 outline-none px-0.5 w-[95px]"
                              />
                            ) : (
                              <span>{comm.resolved_date}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                          {onToggleParentCommStatus && (
                            <button
                              onClick={() => onToggleParentCommStatus(selectedStudent.id, comm.id)}
                              className={cn(
                                "flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded transition-colors cursor-pointer",
                                comm.status === 'resolved'
                                  ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                  : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                              )}
                              title={comm.status === 'pending' ? 'Mark as resolved' : 'Mark as pending'}
                            >
                              {comm.status === 'resolved' ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                              {comm.status}
                            </button>
                          )}
                          {onEditParentComm && (
                            <button
                              onClick={() => onEditParentComm(selectedStudent.id, comm)}
                              className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                          {onDeleteParentComm && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this communication record?')) onDeleteParentComm(selectedStudent.id, comm.id);
                              }}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Content */}
                      <MarkdownRenderer content={comm.content} className="text-xs text-slate-700" />
                      {/* Follow-up plan */}
                      {comm.needs_follow_up && comm.follow_up_plan && (
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">跟进计划</p>
                          <p className="text-xs text-amber-700">{comm.follow_up_plan}</p>
                        </div>
                      )}
                      {/* Follow-up records */}
                      {comm.follow_ups && comm.follow_ups.length > 0 && (
                        <div className="space-y-1.5 pl-3 border-l-2 border-blue-200">
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">跟进记录</p>
                          {comm.follow_ups.map((fu, idx) => (
                            <div key={idx} className="text-xs text-slate-600">
                              <span className="text-[10px] text-slate-400 font-mono mr-2">{fu.date}</span>
                              {fu.content}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Add follow-up button (only for pending items with follow-up plan) */}
                      {comm.needs_follow_up && onAddParentCommFollowUp && (
                        <button
                          onClick={() => onAddParentCommFollowUp(selectedStudent.id, comm.id)}
                          className="text-[10px] font-bold text-blue-500 hover:underline"
                        >
                          + 追加跟进记录
                        </button>
                      )}
                    </div>
                  );
                })}
                {(!selectedStudent.parent_communications || selectedStudent.parent_communications.length === 0) && (
                  <p className="text-sm text-slate-400 italic">No communication records yet.</p>
                )}
                <button
                  onClick={() => onAddParentComm(selectedStudent.id)}
                  className="w-full btn-secondary text-xs py-2"
                >
                  + 新增沟通记录
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
                <button
                  onClick={() => handleGenerateSubjectReport(selectedStudent)}
                  disabled={subjectReportLoading}
                  className="w-full py-3 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subjectReportLoading ? <><Loader2 size={14} className="animate-spin" /> 生成中...</> : 'Generate Subject Report'}
                </button>
                <button
                  onClick={() => handleGenerateParentNotes(selectedStudent)}
                  disabled={parentNotesLoading}
                  className="w-full py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {parentNotesLoading ? <><Loader2 size={14} className="animate-spin" /> 生成中...</> : 'Parent Meeting Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {subjectReportMarkdown && (
        <ActionPlanModal
          title="Subject Report"
          meetingTitle={`${selectedStudent.name}${selectedStudent.chinese_name ? ` (${selectedStudent.chinese_name})` : ''}`}
          markdown={subjectReportMarkdown}
          onClose={() => setSubjectReportMarkdown(null)}
        />
      )}
      {parentNotesMarkdown && (
        <ActionPlanModal
          title="Parent Meeting Notes"
          meetingTitle={`${selectedStudent.name}${selectedStudent.chinese_name ? ` (${selectedStudent.chinese_name})` : ''}`}
          markdown={parentNotesMarkdown}
          onClose={() => setParentNotesMarkdown(null)}
        />
      )}
      </>
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

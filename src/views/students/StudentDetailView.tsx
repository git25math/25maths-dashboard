import { useState, memo } from 'react';
import { ChevronRight, Key, Mail } from 'lucide-react';
import { Student, ExamRecord, HPAwardLog, ParentCommunication, StudentWeakness } from '../../types';
import { ActionPlanModal } from '../../components/ActionPlanModal';
import { geminiService } from '../../services/geminiService';
import { ExamRecordsSection } from './ExamRecordsSection';
import { StatusRecordsSection } from './StatusRecordsSection';
import { WeaknessesSection } from './WeaknessesSection';
import { HPHistorySection } from './HPHistorySection';
import { RequestsSidebar } from './RequestsSidebar';
import { ParentCommSidebar } from './ParentCommSidebar';
import { QuickActionsSidebar } from './QuickActionsSidebar';

interface StudentDetailViewProps {
  student: Student;
  hpAwardLogs?: HPAwardLog[];
  onBack: () => void;
  onUpdateStudent: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onAddExamRecord: (studentId: string, record: Omit<ExamRecord, 'id'>) => void;
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
  onNavigateToHPHistory?: (studentId: string) => void;
}

export const StudentDetailView = memo(function StudentDetailView({
  student,
  hpAwardLogs,
  onBack,
  onUpdateStudent,
  onDeleteStudent,
  onAddExamRecord,
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
  onNavigateToHPHistory,
}: StudentDetailViewProps) {
  const [recommendationLoading, setRecommendationLoading] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  const [subjectReportLoading, setSubjectReportLoading] = useState(false);
  const [subjectReportMarkdown, setSubjectReportMarkdown] = useState<string | null>(null);
  const [parentNotesLoading, setParentNotesLoading] = useState(false);
  const [parentNotesMarkdown, setParentNotesMarkdown] = useState<string | null>(null);

  const handleGenerateSubjectReport = async () => {
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

  const handleGenerateParentNotes = async () => {
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

  const handleRecommendPractice = async (wKey: string, weakness: StudentWeakness) => {
    setRecommendationLoading(wKey);
    try {
      const result = await geminiService.recommendPractice({
        topic: weakness.topic,
        level: weakness.level,
        notes: weakness.notes,
        studentYearGroup: student.year_group,
      });
      setRecommendations(prev => ({ ...prev, [wKey]: result }));
    } catch {
      // Silent fail
    } finally {
      setRecommendationLoading(null);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to List
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateStudent(student.id)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Edit Student
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this student?')) {
                onDeleteStudent(student.id);
                onBack();
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
            {/* Profile Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    {student.name}
                    {student.chinese_name && <span className="text-xl text-slate-400 ml-2">{student.chinese_name}</span>}
                  </h2>
                  <p className="text-slate-500">
                    {student.year_group} • {student.class_name}
                    {student.tutor_group && <> • Tutor: {student.tutor_group}</>}
                    {student.house && <> • {student.house}</>}
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100">
                {student.house_points} HP
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {student.parent_email && (
                <a href={`mailto:${student.parent_email}`} className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                  <Mail size={14} className="text-blue-500" />
                  <span className="text-xs text-blue-700 truncate">{student.parent_email}</span>
                </a>
              )}
              {student.dfm_username && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <Key size={14} className="text-purple-500" />
                  <span className="text-xs text-purple-700">DFM: {student.dfm_username} / {student.dfm_password || '—'}</span>
                </div>
              )}
            </div>

            {/* Tutors */}
            {(student.tutor_1 || student.tutor_2) && (
              <div className="flex gap-4">
                {student.tutor_1 && (
                  <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-sm">
                    <span className="text-amber-500 font-bold text-xs uppercase">导师1</span> <span className="text-amber-800">{student.tutor_1}</span>
                  </div>
                )}
                {student.tutor_2 && (
                  <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-sm">
                    <span className="text-amber-500 font-bold text-xs uppercase">导师2</span> <span className="text-amber-800">{student.tutor_2}</span>
                  </div>
                )}
              </div>
            )}

            <ExamRecordsSection student={student} onAddExamRecord={onAddExamRecord} />

            <StatusRecordsSection
              student={student}
              onAddStatusRecord={onAddStatusRecord}
              onEditStatusRecord={onEditStatusRecord}
              onDeleteStatusRecord={onDeleteStatusRecord}
            />

            <WeaknessesSection
              student={student}
              recommendationLoading={recommendationLoading}
              recommendations={recommendations}
              onRecommendPractice={handleRecommendPractice}
              onAddWeakness={onAddWeakness}
              onEditWeakness={onEditWeakness}
              onDeleteWeakness={onDeleteWeakness}
            />

            {hpAwardLogs && (
              <HPHistorySection
                student={student}
                hpAwardLogs={hpAwardLogs}
                onNavigateToHPHistory={onNavigateToHPHistory}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RequestsSidebar
            student={student}
            onAddRequest={onAddRequest}
            onEditRequest={onEditRequest}
            onDeleteRequest={onDeleteRequest}
            onToggleRequestStatus={onToggleRequestStatus}
            onUpdateRequestDate={onUpdateRequestDate}
          />

          <ParentCommSidebar
            student={student}
            onAddParentComm={onAddParentComm}
            onEditParentComm={onEditParentComm}
            onAddParentCommFollowUp={onAddParentCommFollowUp}
            onDeleteParentComm={onDeleteParentComm}
            onToggleParentCommStatus={onToggleParentCommStatus}
            onUpdateParentCommDate={onUpdateParentCommDate}
          />

          <QuickActionsSidebar
            student={student}
            subjectReportLoading={subjectReportLoading}
            parentNotesLoading={parentNotesLoading}
            onGenerateSubjectReport={handleGenerateSubjectReport}
            onGenerateParentNotes={handleGenerateParentNotes}
          />
        </div>
      </div>
    </div>
    {subjectReportMarkdown && (
      <ActionPlanModal
        title="Subject Report"
        meetingTitle={`${student.name}${student.chinese_name ? ` (${student.chinese_name})` : ''}`}
        markdown={subjectReportMarkdown}
        onClose={() => setSubjectReportMarkdown(null)}
      />
    )}
    {parentNotesMarkdown && (
      <ActionPlanModal
        title="Parent Meeting Notes"
        meetingTitle={`${student.name}${student.chinese_name ? ` (${student.chinese_name})` : ''}`}
        markdown={parentNotesMarkdown}
        onClose={() => setParentNotesMarkdown(null)}
      />
    )}
    </>
  );
});

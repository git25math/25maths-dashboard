import { useState, memo } from 'react';
import { Trophy, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Student, ExamRecord } from '../../types';

interface ExamRecordsSectionProps {
  student: Student;
  onAddExamRecord: (studentId: string, record: Omit<ExamRecord, 'id'>) => void;
}

export const ExamRecordsSection = memo(function ExamRecordsSection({ student, onAddExamRecord }: ExamRecordsSectionProps) {
  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm] = useState({ exam_name: '', date: '', score: '', total_score: '', weaknesses: '' });

  return (
    <section className="space-y-4">
      <h3 className="font-bold text-lg border-b border-slate-100 pb-2 flex items-center gap-2">
        <Trophy size={18} className="text-amber-500" /> 成绩登记 (Exam Records)
      </h3>
      {student.exam_records && student.exam_records.length > 0 ? (
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
              {student.exam_records.map(exam => {
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
              onAddExamRecord(student.id, {
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
  );
});

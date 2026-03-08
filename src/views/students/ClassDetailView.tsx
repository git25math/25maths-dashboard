import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Student, ClassProfile } from '../../types';
import { MarkdownRenderer } from '../../components/RichTextEditor';

interface ClassDetailViewProps {
  classProfile: ClassProfile;
  students: Student[];
  onBack: () => void;
  onUpdateClass: (id: string) => void;
  onDeleteClass: (id: string) => void;
  onSelectStudent: (id: string) => void;
}

export const ClassDetailView = memo(function ClassDetailView({
  classProfile,
  students,
  onBack,
  onUpdateClass,
  onDeleteClass,
  onSelectStudent,
}: ClassDetailViewProps) {
  const classStudents = students.filter(s => classProfile.student_ids.includes(s.id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to Classes
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateClass(classProfile.id)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Edit Class
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this class?')) {
                onDeleteClass(classProfile.id);
                onBack();
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
            <h2 className="text-3xl font-bold text-slate-900">{classProfile.name}</h2>
            <div className="text-slate-500 mt-1 space-y-1">
              <p>{classProfile.year_group}</p>
              {classProfile.description && (
                <MarkdownRenderer content={classProfile.description} className="text-sm text-slate-500 [&_p]:m-0" />
              )}
            </div>
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
});

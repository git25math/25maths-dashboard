import { memo } from 'react';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Student, StudentWeakness } from '../../types';
import { MarkdownRenderer } from '../../components/RichTextEditor';

interface WeaknessesSectionProps {
  student: Student;
  recommendationLoading: string | null;
  recommendations: Record<string, string>;
  onRecommendPractice: (wKey: string, weakness: StudentWeakness) => void;
  onAddWeakness?: (studentId: string) => void;
  onEditWeakness?: (studentId: string, index: number, weakness: StudentWeakness) => void;
  onDeleteWeakness?: (studentId: string, index: number) => void;
}

export const WeaknessesSection = memo(function WeaknessesSection({
  student,
  recommendationLoading,
  recommendations,
  onRecommendPractice,
  onAddWeakness,
  onEditWeakness,
  onDeleteWeakness,
}: WeaknessesSectionProps) {
  return (
    <section className="space-y-4">
      <h3 className="font-bold text-lg border-b border-slate-100 pb-2">薄弱环节 (Weaknesses)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {student.weaknesses?.map((w, i) => {
          const wKey = `${student.id}-${w.topic}`;
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
                      onClick={() => onEditWeakness(student.id, i, w)}
                      className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                  {onDeleteWeakness && (
                    <button
                      onClick={() => {
                        if (confirm('Delete this weakness?')) onDeleteWeakness(student.id, i);
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
                onClick={() => onRecommendPractice(wKey, w)}
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
      {(!student.weaknesses || student.weaknesses.length === 0) && (
        <p className="text-sm text-slate-400 italic">No weaknesses recorded.</p>
      )}
      {onAddWeakness && (
        <button
          onClick={() => onAddWeakness(student.id)}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          + Add Weakness
        </button>
      )}
    </section>
  );
});

import { useState } from 'react';
import { Plus, Trash2, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { HousePointAward, Student } from '../types';

interface HousePointAwardsEditorProps {
  awards: HousePointAward[];
  onChange: (awards: HousePointAward[]) => void;
  students: Student[];
}

export const HousePointAwardsEditor = ({ awards, onChange, students }: HousePointAwardsEditorProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const addAward = (student: Student) => {
    // Don't add duplicate
    if (awards.some(a => a.student_id === student.id)) return;
    onChange([...awards, {
      student_id: student.id,
      student_name: student.chinese_name || student.name,
      points: 1,
      reason: '',
    }]);
    setIsPickerOpen(false);
  };

  const updateAward = (index: number, updates: Partial<HousePointAward>) => {
    onChange(awards.map((a, i) => i === index ? { ...a, ...updates } : a));
  };

  const removeAward = (index: number) => {
    onChange(awards.filter((_, i) => i !== index));
  };

  const totalPoints = awards.reduce((sum, a) => sum + a.points, 0);
  const availableStudents = students.filter(s => !awards.some(a => a.student_id === s.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
          <Award size={16} />
          <span>House Point Awards</span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            disabled={availableStudents.length === 0}
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 disabled:opacity-40"
          >
            <Plus size={12} />
            Add Award
            {isPickerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {isPickerOpen && availableStudents.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
              {availableStudents.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addAward(s)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
                >
                  <span className="font-medium text-slate-700">{s.chinese_name || s.name}</span>
                  {s.chinese_name && <span className="text-xs text-slate-400">{s.name}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {awards.length > 0 && (
        <div className="space-y-2">
          {awards.map((award, i) => (
            <div key={award.student_id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-emerald-100">
              <span className="text-sm font-medium text-slate-700 min-w-[80px] truncate">{award.student_name}</span>
              <select
                value={award.points}
                onChange={e => updateAward(i, { points: Number(e.target.value) })}
                className="w-16 px-2 py-1 rounded border border-emerald-200 text-sm text-center focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                {Array.from({ length: 10 }, (_, n) => n + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <input
                type="text"
                value={award.reason}
                onChange={e => updateAward(i, { reason: e.target.value })}
                placeholder="Reason..."
                className="flex-1 px-2 py-1 rounded border border-emerald-200 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={() => removeAward(i)}
                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-1 text-xs text-emerald-600 font-medium">
            <span>{awards.length} student{awards.length !== 1 ? 's' : ''}</span>
            <span className="w-px h-3 bg-emerald-200" />
            <span>{totalPoints} total point{totalPoints !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

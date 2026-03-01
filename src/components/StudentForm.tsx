import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Student } from '../types';
import { cn } from '../lib/utils';
import { RichTextEditor } from './RichTextEditor';

interface StudentFormProps {
  student?: Student | null;
  onSave: (student: Omit<Student, 'id'> | Student) => void;
  onCancel: () => void;
}

export const StudentForm = ({ student, onSave, onCancel }: StudentFormProps) => {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    year_group: 'Year 7',
    class_name: '',
    is_tutor_group: false,
    house_points: 0,
    notes: '',
    weaknesses: [],
    status_records: [],
    requests: []
  });

  useEffect(() => {
    if (student) {
      const { id, ...rest } = student;
      setFormData(rest);
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (student) {
      onSave({ ...formData, id: student.id } as Student);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Student Full Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Year Group</label>
              <select 
                value={formData.year_group}
                onChange={e => setFormData({ ...formData, year_group: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                {['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Class Name</label>
              <input 
                required
                type="text" 
                value={formData.class_name}
                onChange={e => setFormData({ ...formData, class_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. 10-Math-A"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">House Points</label>
              <input 
                type="number" 
                value={formData.house_points}
                onChange={e => setFormData({ ...formData, house_points: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <input 
              type="checkbox" 
              id="is_tutor_group"
              checked={formData.is_tutor_group}
              onChange={e => setFormData({ ...formData, is_tutor_group: e.target.checked })}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_tutor_group" className="text-sm font-bold text-indigo-900 cursor-pointer">
              This student is in my Tutor Group
            </label>
          </div>

          <div className="space-y-2">
            <RichTextEditor 
              label="Notes"
              value={formData.notes}
              onChange={val => setFormData({ ...formData, notes: val })}
              placeholder="General notes about the student (supports Markdown and LaTeX)..."
            />
          </div>
        </form>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button 
            onClick={onCancel}
            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Save size={20} />
            Save Student
          </button>
        </div>
      </div>
    </div>
  );
};

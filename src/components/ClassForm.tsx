import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { ClassProfile, TeachingUnit } from '../types';

interface ClassFormProps {
  classProfile?: ClassProfile | null;
  teachingUnits: TeachingUnit[];
  onSave: (classProfile: Omit<ClassProfile, 'id'> | ClassProfile) => void;
  onCancel: () => void;
}

export const ClassForm = ({ classProfile, teachingUnits, onSave, onCancel }: ClassFormProps) => {
  const [formData, setFormData] = useState<Omit<ClassProfile, 'id'>>({
    name: '',
    year_group: 'Year 7',
    description: '',
    current_unit_id: '',
    student_ids: []
  });

  useEffect(() => {
    if (classProfile) {
      const { id, ...rest } = classProfile;
      setFormData(rest);
    }
  }, [classProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (classProfile) {
      onSave({ ...formData, id: classProfile.id } as ClassProfile);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900">
            {classProfile ? 'Edit Class' : 'Add New Class'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Class Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. 10-Math-A"
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
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Current Unit</label>
            <select 
              value={formData.current_unit_id}
              onChange={e => setFormData({ ...formData, current_unit_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select a Unit</option>
              {teachingUnits.filter(u => u.year_group === formData.year_group).map(u => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-24 resize-none"
              placeholder="Class description..."
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
            Save Class
          </button>
        </div>
      </div>
    </div>
  );
};

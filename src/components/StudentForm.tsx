import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Student } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { YEAR_GROUPS } from '../shared/constants';

interface StudentFormProps {
  student?: Student | null;
  onSave: (student: Omit<Student, 'id'> | Student) => void;
  onCancel: () => void;
}

export const StudentForm = ({ student, onSave, onCancel }: StudentFormProps) => {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    chinese_name: '',
    year_group: 'Year 7',
    class_name: '',
    tutor_group: '',
    house: '',
    tutor_1: '',
    tutor_2: '',
    parent_email: '',
    dfm_username: '',
    dfm_password: '',
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

  const set = (field: string, value: string | number | boolean) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all";

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
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">English Name</label>
              <input
                required type="text" value={formData.name}
                onChange={e => set('name', e.target.value)}
                className={inputClass} placeholder="e.g. John Smith"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chinese Name 中文名</label>
              <input
                type="text" value={formData.chinese_name || ''}
                onChange={e => set('chinese_name', e.target.value)}
                className={inputClass} placeholder="e.g. 张三"
              />
            </div>
          </div>

          {/* Class / Year / Tutor / House */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Year Group</label>
              <select
                value={formData.year_group}
                onChange={e => set('year_group', e.target.value)}
                className={inputClass}
              >
                {YEAR_GROUPS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Class 班级</label>
              <input
                required type="text" value={formData.class_name}
                onChange={e => set('class_name', e.target.value)}
                className={inputClass} placeholder="e.g. 7A"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tutor Group 导师组</label>
              <input
                type="text" value={formData.tutor_group || ''}
                onChange={e => set('tutor_group', e.target.value)}
                className={inputClass} placeholder="e.g. 7NZH"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">House 院舍</label>
              <input
                type="text" value={formData.house || ''}
                onChange={e => set('house', e.target.value)}
                className={inputClass} placeholder="e.g. Phoenix"
              />
            </div>
          </div>

          {/* Tutors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tutor 1 导师1</label>
              <input
                type="text" value={formData.tutor_1 || ''}
                onChange={e => set('tutor_1', e.target.value)}
                className={inputClass} placeholder="e.g. Mr. Zhang"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tutor 2 导师2</label>
              <input
                type="text" value={formData.tutor_2 || ''}
                onChange={e => set('tutor_2', e.target.value)}
                className={inputClass} placeholder="e.g. Ms. Li"
              />
            </div>
          </div>

          {/* Contact & Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Parent Email 家长邮箱</label>
              <input
                type="email" value={formData.parent_email || ''}
                onChange={e => set('parent_email', e.target.value)}
                className={inputClass} placeholder="parent@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">DFM Username</label>
              <input
                type="text" value={formData.dfm_username || ''}
                onChange={e => set('dfm_username', e.target.value)}
                className={inputClass} placeholder="DFM account"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">DFM Password</label>
              <input
                type="text" value={formData.dfm_password || ''}
                onChange={e => set('dfm_password', e.target.value)}
                className={inputClass} placeholder="DFM password"
              />
            </div>
          </div>

          {/* Tutor Group Checkbox + House Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <input
                type="checkbox" id="is_tutor_group"
                checked={formData.is_tutor_group}
                onChange={e => set('is_tutor_group', e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="is_tutor_group" className="text-sm font-bold text-indigo-900 cursor-pointer">
                My Tutor Group Student
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">House Points</label>
              <input
                type="number" value={formData.house_points}
                onChange={e => set('house_points', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <RichTextEditor
              label="Notes 备注"
              value={formData.notes}
              onChange={val => set('notes', val)}
              placeholder="General notes about the student..."
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

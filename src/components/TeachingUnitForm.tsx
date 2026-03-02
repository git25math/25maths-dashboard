import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { TeachingUnit, LessonPlanItem } from '../types';
import { cn } from '../lib/utils';
import { RichTextEditor } from './RichTextEditor';
import { YEAR_GROUPS } from '../shared/constants';

interface TeachingUnitFormProps {
  unit?: TeachingUnit | null;
  onSave: (unit: Omit<TeachingUnit, 'id'> | TeachingUnit) => void;
  onCancel: () => void;
}

export const TeachingUnitForm = ({ unit, onSave, onCancel }: TeachingUnitFormProps) => {
  const [formData, setFormData] = useState<Omit<TeachingUnit, 'id'>>({
    year_group: 'Year 7',
    title: '',
    learning_objectives: [''],
    lessons: [],
    typical_examples: [{ question: '', solution: '' }],
    core_vocabulary: [''],
    prep_material_template: '',
    ai_prompt_template: '',
    teaching_summary: ''
  });

  useEffect(() => {
    if (unit) {
      const { id, ...rest } = unit;
      setFormData(rest);
    }
  }, [unit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unit) {
      onSave({ ...formData, id: unit.id } as TeachingUnit);
    } else {
      onSave(formData);
    }
  };

  const addObjective = () => setFormData({ ...formData, learning_objectives: [...formData.learning_objectives, ''] });
  const updateObjective = (index: number, value: string) => {
    const newObjs = [...formData.learning_objectives];
    newObjs[index] = value;
    setFormData({ ...formData, learning_objectives: newObjs });
  };
  const removeObjective = (index: number) => setFormData({ ...formData, learning_objectives: formData.learning_objectives.filter((_, i) => i !== index) });

  const addExample = () => setFormData({ ...formData, typical_examples: [...formData.typical_examples, { question: '', solution: '' }] });
  const updateExample = (index: number, field: 'question' | 'solution', value: string) => {
    const newExs = [...formData.typical_examples];
    newExs[index] = { ...newExs[index], [field]: value };
    setFormData({ ...formData, typical_examples: newExs });
  };
  const removeExample = (index: number) => setFormData({ ...formData, typical_examples: formData.typical_examples.filter((_, i) => i !== index) });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {unit ? 'Edit Teaching Unit' : 'Add New Teaching Unit'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={24} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Year Group</label>
              <select 
                value={formData.year_group}
                onChange={e => setFormData({ ...formData, year_group: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:bg-slate-700 dark:text-slate-100"
              >
                {YEAR_GROUPS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Unit Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:bg-slate-700 dark:text-slate-100"
                placeholder="e.g. Quadratic Equations"
              />
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Learning Objectives</label>
              <button type="button" onClick={addObjective} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Objective
              </button>
            </div>
            <div className="space-y-2">
              {formData.learning_objectives.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    type="text" 
                    value={obj}
                    onChange={e => updateObjective(i, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm dark:bg-slate-700 dark:text-slate-100"
                    placeholder={`Objective ${i + 1}`}
                  />
                  <button type="button" onClick={() => removeObjective(i)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Typical Examples</label>
              <button type="button" onClick={addExample} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Example
              </button>
            </div>
            <div className="space-y-4">
              {formData.typical_examples.map((ex, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Example {i + 1}</span>
                    <button type="button" onClick={() => removeExample(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <RichTextEditor 
                    label="Question"
                    value={ex.question}
                    onChange={val => updateExample(i, 'question', val)}
                    placeholder="Question (supports LaTeX)..."
                  />
                  <RichTextEditor 
                    label="Solution"
                    value={ex.solution}
                    onChange={val => updateExample(i, 'solution', val)}
                    placeholder="Solution (supports LaTeX)..."
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">AI Prompt Template</label>
            <textarea 
              value={formData.ai_prompt_template}
              onChange={e => setFormData({ ...formData, ai_prompt_template: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:bg-slate-700 dark:text-slate-100 h-32 resize-none font-mono text-xs"
              placeholder="Prompt for AI generation..."
            />
          </div>
        </form>

        <div className="px-4 sm:px-8 py-6 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Save size={20} />
            Save Unit
          </button>
        </div>
      </div>
    </div>
  );
};

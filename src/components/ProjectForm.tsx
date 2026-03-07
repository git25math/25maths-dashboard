import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Project } from '../types';
import { cn } from '../lib/utils';
import { RichTextEditor } from './RichTextEditor';

interface ProjectFormProps {
  project: Project | null;
  onSave: (data: Omit<Project, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
];

const STATUS_OPTIONS: { value: Project['status']; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'paused', label: 'Paused', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'completed', label: 'Completed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

export const ProjectForm = ({ project, onSave, onCancel }: ProjectFormProps) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || PRESET_COLORS[0]);
  const [status, setStatus] = useState<Project['status']>(project?.status || 'active');
  const [url, setUrl] = useState(project?.url || '');
  const [repoUrl, setRepoUrl] = useState(project?.repo_url || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description || undefined,
      color,
      status,
      url: url || undefined,
      repo_url: repoUrl || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 overflow-y-auto flex-1">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Project name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              autoFocus
            />
          </div>

          <RichTextEditor
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="What is this project about? Supports Markdown and LaTeX..."
            editorHeightClass="h-28"
            previewMinHeightClass="min-h-[7rem]"
          />

          {/* Color picker */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Color</label>
            <div className="flex gap-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold border transition-all",
                    status === opt.value ? opt.color : "bg-white border-slate-200 text-slate-400"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Repo URL</label>
              <input
                type="url"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </form>

        <div className="px-4 sm:px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onCancel} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Save size={20} />
            {project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

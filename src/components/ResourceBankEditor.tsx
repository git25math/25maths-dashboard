import React, { memo } from 'react';
import { Library, Plus, Trash2 } from 'lucide-react';
import { PrepResource } from '../types';
import { PREP_RESOURCE_KIND_OPTIONS, RESOURCE_TEMPLATE_KINDS, emptyPrepResource, isPrepResourceFilled } from '../lib/prepResourceCatalog';

interface ResourceBankEditorProps {
  label: string;
  resources: PrepResource[];
  onChange: (resources: PrepResource[]) => void;
  emptyText: string;
  description?: string;
  templateKinds?: Array<NonNullable<PrepResource['kind']>>;
}

export const ResourceBankEditor = memo(function ResourceBankEditor({
  label,
  resources,
  onChange,
  emptyText,
  description,
  templateKinds = RESOURCE_TEMPLATE_KINDS,
}: ResourceBankEditorProps) {
  const addResource = (kind: NonNullable<PrepResource['kind']> = 'link') => {
    onChange([...(resources || []), emptyPrepResource(kind)]);
  };

  const updateResource = (index: number, field: keyof PrepResource, value: string) => {
    const next = [...resources];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const removeResource = (index: number) => {
    onChange(resources.filter((_, resourceIndex) => resourceIndex !== index));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Library size={16} className="text-emerald-500" />
            {label}
          </label>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        <button type="button" onClick={() => addResource('link')} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
          <Plus size={14} /> Add Resource
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {templateKinds.map(kind => {
          const option = PREP_RESOURCE_KIND_OPTIONS.find(item => item.value === kind);
          return (
            <button
              key={kind}
              type="button"
              onClick={() => addResource(kind)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              + {option?.label || kind}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {resources.map((resource, index) => (
          <div key={`${resource.kind || 'link'}-${index}`} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resource {index + 1}</span>
              <button type="button" onClick={() => removeResource(index)} className="p-1 text-red-400 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
            <input
              type="text"
              value={resource.title}
              onChange={e => updateResource(index, 'title', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              placeholder="Resource title"
            />
            <input
              type="url"
              value={resource.url}
              onChange={e => updateResource(index, 'url', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              placeholder="https://..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={resource.kind || 'link'}
                onChange={e => updateResource(index, 'kind', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              >
                {PREP_RESOURCE_KIND_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={resource.note || ''}
                onChange={e => updateResource(index, 'note', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                placeholder="How to use this resource"
              />
            </div>
          </div>
        ))}
        {resources.filter(isPrepResourceFilled).length === 0 && (
          <p className="text-xs text-slate-400 italic">{emptyText}</p>
        )}
      </div>
    </section>
  );
});

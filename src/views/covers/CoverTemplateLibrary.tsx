import { COVER_TEMPLATES, type CoverTemplate } from './types';

interface CoverTemplateLibraryProps {
  onSelect: (template: CoverTemplate) => void;
}

export function CoverTemplateLibrary({ onSelect }: CoverTemplateLibraryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {COVER_TEMPLATES.map(t => (
        <button
          key={t.type}
          type="button"
          onClick={() => onSelect(t)}
          aria-label={`${t.label} template (${t.width}x${t.height})`}
          className="group text-left rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition"
        >
          {/* Aspect ratio preview */}
          <div
            className="w-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-3 flex items-center justify-center text-slate-400 group-hover:from-indigo-50 group-hover:to-indigo-100 transition"
            style={{ aspectRatio: `${t.width} / ${t.height}` }}
          >
            <span className="text-xs font-mono">{t.width}x{t.height}</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">{t.label}</h3>
          <p className="text-xs text-slate-500 mt-1">{t.description}</p>
        </button>
      ))}
    </div>
  );
}

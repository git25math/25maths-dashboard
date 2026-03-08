import { useId, useState } from 'react';
import type { CoverParams } from './types';

interface CoverParamEditorProps {
  params: CoverParams;
  onChange: (updates: Partial<CoverParams>) => void;
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);

  // Keep draft in sync when value changes externally (e.g., undo/redo)
  if (draft !== value && HEX_RE.test(value)) {
    setDraft(value);
    setInvalid(false);
  }

  const commit = () => {
    if (HEX_RE.test(draft)) {
      onChange(draft);
      setInvalid(false);
    } else {
      setInvalid(true);
      setDraft(value); // reset to last valid
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">{label} color picker</label>
      <input
        id={id}
        type="color"
        value={HEX_RE.test(draft) ? draft : value}
        onChange={e => { setDraft(e.target.value); onChange(e.target.value); setInvalid(false); }}
        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
      />
      <div className="flex-1">
        <label htmlFor={`${id}-text`} className="text-xs font-medium text-slate-500">{label}</label>
        <input
          id={`${id}-text`}
          type="text"
          value={draft}
          onChange={e => { setDraft(e.target.value); setInvalid(false); }}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); }}
          className={`block w-full text-xs font-mono rounded border px-2 py-1 mt-0.5 ${
            invalid ? 'border-red-400 bg-red-50' : 'border-slate-300'
          }`}
          aria-label={`${label} hex value`}
          aria-invalid={invalid}
        />
        {invalid && <p className="text-xs text-red-500 mt-0.5">Must be #RRGGBB</p>}
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <label htmlFor={id} className="text-sm text-slate-600 cursor-pointer">{label}</label>
    </div>
  );
}

export function CoverParamEditor({ params, onChange }: CoverParamEditorProps) {
  return (
    <div className="space-y-6">
      {/* Colors */}
      <fieldset>
        <legend className="text-sm font-bold text-slate-700 mb-3">Colors</legend>
        <div className="space-y-3">
          <ColorInput label="Gradient Start" value={params.primaryGradientStart} onChange={v => onChange({ primaryGradientStart: v })} />
          <ColorInput label="Gradient End" value={params.primaryGradientEnd} onChange={v => onChange({ primaryGradientEnd: v })} />
          <ColorInput label="Accent" value={params.accentColor} onChange={v => onChange({ accentColor: v })} />
          <ColorInput label="Text" value={params.textColor} onChange={v => onChange({ textColor: v })} />
        </div>
      </fieldset>

      {/* Text */}
      <fieldset>
        <legend className="text-sm font-bold text-slate-700 mb-3">Text</legend>
        <div className="space-y-3">
          <TextInput label="Brand Title" value={params.titleEn} onChange={v => onChange({ titleEn: v })} />
          <TextInput label="Chinese Title" value={params.titleZh} onChange={v => onChange({ titleZh: v })} placeholder="Optional" />
          <TextInput label="Main Title" value={params.subtitle} onChange={v => onChange({ subtitle: v })} />
          <TextInput label="Badge Text" value={params.badgeText} onChange={v => onChange({ badgeText: v })} />
          <TextInput label="Board" value={params.boardBadge} onChange={v => onChange({ boardBadge: v })} />
          <TextInput label="Track" value={params.trackBadge} onChange={v => onChange({ trackBadge: v })} />
        </div>
      </fieldset>

      {/* Decorations */}
      <fieldset>
        <legend className="text-sm font-bold text-slate-700 mb-3">Decorations</legend>
        <div className="space-y-2">
          <Toggle label="Decorative circles" checked={params.showDecoCircles} onChange={v => onChange({ showDecoCircles: v })} />
          <Toggle label="Wavy shape" checked={params.showWavyShape} onChange={v => onChange({ showWavyShape: v })} />
          <Toggle label="Math formula" checked={params.showMathFormula} onChange={v => onChange({ showMathFormula: v })} />
          {params.showMathFormula && (
            <TextInput label="Formula text" value={params.mathFormula} onChange={v => onChange({ mathFormula: v })} />
          )}
        </div>
      </fieldset>
    </div>
  );
}

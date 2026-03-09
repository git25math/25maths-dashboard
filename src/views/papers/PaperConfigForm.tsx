import { useId } from 'react';
import { BOARD_OPTIONS, TIER_OPTIONS, type PaperBoard, type PaperConfig, type PaperFocus, type PaperTier } from './types';

interface PaperConfigFormProps {
  config: Omit<PaperConfig, 'id' | 'createdAt' | 'updatedAt' | 'questionIds'>;
  onChange: (updates: Partial<PaperConfig>) => void;
  sections?: { chapter: string; sections: string[] }[];
}

export function PaperConfigForm({ config, onChange, sections }: PaperConfigFormProps) {
  const tiers = TIER_OPTIONS[config.board];
  const baseId = useId();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Board */}
        <div>
          <label htmlFor={`${baseId}-board`} className="block text-sm font-medium text-slate-700 mb-1">Exam Board</label>
          <select
            id={`${baseId}-board`}
            value={config.board}
            onChange={e => {
              const board = e.target.value as PaperBoard;
              const tier = board === 'cie' ? 'extended' : 'higher';
              onChange({ board, tier });
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {BOARD_OPTIONS.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* Tier */}
        <div>
          <label htmlFor={`${baseId}-tier`} className="block text-sm font-medium text-slate-700 mb-1">Tier</label>
          <select
            id={`${baseId}-tier`}
            value={config.tier}
            onChange={e => onChange({ tier: e.target.value as PaperTier })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {tiers.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor={`${baseId}-title`} className="block text-sm font-medium text-slate-700 mb-1">Paper Title</label>
        <input
          id={`${baseId}-title`}
          type="text"
          value={config.title}
          onChange={e => onChange({ title: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Target Marks */}
        <div>
          <label htmlFor={`${baseId}-marks`} className="block text-sm font-medium text-slate-700 mb-1">Target Marks</label>
          <input
            id={`${baseId}-marks`}
            type="number"
            value={config.targetMarks}
            onChange={e => {
              const v = Number(e.target.value);
              if (v >= 0 && v <= 200) onChange({ targetMarks: v });
            }}
            min={10}
            max={200}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Time */}
        <div>
          <label htmlFor={`${baseId}-time`} className="block text-sm font-medium text-slate-700 mb-1">Time (min)</label>
          <input
            id={`${baseId}-time`}
            type="number"
            value={config.timeMinutes}
            onChange={e => {
              const v = Number(e.target.value);
              if (v >= 0 && v <= 300) onChange({ timeMinutes: v });
            }}
            min={10}
            max={300}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Paper Number */}
        <div>
          <label htmlFor={`${baseId}-paperno`} className="block text-sm font-medium text-slate-700 mb-1">Paper No.</label>
          <input
            id={`${baseId}-paperno`}
            type="text"
            value={config.paperNumber}
            onChange={e => onChange({ paperNumber: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Exam Session */}
        <div>
          <label htmlFor={`${baseId}-session`} className="block text-sm font-medium text-slate-700 mb-1">Session</label>
          <input
            id={`${baseId}-session`}
            type="text"
            value={config.examSession}
            onChange={e => onChange({ examSession: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Year */}
        <div>
          <label htmlFor={`${baseId}-year`} className="block text-sm font-medium text-slate-700 mb-1">Year</label>
          <input
            id={`${baseId}-year`}
            type="text"
            value={config.examYear}
            onChange={e => onChange({ examYear: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Focus */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Auto-fill Focus</label>
        <div className="flex gap-2">
          {(['balanced', 'topic'] as PaperFocus[]).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => onChange({ focus: f })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                config.focus === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'balanced' ? 'Balanced' : 'Topic Focus'}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Sections */}
      {config.focus === 'topic' && sections && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Focus Sections</label>
          <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-3">
            {sections.map(ch => (
              <div key={ch.chapter}>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Chapter {ch.chapter}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {ch.sections.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const current = config.focusSections || [];
                        const next = current.includes(s)
                          ? current.filter(x => x !== s)
                          : [...current, s];
                        onChange({ focusSections: next });
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                        (config.focusSections || []).includes(s)
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

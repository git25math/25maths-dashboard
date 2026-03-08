import { useState, useCallback } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { CoverParams, CoverTemplateType } from './types';
import { geminiService } from '../../services/geminiService';

interface CoverAiSuggestionsProps {
  templateType: CoverTemplateType;
  currentParams: CoverParams;
  onApply: (updates: Partial<CoverParams>) => void;
}

interface ColorScheme {
  name: string;
  params: Partial<CoverParams>;
}

export function CoverAiSuggestions({ templateType, currentParams, onApply }: CoverAiSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<ColorScheme[]>([]);
  const [error, setError] = useState('');

  const handleSuggest = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await geminiService.suggestCoverScheme(templateType, currentParams.subtitle, currentParams.boardBadge);
      setSchemes(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  }, [templateType, currentParams.subtitle, currentParams.boardBadge]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">AI Color Schemes</h4>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={loading}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {loading ? 'Generating...' : 'Suggest'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-red-600 flex-1">{error}</p>
          <button
            type="button"
            onClick={handleSuggest}
            className="text-xs text-indigo-600 hover:text-indigo-700 underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {schemes.map((scheme) => (
        <button
          key={scheme.name}
          type="button"
          onClick={() => onApply(scheme.params)}
          className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-300 transition"
        >
          <p className="text-sm font-medium text-slate-700 mb-2">{scheme.name}</p>
          <div className="flex gap-1">
            {[
              scheme.params.primaryGradientStart,
              scheme.params.primaryGradientEnd,
              scheme.params.accentColor,
              scheme.params.textColor,
            ].filter(Boolean).map((c) => (
              <div key={c} className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

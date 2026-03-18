import { useRef, useCallback, useState, useEffect } from 'react';
import { Download, Image, ArrowLeft, Check, Loader2 } from 'lucide-react';
import type { CoverParams, CoverTemplate } from './types';
import { CoverSvgRenderer } from './CoverSvgRenderer';
import { CoverParamEditor } from './CoverParamEditor';
import { exportSvg, exportPng } from './utils/exportCover';

interface CoverEditorViewProps {
  template: CoverTemplate;
  params: CoverParams;
  onChange: (updates: Partial<CoverParams>) => void;
  onBack: () => void;
  onSave: () => void;
}

export function CoverEditorView({ template, params, onChange, onBack, onSave }: CoverEditorViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const exportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (exportTimerRef.current) clearTimeout(exportTimerRef.current); }, []);

  const showExportFeedback = useCallback((msg: string) => {
    setExportStatus(msg);
    if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
    exportTimerRef.current = setTimeout(() => setExportStatus(null), 2000);
  }, []);

  const handleExportSvg = useCallback(() => {
    if (!svgRef.current) return;
    try {
      const filename = `cover-${template.type}-${Date.now()}`;
      exportSvg(svgRef.current, filename);
      showExportFeedback('SVG exported');
    } catch (err) {
      showExportFeedback(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [template.type, showExportFeedback]);

  const handleExportPng = useCallback(async (scale: number) => {
    if (!svgRef.current || exporting) return;
    setExporting(true);
    try {
      const filename = `cover-${template.type}-${scale}x-${Date.now()}`;
      await exportPng(svgRef.current, filename, scale);
      showExportFeedback(`PNG ${scale}x exported`);
    } catch (err) {
      showExportFeedback(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  }, [template.type, showExportFeedback, exporting]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Back to library">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{template.label}</h3>
            <p className="text-xs text-slate-500">{template.width} x {template.height}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {exportStatus && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check size={12} /> {exportStatus}
            </span>
          )}
          <button
            type="button"
            onClick={handleExportSvg}
            disabled={exporting}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
          >
            <Download size={14} /> SVG
          </button>
          <button
            type="button"
            onClick={() => handleExportPng(1)}
            disabled={exporting}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
          >
            <Image size={14} /> 1x
          </button>
          <button
            type="button"
            onClick={() => handleExportPng(2)}
            disabled={exporting}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium disabled:opacity-50"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />} 2x
          </button>
          <button
            type="button"
            onClick={() => handleExportPng(3)}
            disabled={exporting}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
          >
            <Image size={14} /> 3x
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-1.5 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor layout */}
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Preview */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <CoverSvgRenderer template={template} params={params} svgRef={svgRef} />
          </div>
        </div>

        {/* Param editor */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 max-h-[75vh] overflow-y-auto">
            <CoverParamEditor params={params} onChange={onChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

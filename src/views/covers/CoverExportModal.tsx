import { useState } from 'react';
import { X, Download, Image, FileType, AlertCircle } from 'lucide-react';
import { exportSvg, exportPng } from './utils/exportCover';

interface CoverExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgElement: SVGSVGElement | null;
  templateType: string;
}

export function CoverExportModal({ isOpen, onClose, svgElement, templateType }: CoverExportModalProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !svgElement) return null;

  const handleExport = async (format: 'svg' | 'png', scale = 2) => {
    setExporting(true);
    setError('');
    const filename = `cover-${templateType}-${Date.now()}`;
    try {
      if (format === 'svg') {
        exportSvg(svgElement, filename);
      } else {
        await exportPng(svgElement, `${filename}-${scale}x`, scale);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 id="export-modal-title" className="text-lg font-bold text-slate-900">Export Cover</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <button
            type="button"
            onClick={() => handleExport('svg')}
            disabled={exporting}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left disabled:opacity-50"
          >
            <FileType size={24} className="text-indigo-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">SVG</p>
              <p className="text-xs text-slate-500">Vector format, infinite scaling</p>
            </div>
          </button>
          {[1, 2, 3].map(scale => (
            <button
              key={scale}
              type="button"
              onClick={() => handleExport('png', scale)}
              disabled={exporting}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left disabled:opacity-50"
            >
              <Image size={24} className="text-indigo-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">PNG {scale}x</p>
                <p className="text-xs text-slate-500">Raster image at {scale}x resolution</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X, FileText, Copy, Check, Save } from 'lucide-react';
import { MarkdownRenderer } from './RichTextEditor';

interface ActionPlanModalProps {
  markdown: string;
  meetingTitle: string;
  title?: string;
  onSaveAsSOP?: (data: { title: string; category: string; content: string }) => void;
  onClose: () => void;
}

export const ActionPlanModal = ({ markdown, meetingTitle, title = 'Action Plan', onSaveAsSOP, onClose }: ActionPlanModalProps) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsSOP = () => {
    if (!onSaveAsSOP) return;
    onSaveAsSOP({
      title: `Action Plan: ${meetingTitle}`,
      category: 'meeting',
      content: markdown,
    });
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-8 py-6 border-b border-teal-100 flex justify-between items-center bg-teal-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-teal-500 font-medium">{meetingTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-teal-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <MarkdownRenderer content={markdown} className="prose prose-sm max-w-none" />
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-8 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
            Close
          </button>
          <button
            onClick={handleCopy}
            className="px-6 py-2 border border-teal-200 text-teal-600 font-bold rounded-xl hover:bg-teal-50 transition-all flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          {onSaveAsSOP && (
            <button
              onClick={handleSaveAsSOP}
              disabled={saved}
              className={`px-6 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${
                saved
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700'
              }`}
            >
              <Save size={16} />
              {saved ? 'Saved as SOP' : 'Save as SOP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

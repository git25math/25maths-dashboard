import { useState } from 'react';
import { Zap } from 'lucide-react';

interface QuickCaptureProps {
  projectId: string;
  onCapture: (title: string, content: string) => void;
}

export function ChronicleQuickCapture({ projectId, onCapture }: QuickCaptureProps) {
  const [text, setText] = useState('');

  const handleCapture = () => {
    if (!text.trim()) return;
    const lines = text.trim().split('\n');
    const title = lines[0].slice(0, 80);
    const content = lines.length > 1 ? text.trim() : '';
    onCapture(title, content); // status defaults to 'draft' in handler
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCapture();
    }
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={14} className="text-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Capture</span>
      </div>
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Record a thought, paste AI output, note a decision... (Cmd+Enter to save)"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
          rows={2}
        />
        <button
          onClick={handleCapture}
          disabled={!text.trim()}
          className="btn-primary text-sm self-end disabled:opacity-50"
        >
          Capture
        </button>
      </div>
    </div>
  );
}

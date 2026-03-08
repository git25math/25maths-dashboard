import { Copy, ExternalLink } from 'lucide-react';

interface LinkRowProps {
  label: string;
  url?: string;
  onCopy: (value: string, label: string) => void;
  linkColor?: string;
}

export function LinkRow({ label, url, onCopy, linkColor = 'text-indigo-500 hover:text-indigo-700' }: LinkRowProps) {
  if (!url) {
    return (
      <div className="flex items-center justify-between py-2 text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">-</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 py-2 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <a href={url} target="_blank" rel="noreferrer" className={`transition ${linkColor}`}>
          <ExternalLink size={14} />
        </a>
        <button type="button" onClick={() => onCopy(url, label)} className="text-slate-400 transition hover:text-slate-700">
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

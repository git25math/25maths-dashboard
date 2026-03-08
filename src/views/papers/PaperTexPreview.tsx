import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Download, Play, Loader2, Check, FileDown } from 'lucide-react';
import { localAgentService } from '../../services/localAgentService';

interface PaperTexPreviewProps {
  texSource: string;
  onTexChange: (tex: string) => void;
  paperId: string;
}

const AGENT_BASE_URL = 'http://127.0.0.1:4318';

export function PaperTexPreview({ texSource, onTexChange, paperId }: PaperTexPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState('');
  const [compileStatus, setCompileStatus] = useState<'idle' | 'compiling' | 'done' | 'error'>('idle');
  const [compileResult, setCompileResult] = useState<Record<string, unknown> | null>(null);
  const [compileError, setCompileError] = useState('');
  const [copied, setCopied] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const cancelRef = useRef(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount: cancel polling, timers
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const showCopied = () => {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    };
    try {
      await navigator.clipboard.writeText(texSource);
      showCopied();
    } catch {
      // Fallback: textarea select (works without clipboard permission)
      const ta = document.createElement('textarea');
      ta.value = texSource;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showCopied(); } catch { /* silent */ }
      document.body.removeChild(ta);
    }
  }, [texSource]);

  const handleDownloadTex = useCallback(() => {
    const blob = new Blob([texSource], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paper-${paperId}.tex`;
    document.body.appendChild(a);
    try { a.click(); } finally {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [texSource, paperId]);

  const handleCompile = useCallback(async () => {
    cancelRef.current = false;
    setCompileStatus('compiling');
    setCompileError('');
    setCompileResult(null);
    setElapsedSec(0);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000);
    try {
      const job = await localAgentService.startPaperGenerate(AGENT_BASE_URL, {
        id: paperId,
        texSource,
      });

      // Poll with exponential backoff, respecting unmount cancellation
      let delay = 1500;
      let elapsed = 0;
      const maxWait = 120000; // 2 minutes
      while (elapsed < maxWait && !cancelRef.current) {
        await new Promise(r => setTimeout(r, delay));
        elapsed += delay;
        if (cancelRef.current) return;

        const status = await localAgentService.getJob(AGENT_BASE_URL, job.id);
        if (status.status === 'completed') {
          if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
          setCompileStatus('done');
          setCompileResult(status.result ?? null);
          return;
        }
        if (status.status === 'failed') {
          if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
          setCompileStatus('error');
          setCompileError(status.error || 'Compilation failed');
          return;
        }
        delay = Math.min(delay * 1.3, 5000); // backoff up to 5s
      }
      if (!cancelRef.current) {
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        setCompileStatus('error');
        setCompileError('Compilation timed out after 2 minutes');
      }
    } catch (err) {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (!cancelRef.current) {
        setCompileStatus('error');
        setCompileError(err instanceof Error ? err.message : 'Failed to connect to local agent. Is it running?');
      }
    }
  }, [texSource, paperId]);

  const handleDownloadPdf = useCallback(() => {
    if (!compileResult?.pdf_path) return;
    const url = localAgentService.getFileUrl(AGENT_BASE_URL, compileResult.pdf_path as string, true);
    window.open(url, '_blank');
  }, [compileResult]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              onTexChange(editBuffer);
              setIsEditing(false);
            } else {
              setEditBuffer(texSource);
              setIsEditing(true);
            }
          }}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
        >
          {isEditing ? 'Save Edits' : 'Edit Source'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={handleDownloadTex}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          title="Download .tex file"
        >
          <FileDown size={14} /> .tex
        </button>
        <button
          type="button"
          onClick={handleCompile}
          disabled={compileStatus === 'compiling'}
          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {compileStatus === 'compiling' ? (
            <><Loader2 size={14} className="animate-spin" /> Compiling… {elapsedSec}s</>
          ) : (
            <><Play size={14} /> Compile PDF</>
          )}
        </button>
        {compileStatus === 'done' && compileResult?.pdf_path && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition"
          >
            <Download size={14} /> Download PDF
          </button>
        )}
      </div>

      {/* Status */}
      {compileStatus === 'error' && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{compileError}</div>
      )}
      {compileStatus === 'done' && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          Compilation successful. {compileResult?.pages && `${compileResult.pages} page(s).`}
        </div>
      )}

      {/* Source preview */}
      {isEditing ? (
        <textarea
          value={editBuffer}
          onChange={e => setEditBuffer(e.target.value)}
          className="w-full h-[60vh] font-mono text-xs p-4 rounded-xl border border-slate-300 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          spellCheck={false}
          aria-label="LaTeX source editor"
        />
      ) : (
        <pre className="w-full h-[60vh] overflow-auto font-mono text-xs p-4 rounded-xl border border-slate-200 bg-slate-50 whitespace-pre-wrap">
          {texSource}
        </pre>
      )}
    </div>
  );
}

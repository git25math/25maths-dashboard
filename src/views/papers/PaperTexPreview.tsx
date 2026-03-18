import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Copy, Download, Play, Loader2, Check, FileDown, Info, Eye, Code, Maximize2, Minimize2, Upload, Printer, RotateCcw } from 'lucide-react';
import { localAgentService } from '../../services/localAgentService';
import { PdfPageViewer } from '../../components/PdfPageViewer';

interface PaperTexPreviewProps {
  texSource: string;
  onTexChange: (tex: string) => void;
  paperId: string;
  board?: 'cie' | 'edx';
}

const AGENT_BASE_URL = 'http://127.0.0.1:4318';

export function PaperTexPreview({ texSource, onTexChange, paperId, board = 'cie' }: PaperTexPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState('');
  const [compileStatus, setCompileStatus] = useState<'idle' | 'compiling' | 'done' | 'error'>('idle');
  const [compileResult, setCompileResult] = useState<Record<string, unknown> | null>(null);
  const [compileError, setCompileError] = useState('');
  const [copied, setCopied] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  /** 'source' = show .tex code, 'pdf' = show rendered PDF */
  const [viewMode, setViewMode] = useState<'source' | 'pdf'>('source');
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  /** Blob URL for user-uploaded PDF */
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const cancelRef = useRef(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedPdfUrlRef = useRef('');

  const compileInstructions = useMemo(() => {
    if (board === 'cie') {
      return {
        placement: 'CIE/IGCSE_v2/TopicalQuestions/<Topic>/',
        texinputs: 'TEXINPUTS=".:$CIE_ROOT//:$NZH_ROOT//:"',
        envHint: 'CIE_ROOT = path to CIE/IGCSE_v2, NZH_ROOT = path to NZH-MathPrep-Template',
        project: '25Maths (CIE)',
      };
    }
    return {
      placement: 'Edexcel/IGCSE_v2/TopicalQuestions/<PaperTier>/<Topic>/',
      texinputs: 'TEXINPUTS=".:$EDX_ROOT//:$NZH_ROOT//:"',
      envHint: 'EDX_ROOT = path to Edexcel/IGCSE_v2, NZH_ROOT = path to NZH-MathPrep-Template',
      project: '25Maths-4MA1 (Edexcel)',
    };
  }, [board]);

  // Cleanup on unmount: cancel polling, timers, revoke blob URLs
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (uploadedPdfUrlRef.current) URL.revokeObjectURL(uploadedPdfUrlRef.current);
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

  // Keep ref in sync for unmount cleanup
  useEffect(() => { uploadedPdfUrlRef.current = uploadedPdfUrl; }, [uploadedPdfUrl]);

  /** Handle user uploading a locally-compiled PDF */
  const handleUploadPdf = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('Please select a PDF file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploadError('');
    // Revoke previous blob URL to prevent memory leak
    if (uploadedPdfUrl) URL.revokeObjectURL(uploadedPdfUrl);
    const blobUrl = URL.createObjectURL(file);
    setUploadedPdfUrl(blobUrl);
    setUploadedFileName(file.name);
    setViewMode('pdf');
    // Reset file input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadedPdfUrl]);

  /** Remove uploaded PDF and revoke blob URL */
  const handleClearUpload = useCallback(() => {
    if (uploadedPdfUrl) URL.revokeObjectURL(uploadedPdfUrl);
    setUploadedPdfUrl('');
    setUploadedFileName('');
  }, [uploadedPdfUrl]);

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
      let delay = 500;
      let elapsed = 0;
      const maxWait = 120000; // 2 minutes
      while (elapsed < maxWait && !cancelRef.current) {
        await new Promise(r => setTimeout(r, delay));
        elapsed += delay;
        if (cancelRef.current) return;

        const status = await localAgentService.getJob(AGENT_BASE_URL, job.id);
        if (cancelRef.current) return;
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

  // Agent-compiled PDF URL
  const agentPdfUrl = useMemo(() => {
    if (!compileResult?.pdf_path) return '';
    return localAgentService.getFileUrl(AGENT_BASE_URL, compileResult.pdf_path as string, false);
  }, [compileResult]);

  // Unified PDF URL: prefer agent-compiled, fall back to uploaded
  const pdfViewUrl = agentPdfUrl || uploadedPdfUrl;
  const pdfSource: 'agent' | 'upload' | 'none' = agentPdfUrl ? 'agent' : uploadedPdfUrl ? 'upload' : 'none';

  const handleDownloadPdf = useCallback(() => {
    if (agentPdfUrl && compileResult?.pdf_path) {
      const url = localAgentService.getFileUrl(AGENT_BASE_URL, compileResult.pdf_path as string, true);
      window.open(url, '_blank');
    } else if (uploadedPdfUrl) {
      const a = document.createElement('a');
      a.href = uploadedPdfUrl;
      a.download = uploadedFileName || `paper-${paperId}.pdf`;
      document.body.appendChild(a);
      try { a.click(); } finally { document.body.removeChild(a); }
    }
  }, [agentPdfUrl, compileResult, uploadedPdfUrl, uploadedFileName, paperId]);

  const handlePrintPdf = useCallback(() => {
    window.open(pdfViewUrl, '_blank');
  }, [pdfViewUrl]);

  // Auto-switch to PDF view after successful compile
  useEffect(() => {
    if (compileStatus === 'done' && agentPdfUrl) {
      setViewMode('pdf');
    }
  }, [compileStatus, agentPdfUrl]);

  // Esc key exits fullscreen
  useEffect(() => {
    if (!pdfFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPdfFullscreen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [pdfFullscreen]);

  return (
    <div className={pdfFullscreen ? 'fixed inset-0 z-50 bg-white flex flex-col p-4' : 'space-y-4'}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View mode toggle */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => { setViewMode('source'); setPdfFullscreen(false); }}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition ${
              viewMode === 'source' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Code size={14} /> Source
          </button>
          <button
            type="button"
            onClick={() => setViewMode('pdf')}
            disabled={!pdfViewUrl}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition ${
              viewMode === 'pdf' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={pdfViewUrl ? 'View compiled PDF' : 'Compile first to preview PDF'}
          >
            <Eye size={14} /> PDF
          </button>
        </div>

        {/* Source actions — only in source mode */}
        {viewMode === 'source' && (
          <>
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
          </>
        )}

        {/* PDF actions — only in PDF mode */}
        {viewMode === 'pdf' && pdfViewUrl && (
          <>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition"
            >
              <Download size={14} /> Download
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              title="Print PDF"
            >
              <Printer size={14} /> Print
            </button>
            <button
              type="button"
              onClick={() => setPdfFullscreen(f => !f)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              title={pdfFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
            >
              {pdfFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {pdfFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
            {pdfSource === 'upload' && (
              <button
                type="button"
                onClick={handleClearUpload}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition"
                title="Remove uploaded PDF"
              >
                <RotateCcw size={14} /> Clear
              </button>
            )}
          </>
        )}

        {/* Upload PDF — always visible */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleUploadPdf}
          className="hidden"
          aria-label="Upload PDF file"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
          title="Upload a locally compiled PDF for preview"
        >
          <Upload size={14} /> Upload PDF
        </button>

        {/* Compile button — always visible */}
        <button
          type="button"
          onClick={handleCompile}
          disabled={compileStatus === 'compiling'}
          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {compileStatus === 'compiling' ? (
            <><Loader2 size={14} className="animate-spin" /> Compiling... {elapsedSec}s</>
          ) : (
            <><Play size={14} /> {agentPdfUrl ? 'Re-compile' : 'Compile PDF'}</>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 transition ml-auto"
        >
          <Info size={14} /> Guide
        </button>
      </div>

      {/* Compilation instructions */}
      {showInstructions && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 space-y-2">
          <p className="font-semibold">How to compile locally:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Download the .tex file using the button above</li>
            <li>Place it in your project: <code className="bg-amber-100 px-1 rounded">{compileInstructions.placement}</code></li>
            <li>Open terminal and run:
              <pre className="mt-1 p-2 bg-amber-100 rounded text-xs overflow-x-auto">{compileInstructions.texinputs} xelatex -interaction=nonstopmode paper.tex</pre>
            </li>
            <li>Run XeLaTeX twice for correct page references</li>
          </ol>
          <p className="text-xs text-amber-600 mt-1">
            Environment: <code className="bg-amber-100 px-1 rounded">{compileInstructions.envHint}</code>
          </p>
          <p className="text-xs text-amber-600">
            This .tex file uses <code>\examquestion</code> references to load questions from PastPapers.
            It requires the {compileInstructions.project} project tree with PastPapers directory.
          </p>
        </div>
      )}

      {/* Status */}
      {compileStatus === 'error' && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{compileError}</div>
      )}
      {uploadError && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{uploadError}</div>
      )}
      {compileStatus === 'done' && viewMode === 'source' && agentPdfUrl && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          <Check size={14} />
          Compilation successful. {compileResult?.pages && `${compileResult.pages} page(s).`}
          <button
            type="button"
            onClick={() => setViewMode('pdf')}
            className="ml-auto text-xs font-medium text-green-700 underline hover:text-green-800"
          >
            View PDF
          </button>
        </div>
      )}

      {/* Content area */}
      <div className={pdfFullscreen ? 'flex-1 min-h-0' : ''}>
        {/* Source view */}
        {viewMode === 'source' && (
          isEditing ? (
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
          )
        )}

        {/* PDF view — rendered with PDF.js */}
        {viewMode === 'pdf' && (
          pdfViewUrl ? (
            <div className="relative">
              {/* Source badge */}
              <div className="absolute top-2 right-2 z-10">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  pdfSource === 'agent'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {pdfSource === 'agent' ? 'Compiled' : uploadedFileName || 'Uploaded'}
                </span>
              </div>
              <PdfPageViewer
                src={pdfViewUrl}
                height={pdfFullscreen ? 'calc(100vh - 120px)' : '70vh'}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <Eye size={48} className="mb-4 opacity-30" />
              <p className="text-sm font-medium">No PDF available yet</p>
              <p className="text-xs mt-2 text-slate-400 max-w-sm text-center">
                Use "Compile PDF" with the local agent, or upload a locally compiled PDF.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                <Upload size={16} /> Upload PDF
              </button>
            </div>
          )
        )}
      </div>

      {/* Fullscreen escape hint */}
      {pdfFullscreen && (
        <div className="text-center text-xs text-slate-400 py-1">
          Press <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-500">Esc</kbd> or click "Exit" to return
        </div>
      )}
    </div>
  );
}

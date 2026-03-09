import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker from pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

interface PdfPageViewerProps {
  /** URL to the PDF file (blob: URL, agent URL, or remote URL) */
  src: string;
  /** Initial page number (1-based) */
  initialPage?: number;
  /** Fixed height for the viewer container */
  height?: string;
  /** Whether to show page navigation controls */
  showNav?: boolean;
  /** Whether to show zoom controls */
  showZoom?: boolean;
  /** CSS class for the outer container */
  className?: string;
  /** Render at this device pixel ratio (default: window.devicePixelRatio) */
  scale?: number;
  /** Compact mode: smaller controls, less padding */
  compact?: boolean;
}

// Cache loaded PDF documents to avoid re-fetching
const pdfDocCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

export const PdfPageViewer = memo(function PdfPageViewer({
  src,
  initialPage = 1,
  height = '500px',
  showNav = true,
  showZoom = true,
  className = '',
  scale: scaleProp,
  compact = false,
}: PdfPageViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<ReturnType<pdfjsLib.PDFPageProxy['render']> | null>(null);

  // Cancel render task on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* ignore */ }
      }
    };
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    setLoading(true);
    setError('');

    const loadPdf = async () => {
      try {
        // Check cache first
        const cached = pdfDocCache.get(src);
        if (cached) {
          if (!cancelled) {
            setPdfDoc(cached);
            setTotalPages(cached.numPages);
            setLoading(false);
          }
          return;
        }

        const doc = await pdfjsLib.getDocument({ url: src, cMapUrl: undefined }).promise;
        // Cap cache at 10 documents
        if (pdfDocCache.size >= 10) {
          const firstKey = pdfDocCache.keys().next().value;
          if (firstKey) pdfDocCache.delete(firstKey);
        }
        pdfDocCache.set(src, doc);

        if (!cancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
          setLoading(false);
        }
      }
    };

    loadPdf();
    return () => { cancelled = true; };
  }, [src]);

  // Reset page when src changes
  useEffect(() => {
    setPageNum(initialPage);
  }, [src, initialPage]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    const page = Math.max(1, Math.min(pageNum, pdfDoc.numPages));
    let cancelled = false;

    const renderPage = async () => {
      // Cancel any in-progress render
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* ignore */ }
        renderTaskRef.current = null;
      }

      try {
        const pdfPage = await pdfDoc.getPage(page);
        if (cancelled) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const dpr = scaleProp ?? window.devicePixelRatio ?? 1;
        const containerWidth = container.clientWidth;

        // Scale viewport to fit container width, then apply zoom
        const unscaledViewport = pdfPage.getViewport({ scale: 1 });
        const baseScale = containerWidth / unscaledViewport.width;
        const viewport = pdfPage.getViewport({ scale: baseScale * zoom });

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const renderTask = pdfPage.render({
          canvas,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err) {
        // RenderingCancelledException is expected when rapidly changing pages
        if (err instanceof Error && err.name !== 'RenderingCancelledException') {
          console.warn('PDF render error:', err);
        }
      }
    };

    renderPage();
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, zoom, scaleProp]);

  // Keyboard navigation: left/right arrows for pages, +/- for zoom
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only handle when no input/textarea is focused
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft') setPageNum(p => Math.max(1, p - 1));
      else if (e.key === 'ArrowRight') setPageNum(p => Math.min(p + 1, totalPages));
      else if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 3));
      else if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.5));
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [totalPages]);

  const goPage = useCallback((delta: number) => {
    setPageNum(p => Math.max(1, Math.min(p + delta, totalPages)));
  }, [totalPages]);

  const adjustZoom = useCallback((delta: number) => {
    setZoom(z => Math.max(0.5, Math.min(z + delta, 3)));
  }, []);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 text-red-500 bg-red-50 rounded-lg p-4 ${className}`} style={{ height }}>
        <AlertCircle size={24} />
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center gap-2 text-slate-400 bg-slate-50 rounded-lg ${className}`} style={{ height }}>
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading PDF...</span>
      </div>
    );
  }

  const btnCls = compact
    ? 'p-0.5 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed'
    : 'p-1 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed';
  const iconSize = compact ? 14 : 16;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Controls */}
      {(showNav || showZoom) && (
        <div className={`flex items-center justify-between bg-slate-100 rounded-t-lg ${compact ? 'px-2 py-1' : 'px-3 py-1.5'}`}>
          {showNav && (
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => goPage(-1)} disabled={pageNum <= 1} className={btnCls} aria-label="Previous page">
                <ChevronLeft size={iconSize} />
              </button>
              <input
                type="number"
                value={pageNum}
                onChange={e => {
                  const v = Number(e.target.value);
                  if (v >= 1 && v <= totalPages) setPageNum(v);
                }}
                min={1}
                max={totalPages}
                className={`${compact ? 'text-[10px] w-7' : 'text-xs w-8'} text-slate-600 text-center bg-white border border-slate-200 rounded px-0.5`}
                aria-label="Page number"
              />
              <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-slate-500`}>
                / {totalPages}
              </span>
              <button type="button" onClick={() => goPage(1)} disabled={pageNum >= totalPages} className={btnCls} aria-label="Next page">
                <ChevronRight size={iconSize} />
              </button>
            </div>
          )}
          {showZoom && (
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => adjustZoom(-0.25)} disabled={zoom <= 0.5} className={btnCls} aria-label="Zoom out">
                <ZoomOut size={iconSize} />
              </button>
              <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-slate-500 min-w-[3em] text-center`}>
                {Math.round(zoom * 100)}%
              </span>
              <button type="button" onClick={() => adjustZoom(0.25)} disabled={zoom >= 3} className={btnCls} aria-label="Zoom in">
                <ZoomIn size={iconSize} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="overflow-auto bg-slate-200 rounded-b-lg"
        style={{ height }}
      >
        <canvas ref={canvasRef} className="mx-auto" />
      </div>
    </div>
  );
});

import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, Layers, Undo2, Redo2 } from 'lucide-react';
import type { CoverDesign, CoverParams, CoverTemplate } from './types';
import { COVER_TEMPLATES, DEFAULT_PARAMS } from './types';
import { coverService } from '../../services/coverService';
import { CoverTemplateLibrary } from './CoverTemplateLibrary';
import { CoverEditorView } from './CoverEditorView';
import { CoverAiSuggestions } from './CoverAiSuggestions';
import { CoverBatchModal } from './CoverBatchModal';

type HubView = 'library' | 'templates' | 'editor';

export function CoverHub() {
  const [view, setView] = useState<HubView>('library');
  const [designs, setDesigns] = useState<CoverDesign[]>(() => {
    try { return coverService.getDesigns(); }
    catch { return []; }
  });
  const [activeTemplate, setActiveTemplate] = useState<CoverTemplate | null>(null);
  const [activeParams, setActiveParams] = useState<CoverParams>(DEFAULT_PARAMS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Undo/redo history for param edits (max 30 snapshots)
  const historyRef = useRef<CoverParams[]>([]);
  const historyIdxRef = useRef(-1);
  // Track undo/redo availability as state (updated by pushHistory/handleUndo/handleRedo)
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncUndoRedo = useCallback(() => {
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  }, []);

  useEffect(() => () => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
  }, []);

  const refreshDesigns = useCallback(() => {
    setDesigns(coverService.getDesigns());
  }, []);

  const resetHistory = useCallback((initialParams: CoverParams) => {
    historyRef.current = [initialParams];
    historyIdxRef.current = 0;
    syncUndoRedo();
  }, [syncUndoRedo]);

  const handleSelectTemplate = useCallback((template: CoverTemplate) => {
    const params = { ...template.defaultParams };
    setActiveTemplate(template);
    setActiveParams(params);
    resetHistory(params);
    setEditingId(null);
    setView('editor');
  }, [resetHistory]);

  const handleEditDesign = useCallback((design: CoverDesign) => {
    const template = COVER_TEMPLATES.find(t => t.type === design.templateType);
    if (!template) return;
    const params = { ...design.params };
    setActiveTemplate(template);
    setActiveParams(params);
    resetHistory(params);
    setEditingId(design.id);
    setView('editor');
  }, [resetHistory]);

  const handleDeleteDesign = useCallback((id: string) => {
    if (confirmDeleteId === id) {
      coverService.deleteDesign(id);
      refreshDesigns();
      setConfirmDeleteId(null);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    } else {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      setConfirmDeleteId(id);
      deleteTimerRef.current = setTimeout(
        () => setConfirmDeleteId(prev => (prev === id ? null : prev)),
        3000,
      );
    }
  }, [confirmDeleteId, refreshDesigns]);

  const pushHistory = useCallback((params: CoverParams) => {
    const history = historyRef.current;
    const idx = historyIdxRef.current;
    // Dedup: skip if identical to current history entry
    if (idx >= 0 && JSON.stringify(history[idx]) === JSON.stringify(params)) return;
    // Truncate forward history on new change
    const newHistory = history.slice(0, idx + 1);
    newHistory.push(params);
    if (newHistory.length > 30) newHistory.shift();
    historyRef.current = newHistory;
    historyIdxRef.current = newHistory.length - 1;
    syncUndoRedo();
  }, [syncUndoRedo]);

  const handleParamChange = useCallback((updates: Partial<CoverParams>) => {
    setActiveParams(prev => {
      const next = { ...prev, ...updates };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const handleUndo = useCallback(() => {
    const idx = historyIdxRef.current;
    if (idx <= 0) return;
    historyIdxRef.current = idx - 1;
    setActiveParams(historyRef.current[historyIdxRef.current]);
    syncUndoRedo();
  }, [syncUndoRedo]);

  const handleRedo = useCallback(() => {
    const idx = historyIdxRef.current;
    if (idx >= historyRef.current.length - 1) return;
    historyIdxRef.current = idx + 1;
    setActiveParams(historyRef.current[historyIdxRef.current]);
    syncUndoRedo();
  }, [syncUndoRedo]);

  // Ctrl+Z / Ctrl+Y keyboard shortcuts for undo/redo (editor only)
  useEffect(() => {
    if (view !== 'editor') return;
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, handleUndo, handleRedo]);

  const handleSave = useCallback(() => {
    if (!activeTemplate) return;
    const now = new Date().toISOString();
    const existingDesign = editingId ? designs.find(d => d.id === editingId) : null;
    const design: CoverDesign = {
      id: editingId || `cover-${Date.now()}`,
      templateType: activeTemplate.type,
      params: { ...activeParams },
      createdAt: existingDesign?.createdAt || now,
      updatedAt: now,
    };
    coverService.saveDesign(design);
    refreshDesigns();
    setView('library');
  }, [activeTemplate, activeParams, editingId, designs, refreshDesigns]);

  return (
    <div className="space-y-6">
      {view === 'library' && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Publishing</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cover Designer</h2>
              <p className="text-sm text-slate-500 max-w-lg">
                Design beautiful covers for your educational resources with real-time preview and export.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView('templates')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                <Plus size={16} /> New Design
              </button>
              {designs.length > 0 && activeTemplate && (
                <button
                  type="button"
                  onClick={() => setBatchOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  <Layers size={16} /> Batch
                </button>
              )}
            </div>
          </div>

          {designs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Layers size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No saved designs</p>
              <p className="text-sm">Create your first cover design to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {designs.map(d => {
                const template = COVER_TEMPLATES.find(t => t.type === d.templateType);
                const isConfirming = confirmDeleteId === d.id;
                return (
                  <div
                    key={d.id}
                    className="group text-left rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleEditDesign(d)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleEditDesign(d); }}
                  >
                    <div
                      className="w-full rounded-xl mb-3 overflow-hidden"
                      style={{
                        aspectRatio: template ? `${template.width} / ${template.height}` : '16/9',
                        background: `linear-gradient(135deg, ${d.params.primaryGradientStart}, ${d.params.primaryGradientEnd})`,
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color: d.params.textColor }}>
                          {d.params.subtitle}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{d.params.subtitle || 'Untitled'}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{template?.label || d.templateType}</span>
                          <Calendar size={10} />
                          <span>{new Date(d.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleDeleteDesign(d.id); }}
                        className={`p-1.5 rounded-lg transition shrink-0 ${
                          isConfirming
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-red-50 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
                        }`}
                        title={isConfirming ? 'Click again to confirm delete' : 'Delete'}
                        aria-label={isConfirming ? 'Confirm delete' : 'Delete design'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setView('library')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back
            </button>
            <h3 className="text-lg font-bold text-slate-900">Choose Template</h3>
          </div>
          <CoverTemplateLibrary onSelect={handleSelectTemplate} />
        </div>
      )}

      {view === 'editor' && activeTemplate && (
        <div className="space-y-6">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={13} /> Undo
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={13} /> Redo
            </button>
          </div>
          <CoverEditorView
            template={activeTemplate}
            params={activeParams}
            onChange={handleParamChange}
            onBack={() => setView('library')}
            onSave={handleSave}
          />
          <div className="max-w-sm">
            <CoverAiSuggestions
              templateType={activeTemplate.type}
              currentParams={activeParams}
              onApply={handleParamChange}
            />
          </div>
        </div>
      )}

      {activeTemplate && (
        <CoverBatchModal
          isOpen={batchOpen}
          onClose={() => setBatchOpen(false)}
          baseParams={activeParams}
          template={activeTemplate}
        />
      )}
    </div>
  );
}

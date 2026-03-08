import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import type { SavedPaper } from './types';
import { paperService } from '../../services/paperService';
import { PaperLibrary } from './PaperLibrary';
import { PaperCreateWizard } from './PaperCreateWizard';

type HubView = 'library' | 'create';

export function PaperHub() {
  const [view, setView] = useState<HubView>('library');
  const [papers, setPapers] = useState<SavedPaper[]>(() => {
    try { return paperService.getSavedPapers(); } catch { return []; }
  });
  const [editPaper, setEditPaper] = useState<SavedPaper | null>(null);

  const refreshPapers = useCallback(() => {
    setPapers(paperService.getSavedPapers());
  }, []);

  const handleDelete = useCallback((id: string) => {
    paperService.deletePaper(id);
    refreshPapers();
  }, [refreshPapers]);

  const handleDuplicate = useCallback((paper: SavedPaper) => {
    const dup: SavedPaper = {
      ...paper,
      id: `paper-${Date.now()}`,
      title: `${paper.title} (copy)`,
      texSource: undefined,
      pdfPath: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      paperService.savePaper(dup);
      refreshPapers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to duplicate paper');
    }
  }, [refreshPapers]);

  const handleSelect = useCallback((paper: SavedPaper) => {
    setEditPaper(paper);
    setView('create');
  }, []);

  const handleSave = useCallback((paper: SavedPaper) => {
    refreshPapers();
    setView('library');
    setEditPaper(null);
  }, [refreshPapers]);

  return (
    <div className="space-y-6">
      {view === 'library' && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Publishing</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Paper Generator</h2>
              <p className="text-sm text-slate-500 max-w-lg">
                Create practice papers from 5,962 past exam questions. Auto-fill, preview, and compile to PDF.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setEditPaper(null); setView('create'); }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              <Plus size={16} /> Create Paper
            </button>
          </div>

          <PaperLibrary
            papers={papers}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </>
      )}

      {view === 'create' && (
        <PaperCreateWizard
          onBack={() => { setView('library'); setEditPaper(null); }}
          onSave={handleSave}
          editPaper={editPaper}
        />
      )}
    </div>
  );
}

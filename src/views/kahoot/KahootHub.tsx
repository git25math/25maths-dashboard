import { useCallback, useMemo, useState } from 'react';
import { HelpCircle, Plus, Settings } from 'lucide-react';
import { KahootItem } from '../../types';
import { KahootLibrary } from './KahootLibrary';
import { KahootDetailSheet } from './KahootDetailSheet';
import { KahootCreateWizard } from './KahootCreateWizard';
import { KahootSettings } from './KahootSettings';
import { KahootModuleGuide } from './KahootModuleGuide';

type HubView = 'library' | 'create' | 'settings';

interface ToastApi {
  success: (msg: string) => void;
  error: (msg: string) => void;
}

interface KahootHubProps {
  kahootItems: KahootItem[];
  onAddKahoot: (seed?: Partial<Omit<KahootItem, 'id'>>) => Promise<KahootItem | undefined>;
  onUpdateKahoot: (id: string, updates: Partial<KahootItem>) => Promise<void>;
  onDeleteKahoot: (id: string) => Promise<void> | void;
  onDuplicateKahoot: (id: string) => Promise<KahootItem | undefined>;
  toast: ToastApi;
}

export function KahootHub({
  kahootItems, onAddKahoot, onUpdateKahoot, onDeleteKahoot, onDuplicateKahoot, toast,
}: KahootHubProps) {
  const [view, setView] = useState<HubView>('library');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const selectedItem = useMemo(
    () => kahootItems.find(i => i.id === selectedId) ?? null,
    [kahootItems, selectedId],
  );

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  }, [toast]);

  const handleCardClick = useCallback((id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const handleCloseSheet = useCallback(() => setSelectedId(null), []);

  const handleDelete = useCallback(async (id: string) => {
    await onDeleteKahoot(id);
    if (selectedId === id) setSelectedId(null);
  }, [onDeleteKahoot, selectedId]);

  const handleDuplicate = useCallback(async (id: string) => {
    const dup = await onDuplicateKahoot(id);
    if (dup) setSelectedId(dup.id);
  }, [onDuplicateKahoot]);

  const handleSaveItem = useCallback(async (item: KahootItem) => {
    const existing = kahootItems.find(i => i.id === item.id);
    if (existing) {
      await onUpdateKahoot(item.id, item);
    } else {
      await onAddKahoot(item);
    }
  }, [kahootItems, onAddKahoot, onUpdateKahoot]);

  return (
    <div className="space-y-6">
      {/* Top bar - only show in library/settings */}
      {view !== 'create' && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Publishing</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Kahoot Hub</h2>
            <p className="text-sm text-slate-500 max-w-lg">
              Create, manage, and deploy Kahoot quizzes across CIE and Edexcel exam boards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('create')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              <Plus size={16} /> Create New
            </button>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition"
              title="Module Guide"
            >
              <HelpCircle size={18} />
            </button>
            <button
              type="button"
              onClick={() => setView(v => v === 'settings' ? 'library' : 'settings')}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Views */}
      {view === 'library' && (
        <KahootLibrary
          items={kahootItems}
          selectedId={selectedId}
          onSelect={handleCardClick}
        />
      )}

      {view === 'settings' && (
        <KahootSettings onOpenGuide={() => setGuideOpen(true)} />
      )}

      {view === 'create' && (
        <KahootCreateWizard
          onBack={() => setView('library')}
          onSaveItem={handleSaveItem}
          onCopy={handleCopy}
        />
      )}

      {/* Detail Sheet - overlays library view */}
      <KahootDetailSheet
        item={selectedItem}
        onClose={handleCloseSheet}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onCopy={handleCopy}
      />

      {/* Module Guide modal */}
      <KahootModuleGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}

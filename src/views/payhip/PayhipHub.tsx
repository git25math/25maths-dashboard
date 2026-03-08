import { useCallback, useEffect, useMemo, useState } from 'react';
import { PayhipItem, PayhipPipelineStage } from '../../types';
import { PayhipLibrary } from './PayhipLibrary';
import { PayhipDetailSheet } from './PayhipDetailSheet';

interface ToastApi {
  success: (msg: string) => void;
  error: (msg: string) => void;
}

interface PayhipHubProps {
  payhipItems: PayhipItem[];
  onUpdatePayhip: (id: string, updates: Partial<PayhipItem>) => Promise<void>;
  onTogglePipeline: (id: string, stage: PayhipPipelineStage) => Promise<void>;
  onBulkPipeline: (id: string, value: boolean) => Promise<void>;
  toast: ToastApi;
}

export function PayhipHub({ payhipItems, onUpdatePayhip, onTogglePipeline, onBulkPipeline, toast }: PayhipHubProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleIds, setVisibleIds] = useState<string[] | null>(null);

  const navigationIds = visibleIds ?? payhipItems.map(item => item.id);

  const selectedItem = useMemo(
    () => payhipItems.find(item => item.id === selectedId) ?? null,
    [payhipItems, selectedId],
  );

  const selectedIndex = useMemo(
    () => (selectedId ? navigationIds.findIndex(id => id === selectedId) : -1),
    [navigationIds, selectedId],
  );

  useEffect(() => {
    if (!selectedId) return;
    if (!navigationIds.includes(selectedId)) {
      setSelectedId(null);
    }
  }, [navigationIds, selectedId]);

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  }, [toast]);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (!selectedId) return;
    const idx = navigationIds.findIndex(id => id === selectedId);
    if (idx === -1) return;
    const nextIdx = direction === 'next'
      ? Math.min(idx + 1, navigationIds.length - 1)
      : Math.max(idx - 1, 0);
    if (nextIdx !== idx) setSelectedId(navigationIds[nextIdx]);
  }, [navigationIds, selectedId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Publishing</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Payhip Hub</h2>
          <p className="max-w-2xl text-sm text-slate-500">
            Track Kahoot Payhip listings across L1-L4, manage upload progress, and keep website status aligned with the live catalog.
          </p>
        </div>
      </div>

      <PayhipLibrary
        items={payhipItems}
        selectedId={selectedId}
        onSelect={id => setSelectedId(prev => prev === id ? null : id)}
        onVisibleIdsChange={setVisibleIds}
      />

      <PayhipDetailSheet
        item={selectedItem}
        onClose={() => setSelectedId(null)}
        onCopy={handleCopy}
        onSave={onUpdatePayhip}
        onTogglePipeline={onTogglePipeline}
        onBulkPipeline={onBulkPipeline}
        onNavigate={handleNavigate}
        canNavigatePrev={selectedIndex > 0}
        canNavigateNext={selectedIndex !== -1 && selectedIndex < navigationIds.length - 1}
      />
    </div>
  );
}

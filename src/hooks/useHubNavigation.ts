import { useCallback, useEffect, useMemo, useState } from 'react';
import { ToastApi } from '../types';

interface UseHubNavigationParams<T extends { id: string }> {
  items: T[];
  toast: ToastApi;
}

export function useHubNavigation<T extends { id: string }>({ items, toast }: UseHubNavigationParams<T>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleIds, setVisibleIds] = useState<string[] | null>(null);

  const navigationIds = useMemo(
    () => visibleIds ?? items.map(item => item.id),
    [visibleIds, items],
  );

  const selectedItem = useMemo(
    () => items.find(item => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const selectedIndex = useMemo(
    () => (selectedId ? navigationIds.findIndex(id => id === selectedId) : -1),
    [navigationIds, selectedId],
  );

  // Clear selection when item is filtered out
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

  const handleSelect = useCallback((id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const canNavigatePrev = selectedIndex > 0;
  const canNavigateNext = selectedIndex !== -1 && selectedIndex < navigationIds.length - 1;

  return {
    selectedId,
    setSelectedId,
    selectedItem,
    selectedIndex,
    visibleIds,
    setVisibleIds,
    navigationIds,
    handleCopy,
    handleNavigate,
    handleSelect,
    canNavigatePrev,
    canNavigateNext,
  };
}

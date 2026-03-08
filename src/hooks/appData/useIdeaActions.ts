import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { ideaService } from '../../services/ideaService';
import { Idea, ToastApi } from '../../types';

interface UseIdeaActionsParams {
  ideas: Idea[];
  setIdeas: Dispatch<SetStateAction<Idea[]>>;
  toast: ToastApi;
}

export function useIdeaActions({ ideas, setIdeas, toast }: UseIdeaActionsParams) {
  const ideasRef = useRef(ideas);
  ideasRef.current = ideas;

  const addIdea = useCallback(async (data: { title: string; content: string; category: Idea['category']; priority: Idea['priority']; show_on_dashboard?: boolean }) => {
    try {
      const created = await ideaService.create({
        status: 'pending',
        created_at: new Date().toISOString(),
        ...data,
      });
      setIdeas(prev => [...prev, created]);
      toast.success('Idea saved');
    } catch (error) {
      toast.error('Failed to save idea');
    }
  }, [setIdeas, toast]);

  const updateIdea = useCallback(async (id: string, updates: Partial<Idea>) => {
    const existing = ideasRef.current.find(i => i.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await ideaService.update(id, merged);
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
      toast.success('Idea updated');
    } catch (error) {
      toast.error('Failed to update idea');
    }
  }, [setIdeas, toast]);

  const deleteIdea = useCallback(async (id: string) => {
    try {
      await ideaService.delete(id);
      setIdeas(prev => prev.filter(i => i.id !== id));
      toast.success('Idea deleted');
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  }, [setIdeas, toast]);

  const toggleIdeaStatus = useCallback(async (id: string) => {
    const idea = ideasRef.current.find(i => i.id === id);
    if (!idea) return;
    const cycle: Record<string, Idea['status']> = { note: 'pending', pending: 'processed', processed: 'note' };
    const newStatus = cycle[idea.status] || 'pending';
    try {
      await ideaService.update(id, { ...idea, status: newStatus });
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
      toast.success('Idea status updated');
    } catch (error) {
      toast.error('Failed to update idea status');
    }
  }, [setIdeas, toast]);

  const toggleIdeaDashboard = useCallback(async (id: string) => {
    const idea = ideasRef.current.find(i => i.id === id);
    if (!idea) return;
    const newVal = !idea.show_on_dashboard;
    try {
      await ideaService.update(id, { ...idea, show_on_dashboard: newVal });
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, show_on_dashboard: newVal } : i));
      toast.success(newVal ? 'Shown on Dashboard' : 'Hidden from Dashboard');
    } catch (error) {
      toast.error('Failed to update dashboard visibility');
    }
  }, [setIdeas, toast]);

  const consolidateIdeas = useCallback(async (
    selectedIds: string[],
    consolidated: { title: string; content: string; category: Idea['category']; priority: Idea['priority'] }
  ) => {
    try {
      await Promise.all(selectedIds.map(id => ideaService.delete(id)));
      setIdeas(prev => prev.filter(i => !selectedIds.includes(i.id)));

      const created = await ideaService.create({
        status: 'pending',
        created_at: new Date().toISOString(),
        ...consolidated,
      });
      setIdeas(prev => [...prev, created]);
      toast.success(`Consolidated ${selectedIds.length} ideas into 1`);
    } catch (error) {
      toast.error('Failed to consolidate ideas');
      throw error;
    }
  }, [setIdeas, toast]);

  return {
    addIdea,
    updateIdea,
    deleteIdea,
    toggleIdeaStatus,
    toggleIdeaDashboard,
    consolidateIdeas,
  };
}

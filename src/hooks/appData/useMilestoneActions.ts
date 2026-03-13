import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { milestoneService } from '../../services/milestoneService';
import { ProjectMilestone, MilestoneStatus, MilestoneReview } from '../../types/chronicle';
import { ToastApi } from '../../types';

interface UseMilestoneActionsParams {
  milestones: ProjectMilestone[];
  setMilestones: Dispatch<SetStateAction<ProjectMilestone[]>>;
  toast: ToastApi;
}

export function useMilestoneActions({ milestones, setMilestones, toast }: UseMilestoneActionsParams) {
  const milestonesRef = useRef(milestones);
  milestonesRef.current = milestones;

  const addMilestone = useCallback(async (data: Omit<ProjectMilestone, 'id'>) => {
    try {
      const created = await milestoneService.create(data);
      setMilestones(prev => [...prev, created]);
      toast.success('Milestone added');
      return created;
    } catch (error) {
      toast.error('Failed to add milestone');
      throw error;
    }
  }, [setMilestones, toast]);

  const updateMilestone = useCallback(async (id: string, updates: Partial<ProjectMilestone>) => {
    const existing = milestonesRef.current.find(m => m.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await milestoneService.update(id, merged);
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
      toast.success('Milestone updated');
    } catch (error) {
      toast.error('Failed to update milestone');
    }
  }, [setMilestones, toast]);

  const deleteMilestone = useCallback(async (id: string) => {
    try {
      await milestoneService.delete(id);
      setMilestones(prev => prev.filter(m => m.id !== id));
      toast.success('Milestone deleted');
    } catch (error) {
      toast.error('Failed to delete milestone');
    }
  }, [setMilestones, toast]);

  const cycleMilestoneStatus = useCallback(async (id: string) => {
    const ms = milestonesRef.current.find(m => m.id === id);
    if (!ms) return;
    const cycle: Record<MilestoneStatus, MilestoneStatus> = {
      not_started: 'in_progress',
      in_progress: 'completed',
      completed: 'not_started',
    };
    const newStatus = cycle[ms.status] || 'not_started';
    const updates: Partial<ProjectMilestone> = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    } else {
      updates.completed_at = undefined;
      updates.review = undefined;
    }
    await updateMilestone(id, updates);
    return newStatus;
  }, [updateMilestone]);

  const saveMilestoneReview = useCallback(async (id: string, review: MilestoneReview) => {
    await updateMilestone(id, { review });
  }, [updateMilestone]);

  const reorderMilestones = useCallback(async (projectId: string, orderedIds: string[]) => {
    setMilestones(prev => {
      const others = prev.filter(m => m.project_id !== projectId);
      const projectMs = prev.filter(m => m.project_id === projectId);
      const reordered = orderedIds.map((id, i) => {
        const ms = projectMs.find(m => m.id === id);
        return ms ? { ...ms, order: i } : null;
      }).filter(Boolean) as ProjectMilestone[];
      return [...others, ...reordered];
    });
    // Persist order updates
    for (let i = 0; i < orderedIds.length; i++) {
      const ms = milestonesRef.current.find(m => m.id === orderedIds[i]);
      if (ms && ms.order !== i) {
        milestoneService.update(orderedIds[i], { ...ms, order: i }).catch(() => {});
      }
    }
  }, [setMilestones]);

  return {
    addMilestone,
    updateMilestone,
    deleteMilestone,
    cycleMilestoneStatus,
    saveMilestoneReview,
    reorderMilestones,
  };
}

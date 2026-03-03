import { Dispatch, SetStateAction, useCallback } from 'react';
import { format } from 'date-fns';
import { ideaService } from '../../services/ideaService';
import { sopService } from '../../services/sopService';
import { workLogService } from '../../services/workLogService';
import { goalService } from '../../services/goalService';
import { schoolEventService } from '../../services/schoolEventService';
import { meetingService } from '../../services/meetingService';
import { emailDigestService } from '../../services/emailDigestService';
import { taskService } from '../../services/taskService';
import { Idea, SOP, WorkLog, Goal, SchoolEvent, MeetingRecord, Task, EmailDigest } from '../../types';

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface UseProductivityActionsParams {
  ideas: Idea[];
  setIdeas: Dispatch<SetStateAction<Idea[]>>;
  sops: SOP[];
  setSops: Dispatch<SetStateAction<SOP[]>>;
  workLogs: WorkLog[];
  setWorkLogs: Dispatch<SetStateAction<WorkLog[]>>;
  goals: Goal[];
  setGoals: Dispatch<SetStateAction<Goal[]>>;
  schoolEvents: SchoolEvent[];
  setSchoolEvents: Dispatch<SetStateAction<SchoolEvent[]>>;
  meetings: MeetingRecord[];
  setMeetings: Dispatch<SetStateAction<MeetingRecord[]>>;
  emailDigests: EmailDigest[];
  setEmailDigests: Dispatch<SetStateAction<EmailDigest[]>>;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  toast: ToastApi;
}

export function useProductivityActions({
  ideas,
  setIdeas,
  sops,
  setSops,
  workLogs,
  setWorkLogs,
  goals,
  setGoals,
  schoolEvents,
  setSchoolEvents,
  meetings,
  setMeetings,
  emailDigests,
  setEmailDigests,
  tasks,
  setTasks,
  toast,
}: UseProductivityActionsParams) {
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
    const existing = ideas.find(i => i.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await ideaService.update(id, merged);
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
      toast.success('Idea updated');
    } catch (error) {
      toast.error('Failed to update idea');
    }
  }, [ideas, setIdeas, toast]);

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
    const idea = ideas.find(i => i.id === id);
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
  }, [ideas, setIdeas, toast]);

  const toggleIdeaDashboard = useCallback(async (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;
    const newVal = !idea.show_on_dashboard;
    try {
      await ideaService.update(id, { ...idea, show_on_dashboard: newVal });
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, show_on_dashboard: newVal } : i));
      toast.success(newVal ? 'Shown on Dashboard' : 'Hidden from Dashboard');
    } catch (error) {
      toast.error('Failed to update dashboard visibility');
    }
  }, [ideas, setIdeas, toast]);

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

  const addSOP = useCallback(async (data: { title: string; category: string; content: string }) => {
    try {
      const created = await sopService.create(data);
      setSops(prev => [...prev, created]);
      toast.success('SOP added');
    } catch (error) {
      toast.error('Failed to add SOP');
    }
  }, [setSops, toast]);

  const updateSOP = useCallback(async (id: string, updates: Partial<SOP>) => {
    const existing = sops.find(s => s.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await sopService.update(id, merged);
      setSops(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      toast.success('SOP updated');
    } catch (error) {
      toast.error('Failed to update SOP');
    }
  }, [sops, setSops, toast]);

  const deleteSOP = useCallback(async (id: string) => {
    try {
      await sopService.delete(id);
      setSops(prev => prev.filter(s => s.id !== id));
      toast.success('SOP deleted');
    } catch (error) {
      toast.error('Failed to delete SOP');
    }
  }, [setSops, toast]);

  const consolidateSOPs = useCallback(async (
    selectedIds: string[],
    consolidated: { title: string; content: string; category: string }
  ) => {
    try {
      await Promise.all(selectedIds.map(id => sopService.delete(id)));
      setSops(prev => prev.filter(s => !selectedIds.includes(s.id)));

      const created = await sopService.create(consolidated);
      setSops(prev => [...prev, created]);
      toast.success(`Consolidated ${selectedIds.length} SOPs into 1`);
    } catch (error) {
      toast.error('Failed to consolidate SOPs');
      throw error;
    }
  }, [setSops, toast]);

  const addWorkLog = useCallback(async (data: { content: string; category: WorkLog['category']; tags?: string[] }) => {
    try {
      const created = await workLogService.create({
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
        ...data,
      });
      setWorkLogs(prev => [created, ...prev]);
      toast.success('Work log added');
    } catch (error) {
      toast.error('Failed to add work log');
    }
  }, [setWorkLogs, toast]);

  const updateWorkLog = useCallback(async (id: string, updates: Partial<WorkLog>) => {
    const existing = workLogs.find(l => l.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await workLogService.update(id, merged);
      setWorkLogs(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
      toast.success('Work log updated');
    } catch (error) {
      toast.error('Failed to update work log');
    }
  }, [workLogs, setWorkLogs, toast]);

  const deleteWorkLog = useCallback(async (id: string) => {
    try {
      await workLogService.delete(id);
      setWorkLogs(prev => prev.filter(l => l.id !== id));
      toast.success('Work log deleted');
    } catch (error) {
      toast.error('Failed to delete work log');
    }
  }, [setWorkLogs, toast]);

  const consolidateWorkLogs = useCallback(async (
    selectedIds: string[],
    consolidated: { content: string; category: WorkLog['category']; tags?: string[] }
  ) => {
    try {
      await Promise.all(selectedIds.map(id => workLogService.delete(id)));
      setWorkLogs(prev => prev.filter(l => !selectedIds.includes(l.id)));

      const created = await workLogService.create({
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
        ...consolidated,
      });
      setWorkLogs(prev => [created, ...prev]);
      toast.success(`Consolidated ${selectedIds.length} logs into 1`);
    } catch (error) {
      toast.error('Failed to consolidate work logs');
      throw error;
    }
  }, [setWorkLogs, toast]);

  const addGoal = useCallback(async (data: Omit<Goal, 'id'>) => {
    try {
      const created = await goalService.create(data);
      setGoals(prev => [...prev, created]);
      toast.success('Goal added');
    } catch (error) {
      toast.error('Failed to add goal');
    }
  }, [setGoals, toast]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const existing = goals.find(g => g.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await goalService.update(id, merged);
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
      toast.success('Goal updated');
    } catch (error) {
      toast.error('Failed to update goal');
    }
  }, [goals, setGoals, toast]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await goalService.delete(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  }, [setGoals, toast]);

  const addSchoolEvent = useCallback(async (data: Omit<SchoolEvent, 'id'>) => {
    try {
      const created = await schoolEventService.create(data);
      setSchoolEvents(prev => [...prev, created]);
      toast.success('Event added');
    } catch (error) {
      toast.error('Failed to add event');
    }
  }, [setSchoolEvents, toast]);

  const updateSchoolEvent = useCallback(async (id: string, updates: Partial<SchoolEvent>) => {
    const existing = schoolEvents.find(e => e.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await schoolEventService.update(id, merged);
      setSchoolEvents(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
      toast.success('Event updated');
    } catch (error) {
      toast.error('Failed to update event');
    }
  }, [schoolEvents, setSchoolEvents, toast]);

  const deleteSchoolEvent = useCallback(async (id: string) => {
    try {
      await schoolEventService.delete(id);
      setSchoolEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  }, [setSchoolEvents, toast]);

  const addMeeting = useCallback(async (data: Omit<MeetingRecord, 'id'>) => {
    try {
      const created = await meetingService.create(data);
      setMeetings(prev => [...prev, created]);
      toast.success('Meeting created');
      return created;
    } catch (error) {
      toast.error('Failed to create meeting');
      throw error;
    }
  }, [setMeetings, toast]);

  const updateMeeting = useCallback(async (id: string, updates: Partial<MeetingRecord>) => {
    const existing = meetings.find(m => m.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await meetingService.update(id, merged);
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
      toast.success('Meeting updated');
    } catch (error) {
      toast.error('Failed to update meeting');
    }
  }, [meetings, setMeetings, toast]);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      await meetingService.delete(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      toast.success('Meeting deleted');
    } catch (error) {
      toast.error('Failed to delete meeting');
    }
  }, [setMeetings, toast]);

  const addEmailDigest = useCallback(async (data: Omit<EmailDigest, 'id'>) => {
    try {
      const created = await emailDigestService.create(data);
      setEmailDigests(prev => [...prev, created]);
      toast.success('Email digest created');
      return created;
    } catch (error) {
      toast.error('Failed to create email digest');
      throw error;
    }
  }, [setEmailDigests, toast]);

  const updateEmailDigest = useCallback(async (id: string, updates: Partial<EmailDigest>) => {
    const existing = emailDigests.find(d => d.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await emailDigestService.update(id, merged);
      setEmailDigests(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    } catch (error) {
      toast.error('Failed to update email digest');
    }
  }, [emailDigests, setEmailDigests, toast]);

  const deleteEmailDigest = useCallback(async (id: string) => {
    try {
      await emailDigestService.delete(id);
      setEmailDigests(prev => prev.filter(d => d.id !== id));
      toast.success('Email digest deleted');
    } catch (error) {
      toast.error('Failed to delete email digest');
    }
  }, [setEmailDigests, toast]);

  const addTask = useCallback(async (data: Omit<Task, 'id' | 'created_at'>) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      ) as Omit<Task, 'id' | 'created_at'>;
      const created = await taskService.create({
        ...cleanData,
        created_at: new Date().toISOString(),
      });
      setTasks(prev => [...prev, created]);
      toast.success('Task added');
      return created;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('addTask failed:', error);
      toast.error(`Failed to add task: ${msg}`);
      throw error;
    }
  }, [setTasks, toast]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const existing = tasks.find(t => t.id === id);
    if (!existing) return;
    if (updates.status === 'done' && existing.status !== 'done') {
      updates.completed_at = new Date().toISOString();
    } else if (updates.status && updates.status !== 'done') {
      updates.completed_at = undefined;
    }
    const merged = { ...existing, ...updates };
    try {
      const updated = await taskService.update(id, merged);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  }, [tasks, setTasks, toast]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  }, [setTasks, toast]);

  const cycleTaskStatus = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const cycle: Record<string, Task['status']> = {
      inbox: 'next', next: 'waiting', waiting: 'someday', someday: 'done', done: 'inbox'
    };
    const newStatus = cycle[task.status] || 'inbox';
    await updateTask(id, { status: newStatus });
  }, [tasks, updateTask]);

  return {
    addIdea,
    updateIdea,
    deleteIdea,
    toggleIdeaStatus,
    toggleIdeaDashboard,
    consolidateIdeas,
    addSOP,
    updateSOP,
    deleteSOP,
    consolidateSOPs,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    consolidateWorkLogs,
    addGoal,
    updateGoal,
    deleteGoal,
    addSchoolEvent,
    updateSchoolEvent,
    deleteSchoolEvent,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    addEmailDigest,
    updateEmailDigest,
    deleteEmailDigest,
    addTask,
    updateTask,
    deleteTask,
    cycleTaskStatus,
  };
}

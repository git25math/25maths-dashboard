import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { schoolEventService } from '../../services/schoolEventService';
import { taskService } from '../../services/taskService';
import { SchoolEvent, Task, ToastApi } from '../../types';

interface UseSchoolEventActionsParams {
  schoolEvents: SchoolEvent[];
  setSchoolEvents: Dispatch<SetStateAction<SchoolEvent[]>>;
  setTasks: Dispatch<SetStateAction<Task[]>>;
  toast: ToastApi;
}

export function useSchoolEventActions({ schoolEvents, setSchoolEvents, setTasks, toast }: UseSchoolEventActionsParams) {
  const schoolEventsRef = useRef(schoolEvents);
  schoolEventsRef.current = schoolEvents;

  const addSchoolEvent = useCallback(async (data: Omit<SchoolEvent, 'id'>) => {
    try {
      const created = await schoolEventService.create(data);
      setSchoolEvents(prev => [...prev, created]);
      toast.success('Event added');
      if (data.is_action_required) {
        try {
          const task = await taskService.create({
            title: `[校历] ${data.title}`,
            description: data.description,
            status: 'inbox',
            priority: 'medium',
            source_type: 'school-event',
            source_id: created.id,
            due_date: data.date,
            tags: ['校历'],
            created_at: new Date().toISOString(),
          });
          setTasks(prev => [...prev, task]);
          toast.success('已创建待办事项');
        } catch {
          // silent — don't block event creation if task fails
        }
      }
    } catch (error) {
      toast.error('Failed to add event');
    }
  }, [setSchoolEvents, setTasks, toast]);

  const updateSchoolEvent = useCallback(async (id: string, updates: Partial<SchoolEvent>) => {
    const existing = schoolEventsRef.current.find(e => e.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await schoolEventService.update(id, merged);
      setSchoolEvents(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
      toast.success('Event updated');
    } catch (error) {
      toast.error('Failed to update event');
    }
  }, [setSchoolEvents, toast]);

  const deleteSchoolEvent = useCallback(async (id: string) => {
    try {
      await schoolEventService.delete(id);
      setSchoolEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  }, [setSchoolEvents, toast]);

  return {
    addSchoolEvent,
    updateSchoolEvent,
    deleteSchoolEvent,
  };
}

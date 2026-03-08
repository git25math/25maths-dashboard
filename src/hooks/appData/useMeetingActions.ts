import { Dispatch, SetStateAction, useCallback } from 'react';
import { meetingService } from '../../services/meetingService';
import { MeetingRecord, ToastApi } from '../../types';

interface UseMeetingActionsParams {
  setMeetings: Dispatch<SetStateAction<MeetingRecord[]>>;
  toast: ToastApi;
}

export function useMeetingActions({ setMeetings, toast }: UseMeetingActionsParams) {
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
    try {
      const updated = await meetingService.update(id, updates);
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
      toast.success('Meeting updated');
      return updated;
    } catch (error) {
      toast.error('Failed to update meeting');
      throw error;
    }
  }, [setMeetings, toast]);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      await meetingService.delete(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      toast.success('Meeting deleted');
    } catch (error) {
      toast.error('Failed to delete meeting');
    }
  }, [setMeetings, toast]);

  return {
    addMeeting,
    updateMeeting,
    deleteMeeting,
  };
}

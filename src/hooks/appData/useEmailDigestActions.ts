import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { emailDigestService } from '../../services/emailDigestService';
import { EmailDigest, ToastApi } from '../../types';

interface UseEmailDigestActionsParams {
  emailDigests: EmailDigest[];
  setEmailDigests: Dispatch<SetStateAction<EmailDigest[]>>;
  toast: ToastApi;
}

export function useEmailDigestActions({ emailDigests, setEmailDigests, toast }: UseEmailDigestActionsParams) {
  const emailDigestsRef = useRef(emailDigests);
  emailDigestsRef.current = emailDigests;

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
    const existing = emailDigestsRef.current.find(d => d.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await emailDigestService.update(id, merged);
      setEmailDigests(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    } catch (error) {
      toast.error('Failed to update email digest');
    }
  }, [setEmailDigests, toast]);

  const deleteEmailDigest = useCallback(async (id: string) => {
    try {
      await emailDigestService.delete(id);
      setEmailDigests(prev => prev.filter(d => d.id !== id));
      toast.success('Email digest deleted');
    } catch (error) {
      toast.error('Failed to delete email digest');
    }
  }, [setEmailDigests, toast]);

  return {
    addEmailDigest,
    updateEmailDigest,
    deleteEmailDigest,
  };
}

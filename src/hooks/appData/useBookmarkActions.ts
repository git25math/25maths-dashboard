import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { bookmarkService } from '../../services/bookmarkService';
import { Bookmark, ToastApi } from '../../types';

interface UseBookmarkActionsParams {
  bookmarks: Bookmark[];
  setBookmarks: Dispatch<SetStateAction<Bookmark[]>>;
  toast: ToastApi;
}

export function useBookmarkActions({ bookmarks, setBookmarks, toast }: UseBookmarkActionsParams) {
  const bookmarksRef = useRef(bookmarks);
  bookmarksRef.current = bookmarks;

  const addBookmark = useCallback(async (data: Omit<Bookmark, 'id'>) => {
    try {
      const created = await bookmarkService.create(data);
      setBookmarks(prev => [...prev, created]);
      toast.success('Bookmark added');
    } catch (error) {
      toast.error('Failed to add bookmark');
    }
  }, [setBookmarks, toast]);

  const updateBookmark = useCallback(async (id: string, updates: Partial<Bookmark>) => {
    const existing = bookmarksRef.current.find(b => b.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await bookmarkService.update(id, merged);
      setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
      toast.success('Bookmark updated');
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  }, [setBookmarks, toast]);

  const deleteBookmark = useCallback(async (id: string) => {
    try {
      await bookmarkService.delete(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
      toast.success('Bookmark deleted');
    } catch (error) {
      toast.error('Failed to delete bookmark');
    }
  }, [setBookmarks, toast]);

  const toggleBookmarkPin = useCallback(async (id: string) => {
    const existing = bookmarksRef.current.find(b => b.id === id);
    if (!existing) return;
    const merged = { ...existing, pinned: !existing.pinned };
    try {
      const updated = await bookmarkService.update(id, merged);
      setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
      toast.success(merged.pinned ? 'Pinned to dashboard' : 'Unpinned from dashboard');
    } catch (error) {
      toast.error('Failed to toggle pin');
    }
  }, [setBookmarks, toast]);

  return {
    addBookmark,
    updateBookmark,
    deleteBookmark,
    toggleBookmarkPin,
  };
}

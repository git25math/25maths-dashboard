import { useEffect } from 'react';

interface UseDetailSheetKeyboardParams {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function useDetailSheetKeyboard({ isOpen, onClose, onNavigate }: UseDetailSheetKeyboardParams) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping = Boolean(target?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
      if (isTyping) {
        if (e.key === 'Escape') target?.blur();
        return;
      }
      if (e.key === 'Escape') onClose();
      if (onNavigate) {
        if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); onNavigate('prev'); }
        if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); onNavigate('next'); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose, onNavigate]);
}

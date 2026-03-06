import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';

interface QuickCaptureProps {
  onSave: (text: string, category: 'work' | 'student' | 'startup' | 'task') => void;
}

export const QuickCapture = ({ onSave }: QuickCaptureProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<'work' | 'student' | 'startup' | 'task'>('work');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(text, category);
    setText('');
    setAiSuggestion(null);
    setIsOpen(false);
  };

  const handleAiSuggest = async () => {
    if (text.trim().length < 10 || aiLoading) return;
    setAiLoading(true);
    try {
      const result = await geminiService.suggestCategorization(text);
      setCategory(result.ideaCategory);
      setAiSuggestion(result.ideaCategory);
    } catch {
      // Silent fail
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 glass-card p-4 mb-2"
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-slate-900">Quick Capture</h3>
                <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-24 p-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
              />
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  {(['work', 'student', 'startup', 'task'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setCategory(cat); setAiSuggestion(null); }}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border",
                        category === cat
                          ? cat === 'task'
                            ? "bg-cyan-50 border-cyan-200 text-cyan-600"
                            : "bg-indigo-50 border-indigo-200 text-indigo-600"
                          : "bg-white border-slate-200 text-slate-400"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={text.trim().length < 10 || aiLoading}
                    className={cn(
                      "px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border flex items-center gap-1",
                      aiLoading
                        ? "bg-purple-50 border-purple-200 text-purple-400 cursor-not-allowed"
                        : text.trim().length < 10
                          ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                          : "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100"
                    )}
                  >
                    <Sparkles size={10} />
                    {aiLoading ? '...' : 'AI'}
                  </button>
                </div>
                {aiSuggestion && (
                  <p className="text-[10px] text-purple-500 font-medium">AI suggested: {aiSuggestion}</p>
                )}
              </div>
              <button type="submit" className="w-full btn-primary py-2 text-sm">
                Save Note
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95"
      >
        <Plus size={28} className={cn("transition-transform duration-300", isOpen && "rotate-45")} />
      </button>
    </div>
  );
};

import { useState } from 'react';
import { X } from 'lucide-react';
import { MilestoneReview, ProjectMilestone } from '../../types/chronicle';

interface MilestoneReviewFormProps {
  milestone: ProjectMilestone;
  onSave: (review: MilestoneReview) => void;
  onCancel: () => void;
}

export function MilestoneReviewForm({ milestone, onSave, onCancel }: MilestoneReviewFormProps) {
  const existing = milestone.review;
  const [whatDone, setWhatDone] = useState(existing?.what_done || '');
  const [whatLearned, setWhatLearned] = useState(existing?.what_learned || '');
  const [whatImprove, setWhatImprove] = useState(existing?.what_improve || '');
  const [timeSpent, setTimeSpent] = useState(existing?.time_spent || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatDone.trim() || !whatLearned.trim() || !whatImprove.trim()) return;
    onSave({
      what_done: whatDone.trim(),
      what_learned: whatLearned.trim(),
      what_improve: whatImprove.trim(),
      time_spent: timeSpent.trim() || undefined,
      reviewed_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Milestone Review</h3>
            <p className="text-sm text-slate-500 mt-0.5">{milestone.title}</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">What was accomplished? *</label>
            <textarea
              value={whatDone}
              onChange={e => setWhatDone(e.target.value)}
              placeholder="Key outcomes and deliverables..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">What did you learn? *</label>
            <textarea
              value={whatLearned}
              onChange={e => setWhatLearned(e.target.value)}
              placeholder="Insights, patterns, new understanding..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">What to improve next time? *</label>
            <textarea
              value={whatImprove}
              onChange={e => setWhatImprove(e.target.value)}
              placeholder="Process improvements, better approaches..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Time spent (optional)</label>
            <input
              type="text"
              value={timeSpent}
              onChange={e => setTimeSpent(e.target.value)}
              placeholder="e.g. 2 weeks, 40 hours..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!whatDone.trim() || !whatLearned.trim() || !whatImprove.trim()}
            className="btn-primary text-sm disabled:opacity-50"
          >
            Save Review
          </button>
        </div>
      </div>
    </div>
  );
}

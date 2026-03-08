import { memo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MeetingRecord } from '../../types';
import { CATEGORIES } from './constants';

interface NewMeetingFormProps {
  newTitle: string;
  newDate: string;
  newCategory: MeetingRecord['category'];
  newParticipants: string;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCategoryChange: (value: MeetingRecord['category']) => void;
  onParticipantsChange: (value: string) => void;
  onCreate: () => void;
  onBack: () => void;
}

export const NewMeetingForm = memo(function NewMeetingForm({
  newTitle,
  newDate,
  newCategory,
  newParticipants,
  onTitleChange,
  onDateChange,
  onCategoryChange,
  onParticipantsChange,
  onCreate,
  onBack,
}: NewMeetingFormProps) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to Meetings
      </button>
      <h2 className="text-2xl font-bold text-slate-900">New Meeting</h2>
      <div className="glass-card p-6 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input value={newTitle} onChange={e => onTitleChange(e.target.value)} placeholder="Meeting title..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input type="date" value={newDate} onChange={e => onDateChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select value={newCategory} onChange={e => onCategoryChange(e.target.value as MeetingRecord['category'])} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Participants (comma-separated)</label>
          <input value={newParticipants} onChange={e => onParticipantsChange(e.target.value)} placeholder="Alice, Bob, Charlie" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onCreate} disabled={!newTitle.trim()} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-40">Create Meeting</button>
          <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 px-4 py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
});

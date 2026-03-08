import { memo } from 'react';
import { Edit3, Trash2, Calendar, Clock, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MeetingRecord } from '../../types';
import { CATEGORIES, CATEGORY_COLORS, STATUS_COLORS, formatDuration } from './constants';

interface MeetingCardProps {
  meeting: MeetingRecord;
  isEditing: boolean;
  editTitle: string;
  editCategory: MeetingRecord['category'];
  editParticipants: string;
  onEditTitleChange: (value: string) => void;
  onEditCategoryChange: (value: MeetingRecord['category']) => void;
  onEditParticipantsChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

export const MeetingCard = memo(function MeetingCard({
  meeting,
  isEditing,
  editTitle,
  editCategory,
  editParticipants,
  onEditTitleChange,
  onEditCategoryChange,
  onEditParticipantsChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onOpen,
}: MeetingCardProps) {
  return (
    <div
      className="glass-card p-5 hover:shadow-md transition-shadow group relative cursor-pointer"
      onClick={() => !isEditing && onOpen()}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
        <button
          onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
          className="text-slate-300 hover:text-indigo-500 transition-colors"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (confirm('Delete this meeting?')) onDelete(); }}
          className="text-slate-300 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3" onClick={e => e.stopPropagation()}>
          <input value={editTitle} onChange={e => onEditTitleChange(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-sm" />
          <select value={editCategory} onChange={e => onEditCategoryChange(e.target.value as MeetingRecord['category'])} className="w-full border rounded-lg px-3 py-1.5 text-sm">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input value={editParticipants} onChange={e => onEditParticipantsChange(e.target.value)} placeholder="Participants (comma-separated)" className="w-full border rounded-lg px-3 py-1.5 text-sm" />
          <div className="flex gap-2">
            <button onClick={onSaveEdit} className="btn-primary text-xs px-3 py-1">Save</button>
            <button onClick={onCancelEdit} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", CATEGORY_COLORS[meeting.category])}>
              {meeting.category}
            </span>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", STATUS_COLORS[meeting.status])}>
              {meeting.status}
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-900">{meeting.title}</h3>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Calendar size={12} /> {meeting.date}</span>
            {meeting.duration > 0 && <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(meeting.duration)}</span>}
            {meeting.participants.length > 0 && <span className="flex items-center gap-1"><Users size={12} /> {meeting.participants.length}</span>}
          </div>
        </>
      )}
    </div>
  );
});

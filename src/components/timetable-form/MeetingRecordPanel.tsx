import React, { memo } from 'react';
import { Clock } from 'lucide-react';
import { MeetingRecord } from '../../types';
import { cn } from '../../lib/utils';

interface MeetingRecordPanelProps {
  meetingRecordId?: string;
  meetings: MeetingRecord[];
}

export const MeetingRecordPanel = memo(function MeetingRecordPanel({
  meetingRecordId,
  meetings,
}: MeetingRecordPanelProps) {
  const linked = meetingRecordId
    ? meetings.find(m => m.id === meetingRecordId)
    : null;

  return (
    <div className="space-y-4 p-6 bg-purple-50/50 rounded-3xl border border-purple-100">
      <div className="flex items-center gap-2 text-purple-600 font-bold text-sm uppercase tracking-widest">
        <Clock size={16} />
        <span>Meeting Record</span>
      </div>
      {linked ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded",
              linked.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
            )}>{linked.status}</span>
            {linked.duration > 0 && <span className="text-slate-400 text-xs">{Math.floor(linked.duration / 60)}:{(linked.duration % 60).toString().padStart(2, '0')}</span>}
          </div>
          {linked.ai_summary && (
            <p className="text-xs text-slate-600 line-clamp-2">{linked.ai_summary.summary}</p>
          )}
          <p className="text-[10px] text-purple-500 italic">Linked meeting record will appear in the Meetings module.</p>
        </div>
      ) : (
        <p className="text-xs text-purple-500 italic">A meeting record will be auto-created when you save this entry.</p>
      )}
    </div>
  );
});

import React, { memo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConflictWarningProps {
  conflicts: { message: string }[];
}

export const ConflictWarning = memo(function ConflictWarning({ conflicts }: ConflictWarningProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
      <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-sm font-bold text-amber-700">Schedule Conflict Detected</p>
        {conflicts.map((c, i) => (
          <p key={i} className="text-xs text-amber-600">{c.message}</p>
        ))}
      </div>
    </div>
  );
});

import React, { memo } from 'react';
import { Copy, RotateCcw } from 'lucide-react';

interface OverrideBannersProps {
  isRecurringEntry: boolean;
  isOverrideEntry: boolean;
  isOverrideMode: boolean;
  contextDate?: string;
  formDate?: string;
  onCreateOverride?: () => void;
  onDeleteOverride?: () => void;
  hasCreateOverrideHandler: boolean;
  hasDeleteOverrideHandler: boolean;
}

export const OverrideBanners = memo(function OverrideBanners({
  isRecurringEntry,
  isOverrideEntry,
  isOverrideMode,
  contextDate,
  formDate,
  onCreateOverride,
  onDeleteOverride,
  hasCreateOverrideHandler,
  hasDeleteOverrideHandler,
}: OverrideBannersProps) {
  return (
    <>
      {isRecurringEntry && contextDate && !isOverrideMode && hasCreateOverrideHandler && (
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2">
            <Copy size={16} className="text-amber-600" />
            <span className="text-sm text-amber-700">This is a recurring entry. Changes will affect all weeks.</span>
          </div>
          <button
            type="button"
            onClick={onCreateOverride}
            className="px-4 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1"
          >
            <Copy size={12} />
            Only modify {contextDate}
          </button>
        </div>
      )}

      {isOverrideEntry && hasDeleteOverrideHandler && (
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2">
            <Copy size={16} className="text-amber-600" />
            <span className="text-sm text-amber-700">This is a single-day override for {formDate}.</span>
          </div>
          <button
            type="button"
            onClick={onDeleteOverride}
            className="px-4 py-1.5 bg-slate-600 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1"
          >
            <RotateCcw size={12} />
            Restore Default
          </button>
        </div>
      )}
    </>
  );
});

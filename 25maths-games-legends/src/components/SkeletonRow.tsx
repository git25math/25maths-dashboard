import React from 'react';

export const SkeletonRow = ({ columns = 1 }: { columns?: number }) => {
  return (
    <div className="flex w-full gap-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <div 
          key={i} 
          className="h-6 bg-slate-200/50 rounded-md animate-pulse flex-1"
        />
      ))}
    </div>
  );
};

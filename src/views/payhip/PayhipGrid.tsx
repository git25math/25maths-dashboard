import { memo } from 'react';
import { PayhipItem } from '../../types';
import { PayhipCard } from './PayhipCard';

interface PayhipGridProps {
  items: PayhipItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const PayhipGrid = memo(function PayhipGrid({ items, selectedId, onSelect }: PayhipGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-slate-400">
        No Payhip listings match the current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map(item => (
        <PayhipCard
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </div>
  );
});

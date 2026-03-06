import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

export const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: LucideIcon, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200",
      active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200/50"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    {active && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-400 rounded-r-full" />
    )}
    <Icon size={18} className={cn(!active && "group-hover:scale-110 transition-transform duration-200")} />
    <span className="font-medium text-sm truncate">{label}</span>
  </button>
);

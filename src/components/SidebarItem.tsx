import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

export const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: LucideIcon, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
      active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

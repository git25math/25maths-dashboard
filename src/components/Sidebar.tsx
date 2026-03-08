import { memo, useState } from 'react';
import { CheckCircle2, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SIDEBAR_ITEMS, SIDEBAR_GROUPS } from '../shared/sidebarConfig';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar = memo(function Sidebar({ activeTab, onNavigate, onLogout }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleNavigate = (tab: string) => {
    onNavigate(tab);
    setIsSidebarOpen(false);
  };

  const activeSidebarItem = SIDEBAR_ITEMS.find(item => item.key === activeTab);
  const MobileTabIcon = activeSidebarItem?.icon || CheckCircle2;

  const renderGroups = () =>
    SIDEBAR_GROUPS.map(group => {
      const items = SIDEBAR_ITEMS.filter(i => i.group === group.key);
      if (!items.length) return null;
      const hasActiveItem = items.some(i => i.key === activeTab);
      const isCollapsed = group.label && collapsedGroups.has(group.key) && !hasActiveItem;
      return (
        <div key={group.key}>
          {group.label ? (
            <button
              onClick={() => toggleGroup(group.key)}
              className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-4 pb-1 hover:text-slate-600 transition-colors"
            >
              {group.label}
              <ChevronDown size={12} className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
            </button>
          ) : null}
          {!isCollapsed && (
            <div className="space-y-1">
              {items.map(item => (
                <SidebarItem key={item.key} icon={item.icon} label={item.label} active={activeTab === item.key} onClick={() => handleNavigate(item.key)} />
              ))}
            </div>
          )}
        </div>
      );
    });

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 space-y-6">
        <div className="flex items-center gap-3 px-2 shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">25</div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <nav className="flex-1 overflow-y-auto min-h-0 pr-1">
          {renderGroups()}
        </nav>
        <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-100 rounded-2xl shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Role</p>
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
            <CheckCircle2 size={16} /> Math Teacher
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors px-2 shrink-0">
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">25</div>
          <MobileTabIcon size={16} className="text-indigo-600" />
          <span className="font-bold">{activeSidebarItem?.label || 'Dashboard'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600"><Menu size={24} /></button>
        </div>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 flex flex-col shadow-2xl lg:hidden">
              <div className="flex justify-between items-center mb-8 shrink-0">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
              </div>
              <nav className="flex-1 overflow-y-auto min-h-0">
                {renderGroups()}
              </nav>
              <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors px-2 py-3">
                <LogOut size={16} /> Logout
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

import { useState, useRef } from 'react';
import { Settings, User, Lock, Database, Info, Download, Upload, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../components/LoginGate';

interface SettingsViewProps {
  data: Record<string, unknown>;
  onImport?: (data: Record<string, unknown>) => void;
}

const KNOWN_KEYS = ['students', 'teachingUnits', 'classes', 'timetable', 'ideas', 'sops', 'goals', 'schoolEvents', 'workLogs', 'meetings', 'lessonRecords', 'tasks'];

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const SettingsView = ({ data, onImport }: SettingsViewProps) => {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{ data: Record<string, unknown>; keys: string[] } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 4 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const storedHash = import.meta.env.VITE_ACCESS_PASSWORD_HASH || '';
    if (!storedHash) {
      setPasswordMsg({ type: 'error', text: 'No password configured (dev mode).' });
      return;
    }

    const currentHash = await sha256(currentPassword);
    if (currentHash !== storedHash) {
      setPasswordMsg({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }

    const newHash = await sha256(newPassword);
    const token = { hash: newHash, timestamp: Date.now() };
    localStorage.setItem('dashboard-auth-token', JSON.stringify(token));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg({ type: 'success', text: 'Password updated for this session. Update VITE_ACCESS_PASSWORD_HASH in .env to persist.' });
  };

  const handleClearCache = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('dashboard-'));
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `25maths-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportPreview(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          setImportError('Invalid format: expected a JSON object.');
          return;
        }
        const recognized = KNOWN_KEYS.filter(k => k in parsed && Array.isArray(parsed[k]));
        if (recognized.length === 0) {
          setImportError('No recognized data keys found in file.');
          return;
        }
        setImportPreview({ data: parsed, keys: recognized });
      } catch {
        setImportError('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const confirmImport = () => {
    if (importPreview && onImport) {
      onImport(importPreview.data);
      setImportPreview(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={24} className="text-indigo-600" /> Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">Manage your profile and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <User size={18} className="text-indigo-600" /> Profile
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-500">Role</span>
              <span className="text-sm font-bold text-slate-900">Math Teacher</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-500">App Version</span>
              <span className="text-sm font-bold text-slate-900">v1.0</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 text-red-600 font-bold text-sm border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Change Password */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Lock size={18} className="text-indigo-600" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
            {passwordMsg && (
              <p className={cn("text-xs font-medium", passwordMsg.type === 'success' ? "text-emerald-600" : "text-red-600")}>
                {passwordMsg.text}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Data Management */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Database size={18} className="text-indigo-600" /> Data Management
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 font-bold text-sm border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Clear Local Cache
            </button>
            <p className="text-[10px] text-slate-400">Removes all locally stored data and reloads the app with defaults.</p>
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-indigo-600 font-bold text-sm border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              <Download size={14} /> Export Data as JSON
            </button>
            <p className="text-[10px] text-slate-400">Downloads all your data as a JSON file for backup.</p>

            {/* Import */}
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-emerald-600 font-bold text-sm border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <Upload size={14} /> Import Data
            </button>
            <p className="text-[10px] text-slate-400">Import a previously exported JSON backup to restore your data.</p>

            {importError && (
              <p className="text-xs font-medium text-red-600">{importError}</p>
            )}

            {importPreview && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <p className="text-sm font-bold text-amber-800">Confirm Import</p>
                <p className="text-xs text-amber-700">The following data will be replaced:</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  {importPreview.keys.map(k => (
                    <li key={k} className="flex justify-between">
                      <span>{k}</span>
                      <span className="font-bold">{(importPreview.data[k] as unknown[]).length} items</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={confirmImport}
                    className="flex-1 py-2 bg-amber-600 text-white font-bold text-xs rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Confirm Import
                  </button>
                  <button
                    onClick={() => setImportPreview(null)}
                    className="flex-1 py-2 bg-white text-slate-600 font-bold text-xs border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Info size={18} className="text-indigo-600" /> About
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm font-bold text-slate-900">25Maths Dashboard</p>
              <p className="text-xs text-slate-500 mt-1">A personal teaching dashboard for managing lessons, students, goals, and more.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tech Stack</p>
              <p className="text-xs text-slate-600">React 19 + TypeScript + Vite + Tailwind CSS</p>
            </div>
            <a
              href="https://github.com/git25math/25maths-dashboard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 text-slate-600 font-bold text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ExternalLink size={14} /> GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

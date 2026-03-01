import { useState, useEffect, FormEvent } from 'react';
import { Lock } from 'lucide-react';

const STORAGE_KEY = 'dashboard-auth-token';
const PASSWORD_HASH = import.meta.env.VITE_ACCESS_PASSWORD_HASH || '';

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check stored auth on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token === PASSWORD_HASH && PASSWORD_HASH) {
      setAuthorized(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const hash = await sha256(password);
    if (hash === PASSWORD_HASH) {
      localStorage.setItem(STORAGE_KEY, hash);
      setAuthorized(true);
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  // No hash configured = no protection (dev mode)
  if (!PASSWORD_HASH) return <>{children}</>;
  if (checking) return null;
  if (authorized) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">25</div>
          <h1 className="text-xl font-bold">25Maths Dashboard</h1>
          <p className="text-sm text-slate-400">Enter password to access</p>
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

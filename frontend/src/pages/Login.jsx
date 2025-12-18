import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-950/30 border border-orange-500/20 flex items-center justify-center mb-3">
            <LogIn className="w-6 h-6 text-orange-500" />
          </div>
          <h1 className="font-bold text-2xl text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/50 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/signup" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">Sign Up</Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 text-sm text-slate-500 dark:text-slate-400">
        <div className="font-semibold text-slate-800 dark:text-slate-300 mb-2 flex items-center gap-2">
          <span>🔑 Demo Credentials</span>
        </div>
        <div className="grid gap-2">
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="font-medium text-slate-700 dark:text-slate-300">Customer</span>
            <code className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">customer@example.com</code>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="font-medium text-slate-700 dark:text-slate-300">Organizer</span>
            <code className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">organizer@example.com</code>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="font-medium text-slate-700 dark:text-slate-300">Admin</span>
            <code className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">admin@example.com</code>
          </div>
          <div className="text-xs text-center mt-1 text-slate-500">Password for all: <code className="text-slate-400">password</code></div>
        </div>
      </div>
    </div>
  );
}

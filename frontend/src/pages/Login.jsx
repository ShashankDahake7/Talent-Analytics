import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user: userData } = await api.post('/auth/login', { email, password });
      login(userData, token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-white">Talent Analytics</h1>
          <p className="text-ink-400 mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="label text-ink-200">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input bg-ink-900/50 border-ink-700 text-white placeholder-ink-500 focus:border-sage-500 focus:ring-sage-500"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="label text-ink-200">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input bg-ink-900/50 border-ink-700 text-white placeholder-ink-500 focus:border-sage-500 focus:ring-sage-500"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

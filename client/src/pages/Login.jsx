import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-neutral-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-neutral-50 font-['Space_Grotesk',sans-serif]">Welcome back</h1>
          <p className="text-neutral-500 mt-2">Sign in to your SyncLab workspace</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 text-red-400 text-sm rounded-lg border border-red-900/60">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@company.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="Enter your password" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
            <p className="text-sm text-neutral-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
                Get started free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

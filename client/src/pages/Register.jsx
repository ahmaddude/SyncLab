import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 overflow-hidden">
      <div aria-hidden className="absolute top-1/4 -left-40 w-[26rem] h-[26rem] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 -right-40 w-[30rem] h-[30rem] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="relative w-11 h-11 rotate-45 border border-gold/40 bg-gold/10 flex items-center justify-center shrink-0 rounded-lg">
              <svg className="w-5 h-5 text-gold -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white tracking-tight">SyncLab</div>
              <div className="text-xs font-medium text-gold tracking-wide">Work together, ship faster</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-gray-400 mt-2">Start collaborating with your team</p>
        </div>

        <div className="bg-ink-900 border border-line rounded-2xl glow-gold p-8">
          {error && (
            <div className="mb-6 bg-coral/10 text-coral border border-coral/20 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Full name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-ink-950 border border-line rounded-xl px-4 py-3.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gold/40" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ink-950 border border-line rounded-xl px-4 py-3.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gold/40" placeholder="you@company.com" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink-950 border border-line rounded-xl px-4 py-3.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gold/40" placeholder="At least 6 characters" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gold text-ink-950 hover:bg-gold-hover font-semibold transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-line text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-gold hover:text-gold-hover transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

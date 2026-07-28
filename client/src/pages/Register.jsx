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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-[34px] leading-none text-brand-900 font-heading tracking-tight">Create your account</h1>
          <p className="text-brand-500 mt-2">Start collaborating with your team</p>
        </div>

        <div className="bg-white border border-brand-300">
          <div className="px-6 py-4 border-b border-brand-200">
            <h2 className="text-[15px] font-semibold text-brand-900 font-heading">Create Account</h2>
          </div>

          {error && (
            <div className="mx-6 mt-4 px-4 py-3 bg-[#FBEEEE] text-[#9B3B3B] text-sm border-l-2 border-[#9B3B3B]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">Full name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="input-field" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@company.com" />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="At least 6 characters" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : 'Create account'}
              </button>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-brand-200 text-center">
            <p className="text-sm text-brand-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-800 hover:text-brand-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

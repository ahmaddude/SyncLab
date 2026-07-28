import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-brand-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand-800 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-brand-900 font-heading tracking-tight">SyncLab</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            <Notifications />

            <div className="h-6 w-px bg-brand-300 mx-1" />

            <div className="flex items-center gap-3 pl-1">
              <div className="w-8 h-8 bg-brand-100 border border-brand-300 flex items-center justify-center text-brand-600 text-sm font-semibold">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-brand-900 leading-tight">{user.name}</p>
              </div>
              <button onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-brand-500 hover:text-brand-900 hover:bg-brand-100 transition-colors">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

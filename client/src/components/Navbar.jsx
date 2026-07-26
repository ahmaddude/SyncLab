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
    <nav className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-neutral-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-neutral-50 font-['Space_Grotesk',sans-serif]">SyncLab</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            <Notifications />

            <div className="h-6 w-px bg-neutral-800 mx-1" />

            <div className="flex items-center gap-3 pl-1">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 text-sm font-semibold">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-neutral-200 leading-tight">{user.name}</p>
              </div>
              <button onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 shrink-0 border-b border-line flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-ink-950/80 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          title="Toggle sidebar"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-line bg-ink-900 text-gray-400 hover:text-white hover:bg-ink-850 transition-colors shrink-0"
        >
          <i className="fa-solid fa-bars-staggered text-sm"></i>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Notifications />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 ring-1 ring-gold/20 flex items-center justify-center text-gold text-sm font-semibold shrink-0 hover:bg-gold/20 transition-colors overflow-hidden"
            title={user?.name || 'Account'}
          >
            {user?.name?.[0]?.toUpperCase() || '?'}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-ink-900 border border-line shadow-2xl z-50 overflow-hidden rounded-lg">
              <div className="px-4 py-3 border-b border-line">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-coral hover:bg-ink-800 transition-colors"
              >
                <i className="fa-solid fa-right-from-bracket w-4 text-center"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = (data) => {
      if (data.user === user?.id) {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    };
    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [socket, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await api.get('/notifications/unread');
      setUnreadCount(data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return { color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'task_updated': return { color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'comment_added': return { color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'chat_message': return { color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'member_added': return { color: 'text-emerald-600', bg: 'bg-emerald-50' };
      default: return { color: 'text-brand-500', bg: 'bg-brand-100' };
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 text-brand-400 hover:text-brand-900 hover:bg-brand-100 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#9B3B3B] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-brand-300 shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-200">
            <h3 className="font-semibold text-brand-900 font-heading">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs font-medium text-brand-800 hover:text-brand-700 transition-colors">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-brand-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-brand-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const icon = getIcon(n.type);
                return (
                  <div key={n._id}
                    onClick={() => {
                      if (!n.read) handleMarkOneRead(n._id);
                      if (n.link) setOpen(false);
                    }}
                    className={`px-5 py-3.5 border-b border-brand-200/50 cursor-pointer hover:bg-brand-50 transition-colors ${
                      !n.read ? 'bg-brand-800/5' : ''
                    }`}>
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 ${icon.bg} flex items-center justify-center shrink-0`}>
                        <svg className={`w-4 h-4 ${icon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-brand-900 leading-snug">{n.title}</p>
                        <span className="text-[11px] text-brand-500 mt-0.5 block">{getTimeAgo(n.createdAt)}</span>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-brand-800 shrink-0 mt-1.5" />
                      )}
                    </div>
                    {n.link && (
                      <Link to={n.link} onClick={() => setOpen(false)}
                        className="block mt-1.5 ml-11 text-xs font-medium text-brand-800 hover:text-brand-700 transition-colors">
                        View →
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

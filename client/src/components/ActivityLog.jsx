import { useState, useEffect } from 'react';
import api from '../utils/api';

const ACTION_ICONS = {
  task_created: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M12 4v16m8-8H4' },
  task_updated: { color: 'text-blue-600', bg: 'bg-blue-50', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  task_moved: { color: 'text-purple-600', bg: 'bg-purple-50', icon: 'M13 7l5 5m0 0l-5 5m5-5H6' },
  task_deleted: { color: 'text-red-600', bg: 'bg-red-50', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
  comment_added: { color: 'text-brand-800', bg: 'bg-brand-100', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
};

const DEFAULT_ICON = { color: 'text-brand-400', bg: 'bg-brand-100', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' };

export default function ActivityLog({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchActivity(); }, [projectId]);

  const fetchActivity = async () => {
    try {
      const data = await api.get(`/activity?project=${projectId}`);
      setActivities(data);
    } catch (err) {
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="text-sm text-brand-500 py-4">Loading activity...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-sm text-brand-500 py-4">No activity yet.</div>;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const style = ACTION_ICONS[activity.action] || DEFAULT_ICON;
        return (
          <div key={activity._id} className="flex gap-3">
            <div className={`w-7 h-7 ${style.bg} flex items-center justify-center shrink-0`}>
              <svg className={`w-3.5 h-3.5 ${style.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-500">
                <span className="font-medium text-brand-900">{activity.user?.name || 'Someone'}</span>
                {' '}
                <span>{activity.details}</span>
              </p>
              <span className="text-[11px] text-brand-500">{getTimeAgo(activity.createdAt)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

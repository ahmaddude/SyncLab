import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function ActivityLog({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, [projectId]);

  const fetchActivity = async () => {
    try {
      const data = await api.get(`/activity?project=${projectId}`);
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (action) => {
    switch (action) {
      case 'task_created': return '➕';
      case 'task_updated': return '✏️';
      case 'task_moved': return '➡️';
      case 'task_deleted': return '🗑️';
      case 'comment_added': return '💬';
      default: return '📌';
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
    return <div className="text-sm text-gray-400 py-4">Loading activity...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-sm text-gray-400 py-4">No activity yet.</div>;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity._id} className="flex gap-3">
          <span className="text-sm">{getIcon(activity.action)}</span>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{activity.user?.name || 'Someone'}</span>
              {' '}
              <span className="text-gray-500">{activity.details}</span>
            </p>
            <span className="text-[11px] text-gray-400">
              {getTimeAgo(activity.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CalendarWidget from '../components/CalendarWidget';

const STATUS_ICONS = {
  done: 'fa-solid fa-circle-check text-emerald text-sm',
  in_progress: 'fa-solid fa-spinner text-gold text-sm animate-spin',
  review: 'fa-solid fa-eye text-gold text-sm',
  todo: 'fa-regular fa-circle text-gray-500 text-sm',
};

const PRIORITY_BADGES = {
  urgent: { label: 'Urgent', cls: 'bg-coral/10 text-coral' },
  high: { label: 'High', cls: 'bg-coral/10 text-coral' },
  medium: { label: 'Medium', cls: 'bg-gold/10 text-gold' },
  low: { label: 'Low', cls: 'bg-ink-800 border border-line text-gray-400' },
};

const ACTIVITY_ICONS = {
  task_created: { icon: 'fa-solid fa-code-branch text-xs', cls: 'bg-gold/10 text-gold' },
  task_updated: { icon: 'fa-solid fa-bolt text-xs', cls: 'bg-emerald/10 text-emerald' },
  task_moved: { icon: 'fa-solid fa-arrow-right-arrow-left text-xs', cls: 'bg-gold/10 text-gold' },
  task_deleted: { icon: 'fa-solid fa-trash-can text-xs', cls: 'bg-coral/10 text-coral' },
  comment_added: { icon: 'fa-solid fa-comment text-xs', cls: 'bg-gold/10 text-gold' },
};

const DEFAULT_ACTIVITY_ICON = { icon: 'fa-solid fa-rocket text-xs', cls: 'bg-ink-800 border border-line text-gray-300' };

function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchSummary(); }, []);

  const fetchSummary = async () => {
    try {
      const data = await api.get('/dashboard/summary');
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/orgs', { name, description });
      setName(''); setDescription(''); setShowCreate(false);
      fetchSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-7 h-7 border-2 border-ink-800 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'there';
  const totalTasks = summary ? summary.taskStats.todo + summary.taskStats.in_progress + summary.taskStats.review + summary.taskStats.done : 0;
  const inProgressPct = totalTasks > 0 ? Math.round((summary.taskStats.in_progress / totalTasks) * 100) : 0;

  const activityList = summary?.recentActivity || [];

  return (
    <div className="px-8 py-7">
      {error && (
        <div className="mb-6 px-4 py-3 bg-coral/10 text-coral text-sm border-l-2 border-coral/40 rounded-r-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-coral/70 hover:text-coral"><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      {/* Greeting */}
      <section className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Welcome back, {firstName}</h2>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's moving across your workspace today.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gold/40 bg-gold/10 text-sm text-gold hover:bg-gold/20 transition-colors shrink-0"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          New Organization
        </button>
      </section>

      {/* KPI row */}
      <section className="grid grid-cols-4 gap-5 mb-6">
        <div className="bg-ink-850 border border-line rounded-xl p-5 relative overflow-hidden group hover:border-gold/30 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400">Active Projects</p>
              <p className="text-3xl font-semibold text-white mt-1.5">{summary?.projectCount || 0}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold"><i className="fa-solid fa-folder-open"></i></div>
          </div>
        </div>

        <div className="bg-ink-850 border border-line rounded-xl p-5 relative overflow-hidden group hover:border-gold/30 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Tasks</p>
              <p className="text-3xl font-semibold text-white mt-1.5">{totalTasks}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold"><i className="fa-solid fa-list-check"></i></div>
          </div>
          <svg viewBox="0 0 100 30" className="mt-2 h-7 w-full" preserveAspectRatio="none">
            <path d="M0 26 Q15 10 30 18 T60 12 T100 4" fill="none" stroke="#d4af37" strokeWidth="2" className="spark" />
          </svg>
        </div>

        <div className="bg-ink-850 border border-line rounded-xl p-5 relative overflow-hidden group hover:border-gold/30 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400">In Progress</p>
              <p className="text-3xl font-semibold text-white mt-1.5">{summary?.taskStats.in_progress || 0}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold"><i className="fa-solid fa-spinner"></i></div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-ink-800 overflow-hidden"><div className="h-full bg-gold rounded-full transition-all" style={{ width: `${inProgressPct}%` }}></div></div>
            <span className="text-[11px] text-gray-400">{inProgressPct}%</span>
          </div>
        </div>

        <div className="bg-ink-850 border border-line rounded-xl p-5 relative overflow-hidden group hover:border-gold/30 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400">Completed</p>
              <p className="text-3xl font-semibold text-white mt-1.5">{summary?.taskStats.done || 0}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald"><i className="fa-solid fa-circle-check"></i></div>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="grid grid-cols-12 gap-6 items-start">

        {/* Primary column */}
        <div className="col-span-8 space-y-6">

          {/* My Tasks */}
          <div className="bg-ink-850 border border-line rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h3 className="text-sm font-semibold text-white">My Tasks</h3>
            </div>
            {summary?.myTasks?.length > 0 ? (
              <div className="divide-y divide-line/60">
                {summary.myTasks.map((task) => {
                  const isUrgent = task.priority === 'urgent' || task.priority === 'high';
                  const icon = isUrgent ? 'fa-solid fa-circle-exclamation text-coral text-sm' : (STATUS_ICONS[task.status] || STATUS_ICONS.todo);
                  const badge = task.status === 'done'
                    ? { label: 'Done', cls: 'bg-emerald/10 text-emerald' }
                    : (PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium);
                  return (
                    <Link
                      key={task._id}
                      to={`/projects/${task.project?._id || ''}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink-800/50 transition-colors"
                    >
                      <i className={icon}></i>
                      <span className="flex-1 text-sm text-gray-200 truncate">{task.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.cls}`}>{badge.label}</span>
                      <div className="w-7 h-7 rounded-full bg-ink-800 border border-line ring-1 ring-gold/30 flex items-center justify-center text-[10px] font-semibold text-gold shrink-0">
                        {initialsOf(task.assignee?.name || '?')}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-gray-500">No tasks assigned to you yet.</div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-ink-850 border border-line rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            </div>
            {activityList.length > 0 ? (
              <div className="divide-y divide-line/60">
                {activityList.map((activity) => {
                  const style = ACTIVITY_ICONS[activity.action] || DEFAULT_ACTIVITY_ICON;
                  return (
                    <div key={activity._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink-800/50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg ${style.cls} flex items-center justify-center shrink-0`}>
                        <i className={style.icon}></i>
                      </div>
                      <span className="flex-1 text-sm text-gray-200 min-w-0">
                        <span className="font-medium text-gray-100">{activity.user?.name || 'Someone'}</span>{' '}
                        <span className="truncate">{activity.details}</span>
                        {activity.project && (
                          <Link to={`/projects/${activity.project._id}`} className="text-gold hover:text-gold-hover ml-1">
                            {activity.project.name}
                          </Link>
                        )}
                      </span>
                      <span className="text-xs text-gray-500 shrink-0">{getTimeAgo(activity.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-gray-500">No activity yet.</div>
            )}
          </div>
        </div>

        {/* Secondary column */}
        <div className="col-span-4 space-y-6">
          <CalendarWidget tasks={summary?.tasksWithDueDates || []} />
        </div>
      </section>

      {/* Create Organization modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md bg-ink-900 border border-line rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <h2 className="text-sm font-semibold text-white">Create Organization</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-2">Name</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Acme Holdings"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-2">Description</label>
                <input
                  type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="What's this org for?"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit" disabled={creating}
                  className="px-4 py-2.5 text-sm font-semibold text-ink-950 bg-gold hover:bg-gold-hover rounded-lg disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating…' : 'Create Organization'}
                </button>
                <button
                  type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

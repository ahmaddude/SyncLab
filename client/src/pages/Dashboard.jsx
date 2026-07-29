import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CalendarWidget from '../components/CalendarWidget';

const SEAL_TONES = [
  { bg: '#1B2A4A', fg: '#C9A66B' },
  { bg: '#2B3A55', fg: '#E5E7EB' },
  { bg: '#0F1F38', fg: '#C9A66B' },
  { bg: '#3A4A63', fg: '#E5E7EB' },
];

const STATUS_MAP = {
  todo: { label: 'To Do', bg: 'bg-brand-100', text: 'text-brand-600' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-600' },
  review: { label: 'Review', bg: 'bg-amber-50', text: 'text-amber-600' },
  done: { label: 'Done', bg: 'bg-emerald-50', text: 'text-emerald-600' },
};

const PRIORITY_MAP = {
  low: { bg: 'bg-brand-100', text: 'text-brand-600' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-600' },
  high: { bg: 'bg-amber-50', text: 'text-amber-600' },
  urgent: { bg: 'bg-red-50', text: 'text-red-600' },
};

const ACTIVITY_ICONS = {
  task_created: { color: 'text-gold-600', bg: 'bg-brand-800', d: 'M12 4v16m8-8H4' },
  task_updated: { color: 'text-gold-500', bg: 'bg-brand-700', d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  task_moved: { color: 'text-gold-400', bg: 'bg-brand-800', d: 'M13 7l5 5m0 0l-5 5m5-5H6' },
  task_deleted: { color: 'text-red-400', bg: 'bg-red-900/30', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
  comment_added: { color: 'text-gold-500', bg: 'bg-brand-700', d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
};

const DEFAULT_ACTIVITY_ICON = { color: 'text-brand-400', bg: 'bg-brand-100', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' };

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
  const [orgs, setOrgs] = useState([]);
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
      setOrgs(data.orgs);
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
      const org = await api.post('/orgs', { name, description });
      setOrgs([org, ...orgs]);
      setName(''); setDescription(''); setShowCreate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-7 h-7 border-2 border-brand-300 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalTasks = summary ? summary.taskStats.todo + summary.taskStats.in_progress + summary.taskStats.review + summary.taskStats.done : 0;

  return (
    <div className="min-h-screen">
      <div className="h-[3px] bg-brand-800" />
      <div className="h-px bg-gold-400" />
      <div className="h-px bg-brand-800 mt-px" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        <div className="flex items-end justify-between mb-10 pb-6 border-b border-brand-300">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-gold-500 uppercase mb-2">
              Workspace Overview
            </p>
            <h1 className="text-[34px] leading-none text-brand-900 font-heading tracking-tight">
              {user?.name ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Dashboard'}
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gold-500 hover:bg-gold-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Organization
          </button>
        </div>

        {error && (
          <div className="mb-8 px-4 py-3 bg-[#FBEEEE] text-[#9B3B3B] text-sm border-l-2 border-[#9B3B3B]">
            {error}
          </div>
        )}

        {showCreate && (
          <div className="mb-10 border border-brand-200">
            <div className="bg-brand-800 px-6 py-4">
              <h2 className="text-[15px] font-semibold text-white font-heading">
                Create Organization
              </h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5 bg-white">
              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">
                  Name
                </label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Acme Holdings"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">
                  Description
                </label>
                <input
                  type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="What's this org for?"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit" disabled={creating}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-gold-500 hover:bg-gold-600 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating\u2026' : 'Create Organization'}
                </button>
                <button
                  type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 text-sm font-medium text-brand-500 hover:text-brand-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <StatCard label="Projects" value={summary.projectCount} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <StatCard label="Total Tasks" value={totalTasks} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            <StatCard label="In Progress" value={summary.taskStats.in_progress} icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            <StatCard label="Completed" value={summary.taskStats.done} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </div>
        )}

        {summary && summary.myTasks.length > 0 && (
          <div className="mb-10 border border-brand-200">
            <div className="bg-brand-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white font-heading">My Tasks</h2>
              <span className="text-xs text-gold-400 font-medium">{summary.myTasks.length} assigned to you</span>
            </div>
            <div className="divide-y divide-brand-200 bg-white">
              {summary.myTasks.map((task) => {
                const s = STATUS_MAP[task.status] || STATUS_MAP.todo;
                const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
                return (
                  <Link
                    key={task._id}
                    to={`/projects/${task.project?._id || ''}`}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-brand-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-900 group-hover:text-brand-800 truncate">{task.title}</p>
                      <p className="text-xs text-brand-500 mt-0.5">{task.project?.name || 'Unknown project'}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${p.bg} ${p.text}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="shrink-0 text-[11px] text-brand-500 w-20 text-right">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {summary && summary.myTasks.length === 0 && totalTasks > 0 && (
          <div className="mb-10 bg-white border border-brand-200 px-6 py-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-brand-900">All caught up</p>
              <p className="text-xs text-brand-500">No tasks are currently assigned to you.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-gold-500 uppercase mb-4">
              Calendar
            </p>
            <CalendarWidget tasks={summary?.tasksWithDueDates || []} />

            <div className="mt-14">
              <h2 className="text-[11px] font-semibold tracking-[0.18em] text-gold-500 uppercase mb-4">
                Organizations
              </h2>
          {orgs.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-brand-300">
                <div className="w-14 h-14 border border-gold-400 flex items-center justify-center mx-auto mb-5 bg-brand-800">
                  <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-brand-900 mb-2 font-heading">
                  No organizations yet
                </h3>
                <p className="text-brand-500 max-w-sm mx-auto text-sm">
                  Create your first organization to start collaborating with your team.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {orgs.map((org, i) => {
                  const tone = SEAL_TONES[i % SEAL_TONES.length];
                  return (
                    <Link
                      key={org._id}
                      to={`/organizations/${org._id}`}
                      className="group block bg-white border border-brand-300 hover:border-gold-400 hover:shadow-[0_2px_12px_rgba(201,166,107,0.15)] transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start gap-4 p-5 pb-4">
                        <div
                          className="w-11 h-11 flex items-center justify-center shrink-0 text-[15px] font-semibold font-heading"
                          style={{ backgroundColor: tone.bg, color: tone.fg }}
                        >
                          {initialsOf(org.name)}
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <h3 className="font-semibold text-brand-900 truncate group-hover:text-brand-800">
                            {org.name}
                          </h3>
                          <p className="text-xs text-brand-500 mt-1 tracking-wide uppercase">
                            {org.members.length} {org.members.length === 1 ? 'Member' : 'Members'}
                          </p>
                        </div>
                      </div>
                      {org.description && (
                        <p className="px-5 text-sm text-brand-500 line-clamp-2 leading-relaxed">
                          {org.description}
                        </p>
                      )}
                      <div className="mt-4 px-5 py-3 border-t border-brand-200 flex items-center gap-1.5">
                        {org.members.slice(0, 5).map((m) => (
                          <div
                            key={m.user._id}
                            className="w-6 h-6 bg-brand-800 border border-white ring-1 ring-gold-400 flex items-center justify-center text-[9px] font-semibold text-gold-400 -ml-1.5 first:ml-0"
                          >
                            {m.user.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
        </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] text-gold-500 uppercase mb-4">
              Recent Activity
            </h2>
            <div className="border border-brand-200">
              {summary && summary.recentActivity.length > 0 && (
                <div className="bg-brand-800 px-5 py-3">
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-gold-400 uppercase">Latest Updates</span>
                </div>
              )}
              {summary && summary.recentActivity.length > 0 ? (
                <div className="divide-y divide-brand-200 bg-white">
                  {summary.recentActivity.map((activity) => {
                    const style = ACTIVITY_ICONS[activity.action] || DEFAULT_ACTIVITY_ICON;
                    return (
                      <div key={activity._id} className="px-5 py-3.5 flex gap-3">
                        <div className={`w-7 h-7 ${style.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <svg className={`w-3.5 h-3.5 ${style.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.d} />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-brand-500 leading-snug">
                            <span className="font-medium text-brand-900">{activity.user?.name || 'Someone'}</span>
                            {' '}
                            <span>{activity.details}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-brand-500">{getTimeAgo(activity.createdAt)}</span>
                            {activity.project && (
                              <>
                                <span className="text-brand-300">&middot;</span>
                                <Link
                                  to={`/projects/${activity.project._id}`}
                                  className="text-[11px] text-brand-800 hover:text-brand-700 font-medium transition-colors"
                                >
                                  {activity.project.name}
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-brand-500">No activity yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-brand-800 border border-brand-700 p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold-400" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold tracking-[0.18em] text-gold-400 uppercase">{label}</span>
        <div className="w-8 h-8 bg-brand-700 flex items-center justify-center">
          <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-[28px] leading-none text-gold-400 font-heading tracking-tight">{value}</p>
    </div>
  );
}

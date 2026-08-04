import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ACTIVITY_ICONS = {
  task_created: { icon: 'fa-solid fa-code-branch text-xs', cls: 'bg-gold/10 text-gold' },
  task_updated: { icon: 'fa-solid fa-bolt text-xs', cls: 'bg-emerald/10 text-emerald' },
  task_moved: { icon: 'fa-solid fa-arrow-right-arrow-left text-xs', cls: 'bg-gold/10 text-gold' },
  task_deleted: { icon: 'fa-solid fa-trash-can text-xs', cls: 'bg-coral/10 text-coral' },
  comment_added: { icon: 'fa-solid fa-comment text-xs', cls: 'bg-gold/10 text-gold' },
};

const DEFAULT_ACTIVITY_ICON = { icon: 'fa-solid fa-rocket text-xs', cls: 'bg-ink-800 border border-line text-gray-300' };

const ROLE_STYLES = {
  owner: { bg: 'bg-gold/15', text: 'text-gold', border: 'border border-gold/30' },
  admin: { bg: 'bg-ink-800', text: 'text-gold', border: 'border border-line' },
  member: { bg: 'bg-ink-800', text: 'text-gray-400', border: 'border border-line' },
};

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

export default function OrgPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [orgData, wsData, actData] = await Promise.all([
        api.get(`/orgs/${id}`),
        api.get(`/workspaces?org=${id}`),
        api.get(`/activity?organization=${id}`),
      ]);
      setOrg(orgData);
      setWorkspaces(wsData);
      setActivities(actData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const ws = await api.post('/workspaces', { name: wsName, description: wsDesc, organization: id });
      setWorkspaces([ws, ...workspaces]);
      setWsName(''); setWsDesc(''); setShowCreateWs(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await api.post(`/orgs/${id}/members`, { email: inviteEmail });
      setInviteEmail(''); setShowInvite(false); fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-7 h-7 border-2 border-line border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-400">Organization not found.</p>
      </div>
    );
  }

  const myRole = org.members.find((m) => m.user._id === user?.id)?.role;
  const canInvite = myRole === 'owner' || myRole === 'admin';
  const canManageWs = myRole === 'owner';
  const canRemove = myRole === 'owner' || myRole === 'admin';
  const canChangeRole = myRole === 'owner';

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-2 text-xs text-gray-500 flex flex-wrap items-center">
          <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-sm font-medium text-white">{org.name}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-gold uppercase mb-1">Organization</p>
            <h1 className="text-[26px] leading-tight text-white font-heading tracking-tight">{org.name}</h1>
            {org.description && <p className="text-gray-400 mt-1 text-sm">{org.description}</p>}
          </div>
          <div className="flex gap-3 shrink-0">
            {canInvite && (
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 bg-ink-900 border border-line hover:border-gold/30 hover:text-white rounded-lg transition-colors"
              >
                <i className="fa-solid fa-user-plus text-xs"></i>
                Invite
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-coral/10 text-coral text-sm border-l-2 border-coral rounded-r-lg">
            {error}
          </div>
        )}

        {showInvite && (
          <div className="mb-6 border border-line rounded-xl overflow-hidden bg-ink-900">
            <div className="bg-ink-800 px-6 py-4 border-b border-line">
              <h2 className="text-sm font-semibold text-white">Invite Member</h2>
            </div>
            <form onSubmit={handleInvite} className="p-6 flex flex-col sm:flex-row gap-3 bg-ink-900">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 input-field"
                placeholder="member@example.com"
              />
              <button
                type="submit"
                disabled={inviting}
                className="px-4 py-2.5 text-sm font-semibold text-ink-950 bg-gold hover:bg-gold-hover rounded-lg disabled:opacity-50 transition-colors"
              >
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {canManageWs && showCreateWs && (
              <div className="border border-line rounded-xl bg-ink-850 overflow-hidden">
                <div className="bg-ink-900/60 border-b border-line px-6 py-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Create Workspace</h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateWs(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                </div>
                <form onSubmit={handleCreateWorkspace} className="p-6 space-y-5 bg-ink-850">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={wsName}
                      onChange={(e) => setWsName(e.target.value)}
                      className="input-field"
                      placeholder="Engineering Team"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Description</label>
                    <input
                      type="text"
                      value={wsDesc}
                      onChange={(e) => setWsDesc(e.target.value)}
                      className="input-field"
                      placeholder="What's this workspace for?"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2.5 text-sm font-semibold text-ink-950 bg-gold hover:bg-gold-hover rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                  Your Workspaces
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{workspaces.length} total</span>
                  {canManageWs && !showCreateWs && (
                    <button
                      onClick={() => setShowCreateWs(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/40 bg-gold/10 text-xs font-medium text-gold hover:bg-gold/20 transition-colors"
                    >
                      <i className="fa-solid fa-plus text-[10px]"></i>
                      New Workspace
                    </button>
                  )}
                </div>
              </div>
              {workspaces.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-line rounded-xl">
                  <div className="w-14 h-14 border border-gold/30 flex items-center justify-center mx-auto mb-5 bg-ink-800 rounded-xl">
                    <i className="fa-solid fa-layer-group text-gold text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 font-heading">No workspaces yet</h3>
                  <p className="text-gray-400 text-sm">Create one to start organizing projects.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {workspaces.map((ws) => (
                    <Link
                      key={ws._id}
                      to={`/workspaces/${ws._id}`}
                      className="group block bg-ink-850 border border-line hover:border-gold/40 hover:shadow-[0_2px_12px_rgba(212,175,55,0.15)] transition-all p-5 relative overflow-hidden rounded-xl"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-ink-800 border border-line flex items-center justify-center text-gold font-bold text-sm font-heading rounded-xl">
                          {ws.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white group-hover:text-gold truncate">{ws.name}</h3>
                          {ws.description && (
                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{ws.description}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-line">
                        Created by {ws.createdBy?.name || 'Unknown'}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="border border-line rounded-xl overflow-hidden bg-ink-850">
              <div className="bg-ink-900/60 px-5 py-4 flex items-center justify-between border-b border-line">
                <div>
                  <h2 className="text-sm font-semibold text-white">Team Members</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{org.members.length} total</p>
                </div>
                {canInvite && (
                  <button
                    onClick={() => setShowInvite(true)}
                    className="text-[11px] font-semibold tracking-wide text-gold hover:text-gold/80 uppercase transition-colors"
                  >
                    + Invite
                  </button>
                )}
              </div>
              <div className="bg-ink-850 divide-y divide-line">
                {org.members.map((m) => {
                  const rs = ROLE_STYLES[m.role] || ROLE_STYLES.member;
                  return (
                    <div key={m.user._id} className="px-5 py-4 flex items-center gap-3 hover:bg-ink-800/50 transition-colors">
                      <div className="w-9 h-9 bg-ink-800 flex items-center justify-center shrink-0 text-[10px] font-semibold text-gold font-heading ring-1 ring-line rounded-full">
                        {initialsOf(m.user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{m.user.name}</p>
                          <span className={`shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${rs.bg} ${rs.text} ${rs.border}`}>
                            {m.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{m.user.email}</p>
                      </div>
                      {m.user._id !== user?.id && (
                        <div className="flex items-center gap-1 shrink-0">
                          {canChangeRole && m.role !== 'owner' && (
                            <select
                              value={m.role}
                              onChange={async (e) => {
                                try {
                                  await api.put(`/orgs/${id}/members/${m.user._id}`, { role: e.target.value });
                                  fetchData();
                                } catch (err) {
                                  setError(err.message);
                                }
                              }}
                              className="text-[10px] bg-ink-950 text-gray-400 border border-line rounded px-1 py-0.5 focus:outline-none"
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                            </select>
                          )}
                          {canRemove && m.role !== 'owner' && (
                            <button
                              onClick={async () => {
                                try {
                                  await api.delete(`/orgs/${id}/members/${m.user._id}`);
                                  fetchData();
                                } catch (err) {
                                  setError(err.message);
                                }
                              }}
                              className="text-gray-500 hover:text-coral transition-colors p-1"
                              title="Remove member"
                            >
                              <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-line rounded-xl bg-ink-850 overflow-hidden">
              <div className="bg-ink-900/60 px-5 py-4 border-b border-line">
                <h2 className="text-sm font-semibold text-white">Org Activity</h2>
              </div>
              {activities.length > 0 ? (
                <div className="divide-y divide-line bg-ink-850">
                  {activities.map((activity) => {
                    const style = ACTIVITY_ICONS[activity.action] || DEFAULT_ACTIVITY_ICON;
                    return (
                      <div key={activity._id} className="px-5 py-3.5 flex gap-3">
                        <div className={`w-8 h-8 ${style.cls} flex items-center justify-center shrink-0 mt-0.5 rounded-lg`}>
                          <i className={style.icon}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-400 leading-snug">
                            <span className="font-medium text-gray-100">{activity.user?.name || 'Someone'}</span>
                            {' '}
                            <span>{activity.details}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-gray-400">{getTimeAgo(activity.createdAt)}</span>
                            {activity.project && (
                              <>
                                <span className="text-gray-600">&middot;</span>
                                <span className="text-[11px] text-gold">{activity.project.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-10 text-center bg-ink-850">
                  <p className="text-sm text-gray-400">No activity yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

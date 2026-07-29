import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function OrgPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [orgData, wsData] = await Promise.all([
        api.get(`/orgs/${id}`),
        api.get(`/workspaces?org=${id}`),
      ]);
      setOrg(orgData);
      setWorkspaces(wsData);
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
      setWsName(''); setWsDesc(''); setShowCreate(false);
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
        <div className="w-7 h-7 border-2 border-brand-300 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-brand-500">Organization not found.</p>
      </div>
    );
  }

  const myRole = org.members.find((m) => m.user._id === user?.id)?.role;
  const canInvite = myRole === 'owner' || myRole === 'admin';
  const canManageWs = myRole === 'owner';
  const canRemove = myRole === 'owner' || myRole === 'admin';
  const canChangeRole = myRole === 'owner';

  return (
    <div className="min-h-screen">
      <div className="h-[3px] bg-brand-800" />
      <div className="h-px bg-gold-400" />
      <div className="h-px bg-brand-800 mt-px" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-2 text-sm text-brand-500">
          <Link to="/dashboard" className="hover:text-brand-800 transition-colors">Dashboard</Link>
          <span className="mx-2 text-brand-300">/</span>
          <span className="text-brand-900 font-medium">{org.name}</span>
        </div>

        <div className="flex items-center justify-between mb-10 pb-6 border-b border-brand-300">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-gold-500 uppercase mb-2">Organization</p>
            <h1 className="text-[34px] leading-none text-brand-900 font-heading tracking-tight">{org.name}</h1>
            {org.description && <p className="text-brand-500 mt-2">{org.description}</p>}
          </div>
          <div className="flex gap-3">
            {canInvite && (
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-500 bg-white border border-brand-300 hover:border-gold-400 hover:text-brand-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Invite
              </button>
            )}
            {canManageWs && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gold-500 hover:bg-gold-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Workspace
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-[#FBEEEE] text-[#9B3B3B] text-sm border-l-2 border-[#9B3B3B]">
            {error}
          </div>
        )}

        {showInvite && (
          <div className="mb-6 border border-brand-200">
            <div className="bg-brand-800 px-6 py-4">
              <h2 className="text-[15px] font-semibold text-white font-heading">Invite Member</h2>
            </div>
            <form onSubmit={handleInvite} className="p-6 flex gap-3 bg-white">
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
                className="px-4 py-2.5 text-sm font-medium text-white bg-gold-500 hover:bg-gold-600 disabled:opacity-50 transition-colors"
              >
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="px-4 py-2.5 text-sm font-medium text-brand-500 hover:text-brand-900 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {showCreate && (
          <div className="mb-6 border border-brand-200">
            <div className="bg-brand-800 px-6 py-4">
              <h2 className="text-[15px] font-semibold text-white font-heading">Create Workspace</h2>
            </div>
            <form onSubmit={handleCreateWorkspace} className="p-6 space-y-5 bg-white">
              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">Name</label>
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
                <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">Description</label>
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
                  className="px-4 py-2.5 text-sm font-medium text-white bg-gold-500 hover:bg-gold-600 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 text-sm font-medium text-brand-500 hover:text-brand-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] text-gold-500 uppercase mb-4">Workspaces</h2>
            {workspaces.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-brand-300">
                <div className="w-14 h-14 border border-gold-400 flex items-center justify-center mx-auto mb-5 bg-brand-800">
                  <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-brand-900 mb-2 font-heading">No workspaces yet</h3>
                <p className="text-brand-500 text-sm">Create one to start organizing projects.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {workspaces.map((ws) => (
                  <Link
                    key={ws._id}
                    to={`/workspaces/${ws._id}`}
                    className="group block bg-white border border-brand-300 hover:border-gold-400 hover:shadow-[0_2px_12px_rgba(201,166,107,0.15)] transition-all p-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-brand-800 border border-brand-700 flex items-center justify-center text-gold-400 font-bold text-sm font-heading">
                        {ws.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-brand-900 group-hover:text-brand-800">{ws.name}</h3>
                        {ws.description && (
                          <p className="text-xs text-brand-500 line-clamp-1 mt-0.5">{ws.description}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-brand-500 mt-3 pt-3 border-t border-brand-200">
                      Created by {ws.createdBy?.name || 'Unknown'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] text-gold-500 uppercase mb-4">Members</h2>
            <div className="border border-brand-200">
              <div className="bg-brand-800 px-5 py-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-gold-400 uppercase">{org.members.length} Members</span>
                {canInvite && (
                  <button
                    onClick={() => setShowInvite(true)}
                    className="text-[11px] font-semibold tracking-wide text-gold-400 hover:text-gold-400 uppercase transition-colors"
                  >
                    + Invite
                  </button>
                )}
              </div>
              <div className="bg-white divide-y divide-brand-100">
                {org.members.map((m) => {
                  const roleStyles = {
                    owner: { bg: 'bg-gold-500', text: 'text-brand-900' },
                    admin: { bg: 'bg-brand-800', text: 'text-gold-400' },
                    member: { bg: 'bg-brand-100', text: 'text-brand-600' },
                  };
                  const rs = roleStyles[m.role] || roleStyles.member;
                  return (
                    <div key={m.user._id} className="px-5 py-4 flex items-start gap-3 hover:bg-brand-50 transition-colors">
                      <div className="w-9 h-9 bg-brand-800 flex items-center justify-center shrink-0 text-[13px] font-semibold text-gold-400 font-heading ring-1 ring-brand-700">
                        {m.user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-brand-900 truncate">{m.user.name}</p>
                          <span className={`shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${rs.bg} ${rs.text}`}>
                            {m.role}
                          </span>
                        </div>
                        {m.user.email && (
                          <p className="text-xs text-brand-500 mt-0.5 truncate">{m.user.email}</p>
                        )}
                        {m.joinedAt && (
                          <p className="text-[11px] text-brand-500 mt-1">
                            Joined {new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
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
                              className="text-[10px] bg-transparent text-brand-500 border border-brand-200 rounded px-1 py-0.5 focus:outline-none"
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
                              className="text-brand-400 hover:text-[#9B3B3B] transition-colors p-1"
                              title="Remove member"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

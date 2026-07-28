import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function OrgPage() {
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
        <div className="w-7 h-7 border-2 border-brand-300 border-t-brand-800 rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen">
      <div className="h-[3px] bg-brand-800" />
      <div className="h-px bg-gold-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-2 text-sm text-brand-500">
          <Link to="/dashboard" className="hover:text-brand-800 transition-colors">Dashboard</Link>
          <span className="mx-2 text-brand-300">/</span>
          <span className="text-brand-900 font-medium">{org.name}</span>
        </div>

        <div className="flex items-center justify-between mb-10 pb-6 border-b border-brand-300">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-400 uppercase mb-2">Organization</p>
            <h1 className="text-[34px] leading-none text-brand-900 font-heading tracking-tight">{org.name}</h1>
            {org.description && <p className="text-brand-500 mt-2">{org.description}</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-500 bg-white border border-brand-300 hover:border-brand-800 hover:text-brand-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Invite
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Workspace
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-[#FBEEEE] text-[#9B3B3B] text-sm border-l-2 border-[#9B3B3B]">
            {error}
          </div>
        )}

        {showInvite && (
          <div className="mb-6 bg-white border border-brand-300">
            <div className="px-6 py-4 border-b border-brand-200">
              <h2 className="text-[15px] font-semibold text-brand-900 font-heading">Invite Member</h2>
            </div>
            <form onSubmit={handleInvite} className="p-6 flex gap-3">
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
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-colors"
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
          <div className="mb-6 bg-white border border-brand-300">
            <div className="px-6 py-4 border-b border-brand-200">
              <h2 className="text-[15px] font-semibold text-brand-900 font-heading">Create Workspace</h2>
            </div>
            <form onSubmit={handleCreateWorkspace} className="p-6 space-y-5">
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
                  className="px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-colors"
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

        <div className="mb-10">
          <h2 className="text-[15px] font-semibold mb-4 text-brand-900 font-heading">Members</h2>
          <div className="flex flex-wrap gap-2">
            {org.members.map((m) => (
              <div
                key={m.user._id}
                className="flex items-center gap-2.5 px-3.5 py-2 bg-white border border-brand-300 text-sm"
              >
                <div className="w-7 h-7 bg-brand-100 border border-brand-300 flex items-center justify-center text-[10px] font-semibold text-brand-600">
                  {m.user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="font-medium text-brand-900">{m.user.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] capitalize bg-brand-800/10 text-brand-800 border border-brand-800/20">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[15px] font-semibold mb-4 text-brand-900 font-heading">Workspaces</h2>
          {workspaces.length === 0 ? (
            <div className="text-center py-16 bg-white border border-brand-300">
              <p className="text-brand-500">No workspaces yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workspaces.map((ws) => (
                <Link
                  key={ws._id}
                  to={`/workspaces/${ws._id}`}
                  className="group block bg-white border border-brand-300 hover:border-brand-800 hover:shadow-[0_2px_12px_rgba(20,27,45,0.08)] transition-all p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-100 border border-brand-300 flex items-center justify-center text-brand-800 font-bold text-sm">
                      {ws.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-900 group-hover:text-brand-800">{ws.name}</h3>
                      {ws.description && (
                        <p className="text-xs text-brand-400 line-clamp-1 mt-0.5">{ws.description}</p>
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
      </div>
    </div>
  );
}

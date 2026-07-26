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
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-neutral-950">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-neutral-950 min-h-screen">
        <p className="text-neutral-500">Organization not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-[\'Public_Sans\',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-2 text-sm text-neutral-500">
          <Link to="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-200 font-medium">{org.name}</span>
        </div>

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-neutral-50 font-[\'Space_Grotesk\',sans-serif] tracking-tight">{org.name}</h1>
            {org.description && <p className="text-neutral-500 mt-1">{org.description}</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-200 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Invite
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Workspace
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 text-red-400 text-sm rounded-lg border border-red-900/60">
            {error}
          </div>
        )}

        {showInvite && (
          <div className="mb-6 rounded-xl p-6 bg-neutral-900 border border-neutral-800">
            <h2 className="text-lg font-semibold mb-4 text-neutral-100 font-['Space_Grotesk',sans-serif]">Invite Member</h2>
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-teal-500"
                placeholder="member@example.com"
              />
              <button
                type="submit"
                disabled={inviting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors"
              >
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {showCreate && (
          <div className="mb-6 rounded-xl p-6 bg-neutral-900 border border-neutral-800">
            <h2 className="text-lg font-semibold mb-4 text-neutral-100 font-['Space_Grotesk',sans-serif]">Create Workspace</h2>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-teal-500"
                  placeholder="Engineering Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
                <input
                  type="text"
                  value={wsDesc}
                  onChange={(e) => setWsDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-teal-500"
                  placeholder="What's this workspace for?"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 text-neutral-100 font-['Space_Grotesk',sans-serif]">Members</h2>
          <div className="flex flex-wrap gap-2">
            {org.members.map((m) => (
              <div
                key={m.user._id}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm"
              >
                <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-300">
                  {m.user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="font-medium text-neutral-300">{m.user.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] capitalize bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 text-neutral-100 font-['Space_Grotesk',sans-serif]">Workspaces</h2>
          {workspaces.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-neutral-900 border border-neutral-800">
              <p className="text-neutral-500">No workspaces yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((ws) => (
                <Link
                  key={ws._id}
                  to={`/workspaces/${ws._id}`}
                  className="block p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 font-bold">
                      {ws.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-100">{ws.name}</h3>
                      {ws.description && (
                        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{ws.description}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-800">
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
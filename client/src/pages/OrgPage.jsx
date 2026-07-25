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

  useEffect(() => {
    fetchData();
  }, [id]);

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
      const ws = await api.post('/workspaces', {
        name: wsName,
        description: wsDesc,
        organization: id,
      });
      setWorkspaces([ws, ...workspaces]);
      setWsName('');
      setWsDesc('');
      setShowCreate(false);
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
      setInviteEmail('');
      setShowInvite(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-57px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500">Organization not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{org.name}</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
          {org.description && <p className="text-gray-500 mt-1">{org.description}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            Invite Member
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
          >
            New Workspace
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      {showInvite && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Invite Member</h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="member@example.com"
            />
            <button
              type="submit"
              disabled={inviting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
            >
              {inviting ? 'Inviting...' : 'Invite'}
            </button>
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {showCreate && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Create Workspace</h2>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Engineering Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={wsDesc}
                onChange={(e) => setWsDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Members ({org.members.length})</h2>
        <div className="flex flex-wrap gap-2">
          {org.members.map((m) => (
            <div
              key={m.user._id}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-xs font-medium">
                {m.user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span>{m.user.name}</span>
              <span className="text-xs text-gray-400 capitalize">({m.role})</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Workspaces</h2>
        {workspaces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No workspaces yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <Link
                key={ws._id}
                to={`/workspaces/${ws._id}`}
                className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{ws.name}</h3>
                {ws.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{ws.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Created by {ws.createdBy?.name || 'Unknown'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

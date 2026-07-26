import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ORG_ICONS = [
  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
];

export default function Dashboard() {
  const [orgs, setOrgs] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchOrgs(); }, []);

  const fetchOrgs = async () => {
    try {
      const data = await api.get('/orgs');
      setOrgs(data);
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
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-['Public_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-neutral-50 font-['Space_Grotesk',sans-serif] tracking-tight">Dashboard</h1>
            <p className="text-neutral-500 mt-1">Your organizations</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Organization
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 text-red-400 text-sm rounded-lg border border-red-900/60">{error}</div>
        )}

        {showCreate && (
          <div className="mb-8 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-neutral-100 font-['Space_Grotesk',sans-serif]">Create Organization</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field" placeholder="My Organization" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="input-field" placeholder="What's this org for?" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={creating}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors">
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {orgs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-100 mb-2 font-['Space_Grotesk',sans-serif]">No organizations yet</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">Create your first organization to start collaborating with your team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgs.map((org, i) => (
              <Link key={org._id} to={`/organizations/${org._id}`}
                className="block p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 transition-colors"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ORG_ICONS[i % ORG_ICONS.length]} />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-neutral-100 truncate">{org.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {org.members.length} {org.members.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                {org.description && (
                  <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">{org.description}</p>
                )}
                <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-1.5">
                  {org.members.slice(0, 5).map((m) => (
                    <div key={m.user._id}
                      className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[9px] font-semibold text-neutral-400 -ml-1.5 first:ml-0">
                      {m.user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Chat from '../components/Chat';
import Presence from '../components/Presence';
import DocumentList from '../components/DocumentList';

export default function WorkspacePage() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [wsData, projData] = await Promise.all([
        api.get(`/workspaces/${id}`),
        api.get(`/projects?workspace=${id}`),
      ]);
      setWorkspace(wsData);
      setProjects(projData);
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
      const project = await api.post('/projects', { name, description, workspace: id });
      setProjects([project, ...projects]);
      setName(''); setDescription(''); setShowCreate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleArchive = async (project) => {
    try {
      const updated = await api.put(`/projects/${project._id}`, {
        status: project.status === 'active' ? 'archived' : 'active',
      });
      setProjects(projects.map((p) => (p._id === updated._id ? updated : p)));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 py-8"><p className="text-neutral-500">Workspace not found.</p></div>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'active');
  const archivedProjects = projects.filter((p) => p.status === 'archived');

  return (
    <div className="min-h-screen bg-neutral-950 font-['Public_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-2 text-sm text-neutral-500">
          <Link to="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to={`/organizations/${workspace.organization?._id || ''}`} className="hover:text-teal-400 transition-colors">
            {workspace.organization?.name || 'Organization'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-200 font-medium">{workspace.name}</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-50 font-['Space_Grotesk',sans-serif] tracking-tight">{workspace.name}</h1>
            {workspace.description && <p className="text-neutral-500 mt-1">{workspace.description}</p>}
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Project
          </button>
        </div>

        {workspace.organization && (
          <div className="mb-6">
            <Presence orgId={workspace.organization._id || workspace.organization} />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 text-red-400 text-sm rounded-lg border border-red-900/60">{error}</div>
        )}

        {showCreate && (
          <div className="mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-neutral-100 font-['Space_Grotesk',sans-serif]">Create Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field" placeholder="Project Alpha" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="input-field" placeholder="Optional" />
              </div>
              <div className="flex gap-3">
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

        {activeProjects.length === 0 && archivedProjects.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-1 font-['Space_Grotesk',sans-serif]">No projects yet</h3>
            <p className="text-neutral-500 text-sm">Create your first project to get started.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-neutral-100 font-['Space_Grotesk',sans-serif]">Projects</h2>
              {activeProjects.length === 0 ? (
                <p className="text-neutral-500 text-sm">No active projects.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProjects.map((project, i) => (
                    <Link key={project._id} to={`/projects/${project._id}`}
                      className="block p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-neutral-100">{project.name}</h3>
                        <span className="badge-teal">Active</span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">{project.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
                        <span className="text-xs text-neutral-500">by {project.createdBy?.name || 'Unknown'}</span>
                        <button onClick={(e) => { e.preventDefault(); toggleArchive(project); }}
                          className="text-xs text-neutral-500 hover:text-red-400 transition-colors">Archive</button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {archivedProjects.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-neutral-500 font-['Space_Grotesk',sans-serif]">Archived ({archivedProjects.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {archivedProjects.map((project) => (
                    <div key={project._id} className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl opacity-50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-neutral-400">{project.name}</h3>
                        <span className="badge bg-neutral-800 text-neutral-500 border border-neutral-700">Archived</span>
                      </div>
                      {project.description && <p className="text-sm text-neutral-500 line-clamp-2">{project.description}</p>}
                      <button onClick={() => toggleArchive(project)}
                        className="text-xs text-teal-400 hover:text-teal-300 mt-3 font-medium transition-colors">Restore</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-8">
          <DocumentList workspaceId={id} />
        </div>

        <div className="mt-8">
          <Chat workspaceId={id} />
        </div>
      </div>
    </div>
  );
}

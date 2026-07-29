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
        <div className="w-7 h-7 border-2 border-brand-300 border-t-brand-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8"><p className="text-brand-500">Workspace not found.</p></div>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'active');
  const archivedProjects = projects.filter((p) => p.status === 'archived');

  return (
    <div className="min-h-screen">
      <div className="h-[3px] bg-brand-800" />
      <div className="h-px bg-gold-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-2 text-sm text-brand-500">
          <Link to="/dashboard" className="hover:text-brand-800 transition-colors">Dashboard</Link>
          <span className="mx-2 text-brand-300">/</span>
          <Link to={`/organizations/${workspace.organization?._id || ''}`} className="hover:text-brand-800 transition-colors">
            {workspace.organization?.name || 'Organization'}
          </Link>
          <span className="mx-2 text-brand-300">/</span>
          <span className="text-brand-900 font-medium">{workspace.name}</span>
        </div>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-brand-300">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-gold-500 uppercase mb-2">Workspace</p>
            <h1 className="text-[34px] leading-none text-brand-900 font-heading tracking-tight">{workspace.name}</h1>
            {workspace.description && <p className="text-brand-500 mt-2">{workspace.description}</p>}
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 transition-colors">
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
          <div className="mb-6 px-4 py-3 bg-[#FBEEEE] text-[#9B3B3B] text-sm border-l-2 border-[#9B3B3B]">{error}</div>
        )}

        {showCreate && (
          <div className="mb-6 bg-white border border-brand-300">
            <div className="px-6 py-4 border-b border-brand-200">
              <h2 className="text-[15px] font-semibold text-brand-900 font-heading">Create Project</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field" placeholder="Project Alpha" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="input-field" placeholder="Optional" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={creating}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-colors">
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 text-sm font-medium text-brand-500 hover:text-brand-900 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeProjects.length === 0 && archivedProjects.length === 0 ? (
          <div className="text-center py-16 bg-white border border-brand-300">
            <div className="w-14 h-14 border border-brand-300 flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-brand-900 mb-2 font-heading">No projects yet</h3>
            <p className="text-brand-500 text-sm">Create your first project to get started.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-[15px] font-semibold mb-4 text-brand-900 font-heading">Projects</h2>
              {activeProjects.length === 0 ? (
                <p className="text-brand-500 text-sm">No active projects.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeProjects.map((project) => (
                    <Link key={project._id} to={`/projects/${project._id}`}
                      className="group block p-6 bg-white border border-brand-300 hover:border-brand-800 hover:shadow-[0_2px_12px_rgba(20,27,45,0.08)] transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-brand-900 group-hover:text-brand-800">{project.name}</h3>
                        <span className="badge-brand">Active</span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-brand-500 line-clamp-2 leading-relaxed">{project.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-200">
                        <span className="text-xs text-brand-500">by {project.createdBy?.name || 'Unknown'}</span>
                        <button onClick={(e) => { e.preventDefault(); toggleArchive(project); }}
                          className="text-xs text-brand-500 hover:text-[#9B3B3B] transition-colors">Archive</button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {archivedProjects.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[15px] font-semibold mb-4 text-brand-500 font-heading">Archived ({archivedProjects.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {archivedProjects.map((project) => (
                    <div key={project._id} className="p-6 bg-white border border-brand-300 opacity-50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-brand-500">{project.name}</h3>
                        <span className="badge bg-brand-100 text-brand-500 border border-brand-300">Archived</span>
                      </div>
                      {project.description && <p className="text-sm text-brand-500 line-clamp-2">{project.description}</p>}
                      <button onClick={() => toggleArchive(project)}
                        className="text-xs text-brand-800 hover:text-brand-700 mt-3 font-medium transition-colors">Restore</button>
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

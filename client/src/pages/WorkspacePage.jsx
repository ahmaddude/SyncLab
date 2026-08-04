import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Chat from '../components/Chat';
import Presence from '../components/Presence';
import DocumentList from '../components/DocumentList';

export default function WorkspacePage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [myRole, setMyRole] = useState(null);
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

      const orgId = wsData.organization?._id || wsData.organization;
      if (orgId) {
        const orgData = await api.get(`/orgs/${orgId}`);
        const member = orgData.members.find((m) => m.user._id === user?.id);
        setMyRole(member?.role || null);
      }
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
        <div className="w-7 h-7 border-2 border-line border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-ink-950">
        <div className="max-w-7xl mx-auto px-4 py-8"><p className="text-gray-400">Workspace not found.</p></div>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'active');
  const archivedProjects = projects.filter((p) => p.status === 'archived');

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="h-[3px] bg-ink-800" />
      <div className="h-px bg-gold/50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-2 text-sm text-gray-400">
          <Link to="/dashboard" className="hover:text-gold transition-colors">Dashboard</Link>
          <span className="mx-2 text-gray-600">/</span>
          <Link to={`/organizations/${workspace.organization?._id || ''}`} className="hover:text-gold transition-colors">
            {workspace.organization?.name || 'Organization'}
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-white font-medium">{workspace.name}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-line">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Workspace</p>
            <h1 className="text-[26px] leading-tight text-white font-heading tracking-tight">{workspace.name}</h1>
            {workspace.description && <p className="text-gray-400 mt-2">{workspace.description}</p>}
          </div>
          {(myRole === 'owner' || myRole === 'admin') && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink-950 bg-gold hover:bg-gold-hover rounded-lg transition-colors">
              <i className="fa-solid fa-plus text-xs"></i>
              New Project
            </button>
          )}
        </div>

        {workspace.organization && (
          <div className="mb-6">
            <Presence orgId={workspace.organization._id || workspace.organization} />
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 bg-coral/10 text-coral text-sm border-l-2 border-coral">{error}</div>
        )}

        {showCreate && (
          <div className="mb-6 bg-ink-850 border border-line rounded-xl">
            <div className="px-6 py-4 border-b border-line">
              <h2 className="text-sm font-semibold text-white">Create Project</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field" placeholder="Project Alpha" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="input-field" placeholder="Optional" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={creating}
                  className="px-4 py-2.5 text-sm font-semibold text-ink-950 bg-gold hover:bg-gold-hover disabled:opacity-50 transition-colors">
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeProjects.length === 0 && archivedProjects.length === 0 ? (
          <div className="text-center py-16 bg-ink-850 border border-line rounded-2xl">
            <div className="w-14 h-14 border border-line flex items-center justify-center mx-auto mb-5 rounded-xl">
              <i className="fa-solid fa-folder-plus text-gray-500 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 font-heading">No projects yet</h3>
            <p className="text-gray-400 text-sm">Create your first project to get started.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-sm font-semibold mb-4 text-white">Projects</h2>
              {activeProjects.length === 0 ? (
                <p className="text-gray-400 text-sm">No active projects.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeProjects.map((project) => (
                    <Link key={project._id} to={`/projects/${project._id}`}
                      className="group block p-6 bg-ink-900 border border-line rounded-xl hover:border-gold/30 hover:bg-ink-800/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white group-hover:text-gold">{project.name}</h3>
                        <span className="badge-brand">Active</span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{project.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                        <span className="text-xs text-gray-500">by {project.createdBy?.name || 'Unknown'}</span>
                        {(myRole === 'owner' || myRole === 'admin') && (
                          <button onClick={(e) => { e.preventDefault(); toggleArchive(project); }}
                            className="text-xs text-gray-500 hover:text-coral transition-colors">Archive</button>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {archivedProjects.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold mb-4 text-gray-400">Archived ({archivedProjects.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {archivedProjects.map((project) => (
                    <div key={project._id} className="p-6 bg-ink-900 border border-line rounded-xl opacity-50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-400">{project.name}</h3>
                        <span className="badge bg-gold/10 text-gold border border-gold/30">Archived</span>
                      </div>
                      {project.description && <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>}
                      <button onClick={() => toggleArchive(project)}
                        className="text-xs text-gold hover:text-gold-hover mt-3 font-medium transition-colors">Restore</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-8">
          <DocumentList workspaceId={id} canManage={myRole === 'owner' || myRole === 'admin'} />
        </div>

        <div className="mt-8">
          <Chat workspaceId={id} />
        </div>
      </div>
    </div>
  );
}

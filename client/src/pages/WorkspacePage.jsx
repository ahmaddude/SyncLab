import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Chat from '../components/Chat';
import Presence from '../components/Presence';

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

  useEffect(() => {
    fetchData();
  }, [id]);

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
      const project = await api.post('/projects', {
        name,
        description,
        workspace: id,
      });
      setProjects([project, ...projects]);
      setName('');
      setDescription('');
      setShowCreate(false);
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
      <div className="flex items-center justify-center h-[calc(100vh-57px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500">Workspace not found.</p>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'active');
  const archivedProjects = projects.filter((p) => p.status === 'archived');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link
          to={`/organizations/${workspace.organization?._id || ''}`}
          className="hover:text-primary-600"
        >
          {workspace.organization?.name || 'Organization'}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{workspace.name}</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-gray-500 mt-1">{workspace.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
        >
          New Project
        </button>
      </div>

      {workspace.organization && (
        <div className="mb-6">
          <Presence orgId={workspace.organization._id || workspace.organization} />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      {showCreate && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Create Project</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Project Alpha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

      {activeProjects.length === 0 && archivedProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500">Create your first project to get started.</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Active Projects ({activeProjects.length})</h2>
            {activeProjects.length === 0 ? (
              <p className="text-gray-500 text-sm">No active projects.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProjects.map((project) => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Active
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-400">
                        by {project.createdBy?.name || 'Unknown'}
                      </span>
                      <button
                        onClick={() => toggleArchive(project)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        Archive
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {archivedProjects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-500">
                Archived ({archivedProjects.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedProjects.map((project) => (
                  <div
                    key={project._id}
                    className="p-6 bg-gray-50 rounded-xl border border-gray-200 opacity-70"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-700">{project.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-xs rounded-full font-medium">
                        Archived
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    )}
                    <button
                      onClick={() => toggleArchive(project)}
                      className="text-xs text-primary-500 hover:text-primary-700"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <Chat workspaceId={id} />
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function DocumentList({ workspaceId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, [workspaceId]);

  const fetchDocs = async () => {
    try {
      const data = await api.get(`/documents?workspace=${workspaceId}`);
      setDocs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const doc = await api.post('/documents', { title, workspace: workspaceId });
      setDocs([doc, ...docs]);
      setTitle('');
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, docId) => {
    e.preventDefault();
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setDocs(docs.filter((d) => d._id !== docId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-400 py-4">Loading documents...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
        >
          + New Doc
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-4 p-4 bg-gray-50 rounded-lg flex gap-3">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Document title"
            autoFocus
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            className="px-3 py-2 text-gray-500 text-sm font-medium hover:text-gray-700"
          >
            Cancel
          </button>
        </form>
      )}

      {docs.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">No documents yet. Create one to get started.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <Link
              key={doc._id}
              to={`/documents/${doc._id}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-primary-600">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Edited {new Date(doc.updatedAt).toLocaleDateString()} by {doc.createdBy?.name || 'Unknown'}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, doc._id)}
                className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 shrink-0 ml-4"
              >
                Delete
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

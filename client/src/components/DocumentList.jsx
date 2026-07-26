import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function DocumentList({ workspaceId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchDocs(); }, [workspaceId]);

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
    return <div className="text-sm text-neutral-500 py-4">Loading documents...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-100 font-['Space_Grotesk',sans-serif]">Documents</h2>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Doc
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-3">
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
            className="flex-1 input-field" placeholder="Document title" autoFocus />
          <button type="submit" disabled={creating}
            className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors">
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button type="button" onClick={() => setShowCreate(false)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors">
            Cancel
          </button>
        </form>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-neutral-500 text-sm">No documents yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <Link key={doc._id} to={`/documents/${doc._id}`}
              className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 hover:bg-neutral-850 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-neutral-200 truncate group-hover:text-teal-400 transition-colors">{doc.title}</h3>
                  <p className="text-xs text-neutral-500">
                    Edited {new Date(doc.updatedAt).toLocaleDateString()} by {doc.createdBy?.name || 'Unknown'}
                  </p>
                </div>
              </div>
              <button onClick={(e) => handleDelete(e, doc._id)}
                className="text-xs text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 shrink-0 ml-4 transition-all">Delete</button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

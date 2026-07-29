import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ConfirmDialog from './ConfirmDialog';

export default function DocumentList({ workspaceId, canManage = false }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

  const handleDelete = async () => {
    try {
      await api.delete(`/documents/${deleteId}`);
      setDocs(docs.filter((d) => d._id !== deleteId));
      setShowConfirm(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-sm text-brand-500 py-4">Loading documents...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-brand-900 font-heading">Documents</h2>
        {canManage && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Doc
          </button>
        )}
      </div>

      {showCreate && (
        <div className="mb-4 bg-white border border-brand-300">
          <form onSubmit={handleCreate} className="p-4 flex gap-3">
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="flex-1 input-field" placeholder="Document title" autoFocus />
            <button type="submit" disabled={creating}
              className="px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-3 py-2.5 text-sm font-medium text-brand-500 hover:text-brand-900 transition-colors">
              Cancel
            </button>
          </form>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-brand-300">
          <div className="w-12 h-12 border border-brand-300 flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-brand-500 text-sm">No documents yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <Link key={doc._id} to={`/documents/${doc._id}`}
              className="flex items-center justify-between p-4 bg-white border border-brand-300 hover:border-brand-800 hover:shadow-[0_2px_8px_rgba(20,27,45,0.06)] transition-all group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-brand-100 border border-brand-300 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-brand-900 truncate group-hover:text-brand-800 transition-colors">{doc.title}</h3>
                  <p className="text-xs text-brand-500">
                    Edited {new Date(doc.updatedAt).toLocaleDateString()} by {doc.createdBy?.name || 'Unknown'}
                  </p>
                </div>
              </div>
              {canManage && (
                <button onClick={(e) => { e.preventDefault(); setDeleteId(doc._id); setShowConfirm(true); }}
                  className="text-xs text-neutral-500 hover:text-red-400 shrink-0 ml-4 transition-all">Delete</button>
              )}
            </Link>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Delete document?"
        message="This action cannot be undone. The document and its content will be permanently deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
      />
    </div>
  );
}

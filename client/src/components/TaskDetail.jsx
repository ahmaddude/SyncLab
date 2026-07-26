import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PRIORITIES = {
  low: { bg: 'bg-neutral-800', text: 'text-neutral-400' },
  medium: { bg: 'bg-blue-950/40', text: 'text-blue-400' },
  high: { bg: 'bg-amber-950/40', text: 'text-amber-400' },
  urgent: { bg: 'bg-red-950/40', text: 'text-red-400' },
};

const STATUSES = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };

export default function TaskDetail({ task, onClose, onUpdate, members = [] }) {
  const { user } = useAuth();
  const [fullTask, setFullTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTask(); }, [task._id]);

  const fetchTask = async () => {
    try {
      const data = await api.get(`/tasks/${task._id}`);
      setFullTask(data);
      setTitle(data.title);
      setDescription(data.description);
      setStatus(data.status);
      setPriority(data.priority);
      setAssignee(data.assignee?._id || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.put(`/tasks/${task._id}`, { title, description, status, priority, assignee: assignee || null });
      setFullTask((prev) => ({ ...prev, ...updated }));
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const comments = await api.post(`/tasks/${task._id}/comments`, { text: commentText });
      setFullTask((prev) => ({ ...prev, comments }));
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/tasks/${task._id}/comments/${commentId}`);
      setFullTask((prev) => ({ ...prev, comments: prev.comments.filter((c) => c._id !== commentId) }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onUpdate({ _id: task._id, _deleted: true });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!fullTask) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-teal-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-end z-50" onClick={onClose}>
      <div className="h-full w-full max-w-lg bg-neutral-950 border-l border-neutral-800 shadow-2xl overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-950/80 backdrop-blur-xl z-10">
          <h2 className="text-lg font-semibold text-neutral-100 font-['Space_Grotesk',sans-serif]">Task Details</h2>
          <div className="flex items-center gap-2">
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 transition-colors">
                Edit
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
                    {Object.entries(STATUSES).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
                    {Object.keys(PRIORITIES).map((p) => (<option key={p} value={p}>{p}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Assignee</label>
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="input-field">
                  <option value="">Unassigned</option>
                  {members.map((m) => (<option key={m._id} value={m._id}>{m.name}</option>))}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => {
                  setEditing(false); setTitle(fullTask.title); setDescription(fullTask.description);
                  setStatus(fullTask.status); setPriority(fullTask.priority); setAssignee(fullTask.assignee?._id || '');
                }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-semibold text-neutral-50 mb-2 font-['Space_Grotesk',sans-serif]">{fullTask.title}</h3>
                {fullTask.description && <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">{fullTask.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Status</span>
                  <div className="mt-1.5">
                    <span className="badge-teal">{STATUSES[fullTask.status]}</span>
                  </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Priority</span>
                  <div className="mt-1.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITIES[fullTask.priority].bg} ${PRIORITIES[fullTask.priority].text}`}>
                      {fullTask.priority}
                    </span>
                  </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Assignee</span>
                  <div className="mt-1.5 text-sm text-neutral-300 font-medium">{fullTask.assignee?.name || 'Unassigned'}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Created</span>
                  <div className="mt-1.5 text-sm text-neutral-300 font-medium">{new Date(fullTask.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <button onClick={handleDelete}
                className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">Delete task</button>
            </>
          )}

          <div className="border-t border-neutral-800 pt-6">
            <h4 className="font-medium text-neutral-200 mb-4">
              Comments ({fullTask.comments?.length || 0})
            </h4>

            <div className="space-y-3 mb-4">
              {fullTask.comments?.map((comment) => (
                <div key={comment._id} className="flex gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-400 shrink-0">
                    {comment.author?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-200">{comment.author?.name || 'Unknown'}</span>
                      <span className="text-[11px] text-neutral-500">{new Date(comment.createdAt).toLocaleString()}</span>
                      {comment.author?._id === user?.id && (
                        <button onClick={() => handleDeleteComment(comment._id)}
                          className="text-[11px] text-red-400 hover:text-red-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400 mt-0.5">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..." className="flex-1 input-field text-sm" />
              <button type="submit" disabled={!commentText.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors">
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

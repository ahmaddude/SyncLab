import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import FocusTimer from './FocusTimer';

const PRIORITIES = {
  low: { label: 'Low', bg: 'bg-ink-800 text-gray-400 border border-line' },
  medium: { label: 'Medium', bg: 'bg-gold/10 text-gold' },
  high: { label: 'High', bg: 'bg-coral/10 text-coral' },
  urgent: { label: 'Urgent', bg: 'bg-coral/10 text-coral font-bold' },
};

const STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
];

export default function TaskDetailPane({ task, project, members = [], userRole = null, onUpdate, onClose }) {
  const { user } = useAuth();
  const [full, setFull] = useState(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchFull(); }, [task._id]);

  const fetchFull = async () => {
    try {
      const data = await api.get(`/tasks/${task._id}`);
      setFull(data);
      setTitle(data.title);
      setDesc(data.description);
    } catch (err) {}
  };

  const canEdit = userRole === 'owner' || userRole === 'admin';

  const save = async (updates) => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const updated = await api.put(`/tasks/${task._id}`, updates);
      setFull((prev) => ({ ...prev, ...updated }));
      onUpdate(updated);
    } catch (err) {} finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    await save({ title, description: desc });
    setEditing(false);
  };

  const handleToggleSubtask = async (index) => {
    const subtasks = full.subtasks.map((s, i) => (i === index ? { ...s, done: !s.done } : s));
    await save({ subtasks });
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    await save({ subtasks: [...(full.subtasks || []), { title: newSubtask, done: false }] });
    setNewSubtask('');
  };

  const handleRemoveSubtask = async (index) => {
    await save({ subtasks: full.subtasks.filter((_, i) => i !== index) });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const comments = await api.post(`/tasks/${task._id}/comments`, { text: commentText });
      setFull((prev) => ({ ...prev, comments }));
      setCommentText('');
    } catch (err) {}
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/tasks/${task._id}/comments/${commentId}`);
      setFull((prev) => ({ ...prev, comments: prev.comments.filter((c) => c._id !== commentId) }));
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!canEdit) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onUpdate({ _id: task._id, _deleted: true });
      onClose();
    } catch (err) {}
  };

  if (!full) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-2 border-line border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const doneCount = (full.subtasks || []).filter((s) => s.done).length;
  const totalSubtasks = (full.subtasks || []).length;
  const progress = totalSubtasks > 0 ? Math.round((doneCount / totalSubtasks) * 100) : 0;
  const priority = PRIORITIES[full.priority] || PRIORITIES.medium;

  return (
    <div className="bg-ink-850 border border-line rounded-lg overflow-hidden">
      <div className="bg-ink-900/60 border-b border-line px-5 py-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-sm"
                placeholder="Task title"
              />
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                className="input-field resize-none text-sm"
                placeholder="Task description"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold text-ink-950 bg-gold hover:bg-gold-hover disabled:opacity-50 rounded-lg transition-colors">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setTitle(full.title); setDesc(full.description); }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-white font-heading leading-snug">{full.title}</h3>
              {full.description && (
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed whitespace-pre-wrap">{full.description}</p>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canEdit && !editing && (
            <button onClick={() => setEditing(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gold hover:bg-ink-800 rounded-lg transition-colors"
              title="Edit">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
          )}
          {canEdit && (
            <button onClick={handleDelete}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-coral hover:bg-ink-800 rounded-lg transition-colors"
              title="Delete">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-ink-800 rounded-lg transition-colors"
            title="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5 bg-ink-850">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-ink-900 border border-line rounded-lg p-3">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Assignee</span>
            {canEdit ? (
              <select
                value={full.assignee?._id || ''}
                onChange={(e) => save({ assignee: e.target.value || null })}
                className="mt-1 w-full text-xs bg-ink-950 text-white border border-line rounded px-1.5 py-1 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (<option key={m._id} value={m._id}>{m.name}</option>))}
              </select>
            ) : (
              <div className="mt-1 text-sm text-white font-medium truncate">{full.assignee?.name || 'Unassigned'}</div>
            )}
          </div>
          <div className="bg-ink-900 border border-line rounded-lg p-3">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Project</span>
            <div className="mt-1 text-sm text-white font-medium truncate">{project?.name || 'Unknown'}</div>
          </div>
          <div className="bg-ink-900 border border-line rounded-lg p-3">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Priority</span>
            {canEdit ? (
              <select
                value={full.priority}
                onChange={(e) => save({ priority: e.target.value })}
                className="mt-1 w-full text-xs bg-ink-950 text-white border border-line rounded px-1.5 py-1 focus:outline-none"
              >
                {Object.entries(PRIORITIES).map(([key, p]) => (<option key={key} value={key}>{p.label}</option>))}
              </select>
            ) : (
              <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${priority.bg}`}>
                {priority.label}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Status</span>
            {full.dueDate && (
              <span className="text-[11px] text-gray-400">
                Due {new Date(full.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const active = full.status === s.key;
              const activeCls = {
                todo: 'bg-ink-800 text-gray-300 border border-line',
                in_progress: 'bg-gold/15 text-gold border border-gold/30',
                review: 'bg-gold/15 text-gold border border-gold/30',
                done: 'bg-emerald/15 text-emerald border border-emerald/30',
              };
              return (
                <button
                  key={s.key}
                  onClick={() => canEdit && save({ status: s.key })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${active ? activeCls[s.key] : 'bg-ink-900 text-gray-500 hover:text-gray-300 border border-line'}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Subtasks ({doneCount}/{totalSubtasks})
            </span>
            <span className="text-[11px] text-gold font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-ink-900 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-1.5">
            {(full.subtasks || []).map((sub, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <button
                  onClick={() => canEdit && handleToggleSubtask(i)}
                  className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                    sub.done ? 'bg-gold border-gold text-ink-950' : 'border-line bg-ink-900'
                  } ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {sub.done && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
                <span className={`flex-1 min-w-0 text-sm truncate ${sub.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                  {sub.title}
                </span>
                {canEdit && (
                  <button onClick={() => handleRemoveSubtask(i)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-coral transition-colors shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {canEdit && (
            <form onSubmit={handleAddSubtask} className="flex gap-2 mt-3">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="flex-1 input-field text-sm"
                placeholder="Add a subtask..."
              />
              <button type="submit" disabled={!newSubtask.trim()}
                className="px-3 py-2 text-xs font-semibold text-ink-950 bg-gold hover:bg-gold-hover disabled:opacity-50 rounded-lg transition-colors">
                Add
              </button>
            </form>
          )}
        </div>

        <FocusTimer />

        <div>
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
            Comments ({full.comments?.length || 0})
          </h4>
          <div className="space-y-3 mb-3">
            {full.comments?.map((comment) => (
              <div key={comment._id} className="flex gap-2.5 group">
                <div className="w-7 h-7 bg-ink-900 border border-line flex items-center justify-center text-[10px] font-semibold text-gold rounded-full shrink-0">
                  {comment.author?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{comment.author?.name || 'Unknown'}</span>
                    <span className="text-[11px] text-gray-500 shrink-0">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    {comment.author?._id === user?.id && (
                      <button onClick={() => handleDeleteComment(comment._id)}
                        className="text-[11px] text-coral hover:text-red-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 input-field text-sm"
              placeholder="Write a comment..."
            />
            <button type="submit" disabled={!commentText.trim()}
              className="px-3 py-2 text-xs font-semibold text-ink-950 bg-gold hover:bg-gold-hover disabled:opacity-50 rounded-lg transition-colors">
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

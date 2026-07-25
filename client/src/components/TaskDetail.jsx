import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PRIORITIES = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const STATUSES = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

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

  useEffect(() => {
    fetchTask();
  }, [task._id]);

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
      const updated = await api.put(`/tasks/${task._id}`, {
        title,
        description,
        status,
        priority,
        assignee: assignee || null,
      });
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
      const comments = await api.post(`/tasks/${task._id}/comments`, {
        text: commentText,
      });
      setFullTask((prev) => ({ ...prev, comments }));
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/tasks/${task._id}/comments/${commentId}`);
      setFullTask((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== commentId),
      }));
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
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-end z-50" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task Details</h2>
          <div className="flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.entries(STATUSES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.keys(PRIORITIES).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setTitle(fullTask.title);
                    setDescription(fullTask.description);
                    setStatus(fullTask.status);
                    setPriority(fullTask.priority);
                    setAssignee(fullTask.assignee?._id || '');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{fullTask.title}</h3>
                {fullTask.description && (
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{fullTask.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Status</span>
                  <div className="mt-1">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                      {STATUSES[fullTask.status]}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Priority</span>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITIES[fullTask.priority]}`}>
                      {fullTask.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Assignee</span>
                  <div className="mt-1 text-sm text-gray-700">
                    {fullTask.assignee?.name || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Created</span>
                  <div className="mt-1 text-sm text-gray-700">
                    {new Date(fullTask.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <button
                onClick={handleDelete}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Delete task
              </button>
            </>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Comments ({fullTask.comments?.length || 0})
            </h4>

            <div className="space-y-3 mb-4">
              {fullTask.comments?.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium shrink-0">
                    {comment.author?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author?.name || 'Unknown'}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {comment.author?._id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-[11px] text-red-400 hover:text-red-600 ml-auto"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

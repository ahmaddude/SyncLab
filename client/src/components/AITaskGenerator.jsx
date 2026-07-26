import { useState } from 'react';
import api from '../utils/api';

const PRIORITIES = {
  low: { bg: 'bg-neutral-800', text: 'text-neutral-400', label: 'Low' },
  medium: { bg: 'bg-blue-950/40', text: 'text-blue-400', label: 'Medium' },
  high: { bg: 'bg-amber-950/40', text: 'text-amber-400', label: 'High' },
  urgent: { bg: 'bg-red-950/40', text: 'text-red-400', label: 'Urgent' },
};

export default function AITaskGenerator({ projectId, onTasksCreated, onClose }) {
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/ai/generate-tasks', { description, projectId });
      setTasks(data.tasks);
      setSelected(new Set(data.tasks.map((_, i) => i)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      const toCreate = tasks
        .filter((_, i) => selected.has(i))
        .map((t) => ({ ...t, project: projectId, status: 'todo' }));

      const created = await Promise.all(
        toCreate.map((t) => api.post('/tasks', t))
      );

      onTasksCreated(created);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleSelect = (idx) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const updateTask = (idx, field, value) => {
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const removeTask = (idx) => {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
    setSelected((prev) => {
      const next = new Set();
      for (const i of prev) {
        if (i < idx) next.add(i);
        else if (i > idx) next.add(i - 1);
      }
      return next;
    });
    if (editingIdx === idx) setEditingIdx(null);
    else if (editingIdx !== null && editingIdx > idx) setEditingIdx(editingIdx - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-100 font-['Space_Grotesk',sans-serif]">AI Task Generator</h2>
              <p className="text-xs text-neutral-500">Describe your feature, get structured tasks</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {!tasks ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Describe the feature you want to build</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="e.g. User authentication system with email/password, OAuth (Google, GitHub), password reset, email verification, and session management..."
                  className="input-field resize-none"
                />
              </div>
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 text-sm">{error}</div>
              )}
              <button
                onClick={handleGenerate}
                disabled={!description.trim() || loading}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                    Generating tasks...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Tasks
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">
                  {selected.size} of {tasks.length} tasks selected
                </span>
                <button
                  onClick={() => { setTasks(null); setEditingIdx(null); }}
                  className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Start over
                </button>
              </div>

              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  className={`bg-neutral-900 border rounded-xl p-4 transition-colors ${selected.has(idx) ? 'border-teal-500/30' : 'border-neutral-800 opacity-50'}`}
                >
                  {editingIdx === idx ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTask(idx, 'title', e.target.value)}
                        className="input-field text-sm"
                      />
                      <textarea
                        value={task.description}
                        onChange={(e) => updateTask(idx, 'description', e.target.value)}
                        rows={2}
                        className="input-field text-sm resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <select
                          value={task.priority}
                          onChange={(e) => updateTask(idx, 'priority', e.target.value)}
                          className="input-field text-sm w-auto"
                        >
                          {Object.entries(PRIORITIES).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                        </select>
                        <button onClick={() => setEditingIdx(null)} className="text-xs text-teal-400 hover:text-teal-300">Done</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected.has(idx)}
                        onChange={() => toggleSelect(idx)}
                        className="mt-1 rounded border-neutral-700 bg-neutral-800 text-teal-500 focus:ring-teal-500/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-200">{task.title}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${PRIORITIES[task.priority].bg} ${PRIORITIES[task.priority].text}`}>
                            {PRIORITIES[task.priority].label}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setEditingIdx(idx)} className="text-neutral-600 hover:text-neutral-300 transition-colors p-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => removeTask(idx)} className="text-neutral-600 hover:text-red-400 transition-colors p-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 text-sm">{error}</div>
              )}
            </div>
          )}
        </div>

        {tasks && tasks.length > 0 && (
          <div className="p-6 border-t border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => { setTasks(null); setEditingIdx(null); }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={selected.size === 0 || creating}
              className="px-6 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                `Create ${selected.size} Task${selected.size !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

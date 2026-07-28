import { useState } from 'react';
import api from '../utils/api';

const PRIORITIES = {
  low: { bg: 'bg-brand-100', text: 'text-brand-500', label: 'Low' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Medium' },
  high: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'High' },
  urgent: { bg: 'bg-red-50', text: 'text-red-600', label: 'Urgent' },
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
    <div className="fixed inset-0 bg-brand-900/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-brand-300 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-brand-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-800/10 border border-brand-800/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand-900 font-heading">AI Task Generator</h2>
              <p className="text-xs text-brand-400">Describe your feature, get structured tasks</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-brand-400 hover:text-brand-900 hover:bg-brand-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {!tasks ? (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">Describe the feature you want to build</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                  rows={5}
                  placeholder="e.g. User authentication system with email/password, OAuth (Google, GitHub), password reset, email verification, and session management..."
                  className="input-field resize-none"
                />
                <p className="text-[11px] text-brand-400 mt-1.5">Press Ctrl+Enter to generate</p>
              </div>
              {error && (
                <div className="px-4 py-3 bg-[#FBEEEE] border-l-2 border-[#9B3B3B] text-[#9B3B3B] text-sm">{error}</div>
              )}
              <button
                onClick={handleGenerate}
                disabled={!description.trim() || loading}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing and generating tasks...
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
            <div className="space-y-2.5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-brand-900 font-medium">
                    <span className="text-brand-800">{selected.size}</span>
                    <span className="text-brand-400"> / {tasks.length} tasks</span>
                  </span>
                  <button
                    onClick={() => {
                      if (selected.size === tasks.length) setSelected(new Set());
                      else setSelected(new Set(tasks.map((_, i) => i)));
                    }}
                    className="text-[11px] text-brand-400 hover:text-brand-800 transition-colors"
                  >
                    {selected.size === tasks.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <button
                  onClick={() => { setTasks(null); setEditingIdx(null); setError(''); }}
                  className="text-xs text-brand-400 hover:text-brand-900 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Start over
                </button>
              </div>

              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  className={`group bg-brand-50 border p-4 transition-all ${
                    selected.has(idx)
                      ? 'border-brand-800/25'
                      : 'border-brand-300 opacity-60'
                  } ${editingIdx === idx ? 'ring-1 ring-brand-800/30' : ''}`}
                >
                  {editingIdx === idx ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTask(idx, 'title', e.target.value)}
                        className="input-field text-sm"
                        autoFocus
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
                        <button onClick={() => setEditingIdx(null)} className="text-xs text-brand-800 hover:text-brand-700 font-medium">Done</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected.has(idx)}
                        onChange={() => toggleSelect(idx)}
                        className="mt-1 rounded border-brand-300 text-brand-800 focus:ring-brand-800/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-brand-900">{task.title}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${PRIORITIES[task.priority].bg} ${PRIORITIES[task.priority].text}`}>
                            {PRIORITIES[task.priority].label}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-brand-400 mt-1.5 line-clamp-2 leading-relaxed">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100">
                        <button onClick={() => setEditingIdx(idx)} className="text-brand-400 hover:text-brand-900 transition-colors p-1.5 hover:bg-brand-100">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => removeTask(idx)} className="text-brand-400 hover:text-[#9B3B3B] transition-colors p-1.5 hover:bg-brand-100">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {error && (
                <div className="px-4 py-3 bg-[#FBEEEE] border-l-2 border-[#9B3B3B] text-[#9B3B3B] text-sm">{error}</div>
              )}
            </div>
          )}
        </div>

        {tasks && tasks.length > 0 && (
          <div className="p-6 border-t border-brand-200 flex items-center justify-between">
            <button
              onClick={() => { setTasks(null); setEditingIdx(null); setError(''); }}
              className="px-4 py-2.5 text-sm font-medium text-brand-500 hover:text-brand-900 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={selected.size === 0 || creating}
              className="px-6 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Create {selected.size} Task{selected.size !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

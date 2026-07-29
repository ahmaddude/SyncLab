import { useState } from 'react';
import api from '../utils/api';

const PRIORITIES = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };

export default function AITaskGenerator({ projectId, members = [], onTasksCreated, onClose }) {
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/ai/generate-tasks', { description, projectId });
      const generated = data.tasks.map((t) => ({ ...t, assignee: '', dueDate: '' }));
      setTasks(generated);
      setSelected(new Set(generated.map((_, i) => i)));
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
        .map((t) => ({
          title: t.title,
          description: t.description,
          priority: t.priority,
          assignee: t.assignee || null,
          dueDate: t.dueDate || null,
          project: projectId,
          status: 'todo',
        }));

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
  };

  const inputClass = "input-field";

  return (
    <div className="fixed inset-0 bg-brand-900/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-brand-300 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-brand-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#1c2742' }}>
              <span className="text-[15px] font-bold text-[#fbbf24] font-heading">S</span>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-brand-900 font-heading">AI Task Generator</h2>
              <p className="text-xs text-brand-500">Describe your feature, get structured tasks</p>
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
                <label className="block text-[11px] font-semibold tracking-wide text-brand-500 uppercase mb-2">Feature Description</label>
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
                <div className="px-4 py-3 bg-[#FBEEEE] text-[#9B3B3B] text-sm border-l-2 border-[#9B3B3B]">{error}</div>
              )}
              <button
                onClick={handleGenerate}
                disabled={!description.trim() || loading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
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
                <div className="flex items-center gap-3">
                  <span className="text-sm text-brand-900 font-medium">
                    <span className="text-brand-800">{selected.size}</span>
                    <span className="text-brand-500"> / {tasks.length} tasks</span>
                  </span>
                  <button
                    onClick={() => {
                      if (selected.size === tasks.length) setSelected(new Set());
                      else setSelected(new Set(tasks.map((_, i) => i)));
                    }}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-900 tracking-wide uppercase transition-colors"
                  >
                    {selected.size === tasks.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <button
                  onClick={() => { setTasks(null); setError(''); }}
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-900 tracking-wide uppercase transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Start over
                </button>
              </div>

              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  className={`border ${
                    selected.has(idx) ? 'border-brand-300 bg-white' : 'border-brand-200 bg-brand-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(idx)}
                      onChange={() => toggleSelect(idx)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${selected.has(idx) ? 'text-brand-900' : 'text-brand-500'}`}>
                          {task.title}
                        </span>
                        <span className={`badge ${selected.has(idx) ? 'badge-brand' : 'bg-brand-100 text-brand-500 border border-brand-200'}`}>
                          {PRIORITIES[task.priority] || task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className={`text-xs ${selected.has(idx) ? 'text-brand-600' : 'text-brand-400'}`}>{task.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold tracking-wide text-brand-500 uppercase mb-1">Assignee</label>
                          <select
                            value={task.assignee}
                            onChange={(e) => updateTask(idx, 'assignee', e.target.value)}
                            className="input-field text-sm"
                          >
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                              <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold tracking-wide text-brand-500 uppercase mb-1">Due Date</label>
                          <input
                            type="date"
                            value={task.dueDate}
                            onChange={(e) => updateTask(idx, 'dueDate', e.target.value)}
                            className="input-field text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTask(idx)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center text-brand-400 hover:text-[#9B3B3B] hover:bg-[#FBEEEE] transition-colors"
                      title="Remove task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}

              {error && (
                <div className="px-4 py-3 bg-[#FBEEEE] text-[#9B3B3B] text-sm border-l-2 border-[#9B3B3B]">{error}</div>
              )}
            </div>
          )}
        </div>

        {tasks && tasks.length > 0 && (
          <div className="px-6 py-4 border-t border-brand-200 flex items-center justify-between">
            <button
              onClick={() => { setTasks(null); setError(''); }}
              className="text-sm font-medium text-brand-500 hover:text-brand-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={selected.size === 0 || creating}
              className="px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-2"
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

import { useState } from 'react';

const STATUSES = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function CreateTask({ onSubmit, onCancel, defaultStatus = 'todo', members = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, status, priority, assignee: assignee || null, dueDate: dueDate || null });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-ink-900 border border-line w-full max-w-md p-0 shadow-2xl rounded-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gold/30 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white font-heading">Create Task</h2>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-ink-850 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-2">Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="input-field" placeholder="Task title" autoFocus />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="input-field resize-none" placeholder="Optional description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-2">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
                {Object.entries(STATUSES).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-2">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
                {PRIORITIES.map((p) => (<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-2">Assignee</label>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="input-field">
              <option value="">Unassigned</option>
              {members.map((m) => (<option key={m._id} value={m._id}>{m.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase mb-2">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="px-4 py-2.5 text-sm font-semibold text-ink-950 bg-gold hover:bg-gold-hover rounded-xl transition-colors">
              Create Task
            </button>
            <button type="button" onClick={onCancel}
              className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

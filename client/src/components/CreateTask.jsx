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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-100 font-['Space_Grotesk',sans-serif]">Create Task</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="input-field" placeholder="Task title" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="input-field resize-none" placeholder="Optional description" />
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
                {PRIORITIES.map((p) => (<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>))}
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
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 transition-colors">
              Create Task
            </button>
            <button type="button" onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

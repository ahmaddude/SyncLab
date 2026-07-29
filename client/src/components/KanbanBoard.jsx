import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'todo', title: 'To Do', dot: 'bg-brand-400' },
  { id: 'in_progress', title: 'In Progress', dot: 'bg-blue-500' },
  { id: 'review', title: 'Review', dot: 'bg-amber-500' },
  { id: 'done', title: 'Done', dot: 'bg-emerald-500' },
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };

const selectClass = "text-xs bg-white border border-brand-300 text-brand-600 rounded px-2.5 py-1.5 focus:outline-none focus:border-brand-800";

export default function KanbanBoard({ tasks, onDragEnd, onTaskClick }) {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const assignees = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (t.assignee?._id) {
        map[t.assignee._id] = t.assignee.name || 'Unknown';
      }
    });
    return Object.entries(map);
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterAssignee !== 'all' && t.assignee?._id !== filterAssignee) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, search, filterPriority, filterAssignee, filterStatus]);

  const getColumnTasks = (status) => {
    return filtered.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
  };

  const hasActiveFilters = search || filterPriority !== 'all' || filterAssignee !== 'all' || filterStatus !== 'all';
  const filteredCount = filtered.length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-brand-300 text-brand-600 rounded focus:outline-none focus:border-brand-800 w-44"
          />
        </div>

        <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className={selectClass}>
          <option value="all">Assignee: All</option>
          {assignees.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selectClass}>
          <option value="all">Priority: All</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
          <option value="all">Status: All</option>
          {Object.entries(STATUSES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(''); setFilterPriority('all'); setFilterAssignee('all'); setFilterStatus('all'); }}
            className="text-xs text-brand-500 hover:text-brand-900 transition-colors"
          >
            Clear filters
          </button>
        )}

        {hasActiveFilters && (
          <span className="text-[11px] text-brand-500 ml-auto">{filteredCount} of {tasks.length} tasks</span>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {COLUMNS.map((column) => {
            const columnTasks = getColumnTasks(column.id);

            return (
              <div key={column.id} className="flex-shrink-0 w-72 bg-brand-100 border border-brand-300 p-3">
                <div className="flex items-center gap-2.5 mb-3 px-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
                  <h3 className="text-sm font-semibold text-brand-900">{column.title}</h3>
                  <span className="text-[11px] font-semibold text-brand-500 bg-white border border-brand-300 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[200px] p-0.5 transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-brand-800/5 ring-1 ring-brand-800/20 ring-inset' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                              className={`${snapshot.isDragging ? 'rotate-1 scale-[1.02] shadow-xl shadow-brand-900/10' : ''} transition-transform duration-150`}
                            >
                              <TaskCard task={task} onClick={onTaskClick} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

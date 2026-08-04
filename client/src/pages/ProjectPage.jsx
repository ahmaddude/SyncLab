import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import CreateTask from '../components/CreateTask';
import AITaskGenerator from '../components/AITaskGenerator';
import ActivityLog from '../components/ActivityLog';
import TaskDetailPane from '../components/TaskDetailPane';

const TABS = ['All', 'Active', 'Upcoming', 'Done'];

const PRIORITY_TAGS = {
  low: { label: 'Low', cls: 'bg-ink-800 text-gray-400 border border-line' },
  medium: { label: 'Medium', cls: 'bg-gold/10 text-gold' },
  high: { label: 'High', cls: 'bg-coral/10 text-coral' },
  urgent: { label: 'Urgent', cls: 'bg-coral/10 text-coral' },
};

const STATUS_ICONS = {
  done: 'fa-solid fa-circle-check text-emerald text-sm',
  in_progress: 'fa-solid fa-spinner text-gold text-sm animate-spin',
  review: 'fa-solid fa-eye text-gold text-sm',
  todo: 'fa-regular fa-circle text-gray-500 text-sm',
};

function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function dueLabel(date) {
  if (!date) return null;
  const now = new Date();
  const d = new Date(date);
  const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, cls: 'bg-coral/10 text-coral' };
  if (days === 0) return { label: 'Due today', cls: 'bg-gold/10 text-gold' };
  if (days === 1) return { label: 'Due tomorrow', cls: 'bg-gold/10 text-gold' };
  return { label: `Due in ${days}d`, cls: 'bg-ink-800 text-gray-400 border border-line' };
}

export default function ProjectPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [tab, setTab] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showActivity, setShowActivity] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const projData = await api.get(`/projects/${id}`);
      const [taskData, wsData] = await Promise.all([
        api.get(`/tasks?project=${id}`),
        api.get(`/workspaces/${projData.workspace._id || projData.workspace}`),
      ]);
      const orgData = await api.get(`/orgs/${wsData.organization._id || wsData.organization}`);
      setProject(projData);
      setTasks(taskData);
      setMembers(orgData.members.map((m) => m.user));
      const member = orgData.members.find((m) => m.user._id === user?.id);
      setMyRole(member?.role || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const draggedTask = tasks.find((t) => t._id === draggableId);
    if (!draggedTask) return;

    const newStatus = destination.droppableId;
    const columnTasks = tasks
      .filter((t) => t.status === newStatus && t._id !== draggableId)
      .sort((a, b) => a.order - b.order);
    columnTasks.splice(destination.index, 0, { ...draggedTask, status: newStatus });

    const reordered = columnTasks.map((t, i) => ({ _id: t._id, status: newStatus, order: i }));

    const updatedTasks = tasks.map((t) => {
      if (t._id === draggableId) return { ...t, status: newStatus };
      const re = reordered.find((r) => r._id === t._id);
      if (re) return { ...t, order: re.order, status: re.status };
      return t;
    });
    updatedTasks.sort((a, b) => a.order - b.order);
    setTasks(updatedTasks);

    try {
      await api.put('/tasks/reorder/batch', { tasks: reordered });
    } catch (err) {
      setError(err.message);
      fetchData();
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const task = await api.post('/tasks', { ...taskData, project: id });
      setTasks([task, ...tasks]);
      setShowCreate(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAITasksCreated = (newTasks) => {
    setTasks([...newTasks, ...tasks]);
  };

  const handleTaskUpdate = (updated) => {
    if (updated._deleted) {
      setTasks(tasks.filter((t) => t._id !== updated._id));
      if (selectedTask?._id === updated._id) setSelectedTask(null);
    } else {
      setTasks(tasks.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-7 h-7 border-2 border-line border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-ink-950">
        <div className="max-w-7xl mx-auto px-4 py-8"><p className="text-gray-400">Project not found.</p></div>
      </div>
    );
  }

  const tabCounts = {
    All: tasks.length,
    Active: tasks.filter((t) => ['todo', 'in_progress', 'review'].includes(t.status)).length,
    Upcoming: tasks.filter((t) => t.dueDate && new Date(t.dueDate) > new Date() && t.status !== 'done').length,
    Done: tasks.filter((t) => t.status === 'done').length,
  };

  const filteredTasks = tasks.filter((t) => {
    if (tab === 'Active') return ['todo', 'in_progress', 'review'].includes(t.status);
    if (tab === 'Upcoming') return t.dueDate && new Date(t.dueDate) > new Date() && t.status !== 'done';
    if (tab === 'Done') return t.status === 'done';
    return true;
  });

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="mb-2 text-sm text-gray-400">
          <Link to="/dashboard" className="hover:text-gold transition-colors">Dashboard</Link>
          <span className="mx-2 text-gray-600">/</span>
          <Link to={`/workspaces/${project.workspace?._id || ''}`} className="hover:text-gold transition-colors">
            {project.workspace?.name || 'Workspace'}
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-white font-medium">{project.name}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Project</p>
            <h1 className="text-[26px] leading-tight text-white font-heading tracking-tight">{project.name}</h1>
            {project.description && <p className="text-gray-400 mt-1 text-sm">{project.description}</p>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex p-1 bg-ink-900 border border-line rounded-lg">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${view === 'list' ? 'bg-gold/15 text-gold' : 'text-gray-400 hover:text-white'}`}
              >
                List
              </button>
              <button
                onClick={() => setView('board')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${view === 'board' ? 'bg-gold/15 text-gold' : 'text-gray-400 hover:text-white'}`}
              >
                Board
              </button>
            </div>
            <button onClick={() => setShowActivity(!showActivity)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 bg-ink-900 border border-line hover:bg-ink-850 hover:border-gold/30 rounded-lg transition-colors ${showActivity ? 'ring-1 ring-gold/40' : ''}`}>
              <i className="fa-solid fa-clock-rotate-left text-xs text-gray-400"></i>
              Activity
            </button>
            <button onClick={() => setShowAI(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 bg-ink-900 border border-line hover:bg-ink-850 hover:border-gold/30 rounded-lg transition-colors">
              <i className="fa-solid fa-wand-magic-sparkles text-xs text-gold"></i>
              AI Generate
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink-950 bg-gold hover:bg-gold-hover rounded-lg transition-colors">
              <i className="fa-solid fa-plus text-xs"></i>
              New Task
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-coral/10 text-coral text-sm border-l-2 border-coral rounded-r-lg">{error}</div>
        )}

        {view === 'board' ? (
          <div className="flex gap-6 items-start">
            <div className="flex-1 min-w-0">
              <KanbanBoard tasks={tasks} onDragEnd={handleDragEnd} onTaskClick={setSelectedTask} />
            </div>
            {showActivity && (
              <div className="w-80 shrink-0">
                <div className="bg-ink-850 border border-line p-5 sticky top-6 rounded-xl">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-xs text-gold"></i>
                    Activity
                  </h3>
                  <ActivityLog projectId={id} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-6 items-start">
            <div className="flex-1 min-w-0">
              <div className="border border-line rounded-xl bg-ink-850 overflow-hidden">
                <div className="bg-ink-900/60 border-b border-line px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white">Tasks</h2>
                    <span className="text-xs text-gray-500">{filteredTasks.length} shown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {TABS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                          tab === t ? 'bg-gold/15 text-gold' : 'text-gray-400 hover:text-white hover:bg-ink-800'
                        }`}
                      >
                        {t}
                        <span className={`text-[10px] ${tab === t ? 'text-gold/70' : 'text-gray-500'}`}>{tabCounts[t]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {filteredTasks.length > 0 ? (
                  <div className="divide-y divide-line bg-ink-850">
                    {filteredTasks.map((task) => {
                      const p = PRIORITY_TAGS[task.priority] || PRIORITY_TAGS.medium;
                      const due = dueLabel(task.dueDate);
                      const selected = selectedTask?._id === task._id;
                      return (
                        <button
                          key={task._id}
                          onClick={() => setSelectedTask(task)}
                          className={`w-full flex items-center gap-4 px-5 py-3.5 transition-colors text-left ${
                            selected ? 'bg-gold/5 border-l-2 border-gold' : 'hover:bg-ink-800/50 border-l-2 border-transparent'
                          }`}
                        >
                          <i className={STATUS_ICONS[task.status] || STATUS_ICONS.todo}></i>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${selected ? 'text-gold' : 'text-gray-100 group-hover:text-white'}`}>
                              {task.title}
                            </p>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${p.cls}`}>
                            {p.label}
                          </span>
                          {due && (
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${due.cls}`}>
                              {due.label}
                            </span>
                          )}
                          <div className="w-7 h-7 rounded-full bg-ink-800 border border-line ring-1 ring-gold/30 flex items-center justify-center text-[10px] font-semibold text-gold shrink-0">
                            {initialsOf(task.assignee?.name)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-5 py-12 text-center bg-ink-850">
                    <p className="text-sm text-gray-400">No tasks match this filter.</p>
                  </div>
                )}
              </div>

              {showActivity && (
                <div className="mt-6">
                  <div className="bg-ink-850 border border-line p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-clock-rotate-left text-xs text-gold"></i>
                      Activity
                    </h3>
                    <ActivityLog projectId={id} />
                  </div>
                </div>
              )}
            </div>

            <div className="w-[380px] shrink-0">
              {selectedTask ? (
                <TaskDetailPane
                  task={selectedTask}
                  project={project}
                  members={members}
                  userRole={myRole}
                  onUpdate={handleTaskUpdate}
                  onClose={() => setSelectedTask(null)}
                />
              ) : (
                <div className="bg-ink-850 border border-dashed border-line rounded-xl px-5 py-16 text-center sticky top-6">
                  <div className="w-12 h-12 border border-gold/30 bg-gold/10 flex items-center justify-center mx-auto mb-4 rounded-xl">
                    <i className="fa-solid fa-arrow-pointer text-gold text-lg"></i>
                  </div>
                  <p className="text-sm font-medium text-gray-100">Select a task</p>
                  <p className="text-xs text-gray-500 mt-1">Choose a task from the list to view its details.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showCreate && (
          <CreateTask onSubmit={handleCreateTask} onCancel={() => setShowCreate(false)} members={members} />
        )}

        {showAI && (
          <AITaskGenerator projectId={id} members={members} onTasksCreated={handleAITasksCreated} onClose={() => setShowAI(false)} />
        )}
      </div>
    </div>
  );
}

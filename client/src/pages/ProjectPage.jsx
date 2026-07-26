import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import KanbanBoard from '../components/KanbanBoard';
import TaskDetail from '../components/TaskDetail';
import CreateTask from '../components/CreateTask';
import ActivityLog from '../components/ActivityLog';

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showActivity, setShowActivity] = useState(false);
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

  const handleTaskUpdate = (updated) => {
    if (updated._deleted) {
      setTasks(tasks.filter((t) => t._id !== updated._id));
    } else {
      setTasks(tasks.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 py-8"><p className="text-neutral-500">Project not found.</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-['Public_Sans',sans-serif]">
      <div className="max-w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-2 text-sm text-neutral-500">
          <Link to="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to={`/workspaces/${project.workspace?._id || ''}`} className="hover:text-teal-400 transition-colors">
            {project.workspace?.name || 'Workspace'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-200 font-medium">{project.name}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-50 font-['Space_Grotesk',sans-serif] tracking-tight">{project.name}</h1>
            {project.description && <p className="text-neutral-500 mt-1">{project.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowActivity(!showActivity)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-200 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 transition-colors ${showActivity ? 'ring-1 ring-teal-500/50' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Activity
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Task
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 text-red-400 text-sm rounded-lg border border-red-900/60">{error}</div>
        )}

        <div className="flex gap-6">
          <div className={`flex-1 min-w-0 ${showActivity ? 'pr-2' : ''}`}>
            <KanbanBoard tasks={tasks} onDragEnd={handleDragEnd} onTaskClick={setSelectedTask} />
          </div>

          {showActivity && (
            <div className="w-80 shrink-0">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 sticky top-6">
                <h3 className="font-semibold text-neutral-100 mb-4 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Activity
                </h3>
                <ActivityLog projectId={id} />
              </div>
            </div>
          )}
        </div>

        {showCreate && (
          <CreateTask onSubmit={handleCreateTask} onCancel={() => setShowCreate(false)} members={members} />
        )}

        {selectedTask && (
          <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleTaskUpdate} members={members} />
        )}
      </div>
    </div>
  );
}

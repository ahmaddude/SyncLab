import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import TaskDetail from '../components/TaskDetail';
import CreateTask from '../components/CreateTask';
import AITaskGenerator from '../components/AITaskGenerator';
import ActivityLog from '../components/ActivityLog';

export default function ProjectPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);
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
    } else {
      setTasks(tasks.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-7 h-7 border-2 border-brand-300 border-t-brand-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8"><p className="text-brand-500">Project not found.</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="h-[3px] bg-brand-800" />
      <div className="h-px bg-gold-400" />

      <div className="max-w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-2 text-sm text-brand-500">
          <Link to="/dashboard" className="hover:text-brand-800 transition-colors">Dashboard</Link>
          <span className="mx-2 text-brand-300">/</span>
          <Link to={`/workspaces/${project.workspace?._id || ''}`} className="hover:text-brand-800 transition-colors">
            {project.workspace?.name || 'Workspace'}
          </Link>
          <span className="mx-2 text-brand-300">/</span>
          <span className="text-brand-900 font-medium">{project.name}</span>
        </div>

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-300">
          <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-gold-500 uppercase mb-1">Project</p>
            <h1 className="text-[34px] leading-none text-brand-900 font-heading tracking-tight">{project.name}</h1>
            {project.description && <p className="text-brand-500 mt-2">{project.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowActivity(!showActivity)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-500 bg-white border border-brand-300 hover:border-brand-800 hover:text-brand-900 transition-colors ${showActivity ? 'ring-1 ring-brand-800/30' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Activity
            </button>
            <button onClick={() => setShowAI(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-500 bg-white border border-brand-300 hover:border-brand-800 hover:text-brand-900 transition-colors">
              <svg className="w-4 h-4 text-brand-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              AI Generate
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Task
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-[#FBEEEE] text-[#9B3B3B] text-sm border-l-2 border-[#9B3B3B]">{error}</div>
        )}

        <div className="flex gap-6">
          <div className={`flex-1 min-w-0 ${showActivity ? 'pr-2' : ''}`}>
            <KanbanBoard tasks={tasks} onDragEnd={handleDragEnd} onTaskClick={setSelectedTask} />
          </div>

          {showActivity && (
            <div className="w-80 shrink-0">
              <div className="bg-white border border-brand-300 p-5 sticky top-6">
                <h3 className="font-semibold text-brand-900 mb-4 flex items-center gap-2 font-heading">
                  <svg className="w-4 h-4 text-brand-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
          <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleTaskUpdate} members={members} userRole={myRole} />
        )}

        {showAI && (
          <AITaskGenerator projectId={id} members={members} onTasksCreated={handleAITasksCreated} onClose={() => setShowAI(false)} />
        )}
      </div>
    </div>
  );
}

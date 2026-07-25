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

  useEffect(() => {
    fetchData();
  }, [id]);

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

    const reordered = columnTasks.map((t, i) => ({
      _id: t._id,
      status: newStatus,
      order: i,
    }));

    const updatedTasks = tasks.map((t) => {
      if (t._id === draggableId) {
        return { ...t, status: newStatus };
      }
      const re = reordered.find((r) => r._id === t._id);
      if (re) {
        return { ...t, order: re.order, status: re.status };
      }
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
      <div className="flex items-center justify-center h-[calc(100vh-57px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 py-6">
      <div className="mb-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to={`/workspaces/${project.workspace?._id || ''}`} className="hover:text-primary-600">
          {project.workspace?.name || 'Workspace'}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{project.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1 text-sm">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowActivity(!showActivity)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
              showActivity
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
          >
            + New Task
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <div className="flex gap-6">
        <div className={`flex-1 ${showActivity ? 'pr-4' : ''}`}>
          <KanbanBoard
            tasks={tasks}
            onDragEnd={handleDragEnd}
            onTaskClick={setSelectedTask}
          />
        </div>

        {showActivity && (
          <div className="w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Activity</h3>
              <ActivityLog projectId={id} />
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTask
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreate(false)}
          members={members}
        />
      )}

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          members={members}
        />
      )}
    </div>
  );
}

const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const logActivity = (action, userId, projectId, taskId, details) => {
  Activity.create({ action, user: userId, project: projectId, task: taskId, details });
};

const createNotification = (data) => {
  Notification.create(data);
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, project, assignee, dueDate } = req.body;

    const maxOrder = await Task.findOne({ project, status }).sort('-order');
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project,
      assignee,
      dueDate,
      order,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    logActivity('task_created', req.user._id, project, task._id, `Created "${title}"`);

    if (assignee && assignee !== req.user._id.toString()) {
      createNotification({
        user: assignee,
        type: 'task_assigned',
        title: `You were assigned to "${title}"`,
        link: `/projects/${project}`,
        from: req.user._id,
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { project } = req.query;

    if (!project) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const tasks = await Task.find({ project })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('status order');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, priority, assignee, dueDate } = req.body;
    const oldStatus = task.status;
    const oldAssignee = task.assignee?.toString();

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;

    await task.save();

    if (assignee && assignee !== oldAssignee && assignee !== req.user._id.toString()) {
      createNotification({
        user: assignee,
        type: 'task_assigned',
        title: `You were assigned to "${task.title}"`,
        link: `/projects/${task.project}`,
        from: req.user._id,
      });
    }

    if (status && status !== oldStatus) {
      logActivity('task_moved', req.user._id, task.project, task._id,
        `Moved "${task.title}" from ${oldStatus} to ${status}`);
    } else {
      logActivity('task_updated', req.user._id, task.project, task._id,
        `Updated "${task.title}"`);
    }

    const populated = await task.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { status: t.status, order: t.order },
      },
    }));

    await Task.bulkWrite(bulkOps);

    res.json({ message: 'Tasks reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    logActivity('task_deleted', req.user._id, task.project, task._id,
      `Deleted "${task.title}"`);

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({ text, author: req.user._id });
    await task.save();

    logActivity('comment_added', req.user._id, task.project, task._id,
      `Commented on "${task.title}"`);

    if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
      createNotification({
        user: task.assignee,
        type: 'comment_added',
        title: `New comment on "${task.title}"`,
        link: `/projects/${task.project}`,
        from: req.user._id,
      });
    }

    const populated = await Task.findById(task._id)
      .populate('comments.author', 'name email avatar');

    res.json(populated.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only delete your own comments' });
    }

    comment.deleteOne();
    await task.save();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

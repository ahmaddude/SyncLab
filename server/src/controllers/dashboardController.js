const Organization = require('../models/Organization');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const orgs = await Organization.find({ 'members.user': userId })
      .populate('members.user', 'name email avatar');

    const orgIds = orgs.map((o) => o._id);

    const workspaces = await Workspace.find({ organization: { $in: orgIds } });
    const workspaceIds = workspaces.map((w) => w._id);

    const projects = await Project.find({ workspace: { $in: workspaceIds } })
      .populate('createdBy', 'name email avatar')
      .populate('workspace', 'name');
    const projectIds = projects.map((p) => p._id);

    const taskStatsRaw = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const taskStats = { todo: 0, in_progress: 0, review: 0, done: 0 };
    taskStatsRaw.forEach((s) => { taskStats[s._id] = s.count; });

    const myTasks = await Task.find({ project: { $in: projectIds }, assignee: userId })
      .populate('project', 'name')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(8);

    const recentActivity = await Activity.find({ project: { $in: projectIds } })
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(10);

    res.json({
      orgs,
      orgCount: orgs.length,
      workspaceCount: workspaces.length,
      projectCount: projects.length,
      taskStats,
      myTasks,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

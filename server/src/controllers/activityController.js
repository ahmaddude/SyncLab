const Activity = require('../models/Activity');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');

exports.getProjectActivity = async (req, res) => {
  try {
    const { project, organization } = req.query;

    if (organization) {
      const workspaces = await Workspace.find({ organization }).select('_id');
      const workspaceIds = workspaces.map((w) => w._id);
      const projects = await Project.find({ workspace: { $in: workspaceIds } }).select('_id');
      const projectIds = projects.map((p) => p._id);

      const activities = await Activity.find({ project: { $in: projectIds } })
        .populate('user', 'name email avatar')
        .populate('project', 'name')
        .sort('-createdAt')
        .limit(10);

      return res.json(activities);
    }

    if (!project) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const activities = await Activity.find({ project })
      .populate('user', 'name email avatar')
      .sort('-createdAt')
      .limit(50);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

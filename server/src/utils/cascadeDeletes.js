const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Document = require('../models/Document');
const Chat = require('../models/Chat');
const Activity = require('../models/Activity');

async function deleteProjectsCascade(projectIds) {
  if (!projectIds.length) return;
  await Task.deleteMany({ project: { $in: projectIds } });
  await Activity.deleteMany({ project: { $in: projectIds } });
  await Project.deleteMany({ _id: { $in: projectIds } });
}

async function deleteWorkspacesCascade(workspaceIds) {
  if (!workspaceIds.length) return;
  const projects = await Project.find({ workspace: { $in: workspaceIds } }).select('_id');
  await deleteProjectsCascade(projects.map((p) => p._id));
  await Document.deleteMany({ workspace: { $in: workspaceIds } });
  await Chat.deleteMany({ workspace: { $in: workspaceIds } });
  await Workspace.deleteMany({ _id: { $in: workspaceIds } });
}

module.exports = { deleteProjectsCascade, deleteWorkspacesCascade };

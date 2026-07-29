const Organization = require('../models/Organization');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Document = require('../models/Document');

async function getUserRole(orgId, userId) {
  const org = await Organization.findById(orgId);
  if (!org) return null;
  const member = org.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
}

async function getOrgFromWorkspace(workspaceId) {
  const ws = await Workspace.findById(workspaceId);
  return ws ? ws.organization : null;
}

async function getOrgFromProject(projectId) {
  const project = await Project.findById(projectId).populate('workspace');
  if (!project || !project.workspace) return null;
  return project.workspace.organization;
}

async function getOrgFromTask(taskId) {
  const task = await Task.findById(taskId).populate({ path: 'project', populate: { path: 'workspace' } });
  if (!task || !task.project || !task.project.workspace) return null;
  return task.project.workspace.organization;
}

async function getOrgFromDocument(docId) {
  const doc = await Document.findById(docId).populate('workspace');
  if (!doc || !doc.workspace) return null;
  const ws = await Workspace.findById(doc.workspace);
  return ws ? ws.organization : null;
}

function requireRole(...roles) {
  return (req, res, next) => {
    req._requiredRoles = roles;
    next();
  };
}

module.exports = { getUserRole, getOrgFromWorkspace, getOrgFromProject, getOrgFromTask, getOrgFromDocument, requireRole };

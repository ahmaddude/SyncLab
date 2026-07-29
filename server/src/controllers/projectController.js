const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const Organization = require('../models/Organization');
const { getUserRole } = require('../middleware/permissions');

const checkWorkspaceAccess = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return null;
  const org = await Organization.findById(workspace.organization);
  if (!org) return null;
  const isMember = org.members.some((m) => m.user.toString() === userId.toString());
  return isMember ? workspace : null;
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, workspace: workspaceId } = req.body;

    const workspace = await checkWorkspaceAccess(workspaceId, req.user._id);
    if (!workspace) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    const role = await getUserRole(workspace.organization, req.user._id);
    if (!role || !['owner', 'admin'].includes(role)) {
      return res.status(403).json({ message: 'Only owners and admins can create projects' });
    }

    const project = await Project.create({
      name,
      description,
      workspace: workspaceId,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { workspace: workspaceId } = req.query;

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    const workspace = await checkWorkspaceAccess(workspaceId, req.user._id);
    if (!workspace) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    const projects = await Project.find({ workspace: workspaceId })
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('workspace', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const workspace = await checkWorkspaceAccess(
      project.workspace._id,
      req.user._id
    );
    if (!workspace) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const workspace = await checkWorkspaceAccess(
      project.workspace,
      req.user._id
    );
    if (!workspace) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    const role = await getUserRole(workspace.organization, req.user._id);
    if (!role || !['owner', 'admin'].includes(role)) {
      return res.status(403).json({ message: 'Only owners and admins can update projects' });
    }

    const { name, description, status } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const workspace = await checkWorkspaceAccess(
      project.workspace,
      req.user._id
    );
    if (!workspace) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    const role = await getUserRole(workspace.organization, req.user._id);
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can delete projects' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

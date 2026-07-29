const Workspace = require('../models/Workspace');
const Organization = require('../models/Organization');
const { getUserRole } = require('../middleware/permissions');

const checkOrgAccess = async (orgId, userId) => {
  const org = await Organization.findById(orgId);
  if (!org) return null;
  const isMember = org.members.some((m) => m.user.toString() === userId.toString());
  return isMember ? org : null;
};

exports.createWorkspace = async (req, res) => {
  try {
    const { name, description, organization } = req.body;

    const role = await getUserRole(organization, req.user._id);
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can create workspaces' });
    }

    const workspace = await Workspace.create({
      name,
      description,
      organization,
      createdBy: req.user._id,
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkspaces = async (req, res) => {
  try {
    const { org } = req.query;

    if (!org) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const orgAccess = await checkOrgAccess(org, req.user._id);
    if (!orgAccess) {
      return res.status(403).json({ message: 'Not a member of this organization' });
    }

    const workspaces = await Workspace.find({ organization: org })
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('organization', 'name slug');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const orgAccess = await checkOrgAccess(
      workspace.organization._id,
      req.user._id
    );
    if (!orgAccess) {
      return res.status(403).json({ message: 'Not a member of this organization' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const role = await getUserRole(workspace.organization, req.user._id);
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can update workspaces' });
    }

    const { name, description } = req.body;
    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    await workspace.save();

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const role = await getUserRole(workspace.organization, req.user._id);
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can delete workspaces' });
    }

    await workspace.deleteOne();
    res.json({ message: 'Workspace deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

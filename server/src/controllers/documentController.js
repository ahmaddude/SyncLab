const Document = require('../models/Document');
const Workspace = require('../models/Workspace');
const Organization = require('../models/Organization');
const { getUserRole } = require('../middleware/permissions');

exports.getMyDocuments = async (req, res) => {
  try {
    const orgs = await Organization.find({ 'members.user': req.user._id }).select('_id');
    const orgIds = orgs.map((o) => o._id);
    const workspaces = await Workspace.find({ organization: { $in: orgIds } }).select('_id');
    const workspaceIds = workspaces.map((w) => w._id);
    const docs = await Document.find({ workspace: { $in: workspaceIds } })
      .populate('createdBy', 'name email avatar')
      .sort('-updatedAt');
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { title, workspace } = req.body;

    const ws = await Workspace.findById(workspace);
    if (!ws) return res.status(404).json({ message: 'Workspace not found' });

    const role = await getUserRole(ws.organization, req.user._id);
    if (!role || !['owner', 'admin'].includes(role)) {
      return res.status(403).json({ message: 'Only admins and owners can create documents' });
    }

    const doc = await Document.create({
      title,
      workspace,
      createdBy: req.user._id,
    });

    const populated = await doc.populate('createdBy', 'name email avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { workspace } = req.query;
    if (!workspace) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    const docs = await Document.find({ workspace })
      .populate('createdBy', 'name email avatar')
      .sort('-updatedAt');

    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('createdBy', 'name email avatar');

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const ws = await Workspace.findById(doc.workspace);
    if (!ws) return res.status(404).json({ message: 'Workspace not found' });

    const role = await getUserRole(ws.organization, req.user._id);
    if (!role) return res.status(403).json({ message: 'Not a member of this organization' });

    if (title !== undefined) doc.title = title;
    if (content !== undefined) doc.content = content;

    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const ws = await Workspace.findById(doc.workspace);
    if (!ws) return res.status(404).json({ message: 'Workspace not found' });

    const role = await getUserRole(ws.organization, req.user._id);
    if (!role || !['owner', 'admin'].includes(role)) {
      return res.status(403).json({ message: 'Only admins and owners can delete documents' });
    }

    await doc.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

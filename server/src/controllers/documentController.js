const Document = require('../models/Document');

exports.createDocument = async (req, res) => {
  try {
    const { title, workspace } = req.body;

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

    await doc.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

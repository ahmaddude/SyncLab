const Chat = require('../models/Chat');
const Workspace = require('../models/Workspace');
const Organization = require('../models/Organization');

exports.getChatHistory = async (req, res) => {
  try {
    const { workspace } = req.query;

    if (!workspace) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    const ws = await Workspace.findById(workspace);
    if (!ws) return res.status(404).json({ message: 'Workspace not found' });
    const org = await Organization.findById(ws.organization);
    if (!org || !org.members.some((m) => m.user.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this organization' });
    }

    let chat = await Chat.findOne({ workspace }).populate('messages.author', 'name email avatar');

    if (!chat) {
      return res.json([]);
    }

    const messages = chat.messages.slice(-100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

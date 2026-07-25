const Chat = require('../models/Chat');

exports.getChatHistory = async (req, res) => {
  try {
    const { workspace } = req.query;

    if (!workspace) {
      return res.status(400).json({ message: 'Workspace ID is required' });
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

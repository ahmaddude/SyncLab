const Activity = require('../models/Activity');

exports.getProjectActivity = async (req, res) => {
  try {
    const { project } = req.query;

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

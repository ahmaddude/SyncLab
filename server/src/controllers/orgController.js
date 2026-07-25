const Organization = require('../models/Organization');

exports.createOrg = async (req, res) => {
  try {
    const { name, description } = req.body;

    const org = await Organization.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrgs = async (req, res) => {
  try {
    const orgs = await Organization.find({
      'members.user': req.user._id,
    }).populate('members.user', 'name email avatar');

    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrg = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id).populate(
      'members.user',
      'name email avatar'
    );

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isMember = org.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this organization' });
    }

    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const currentUserMember = org.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!currentUserMember || !['owner', 'admin'].includes(currentUserMember.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    const alreadyMember = org.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({ message: 'User is already a member' });
    }

    org.members.push({ user: userToAdd._id, role: role || 'member' });
    await org.save();

    const updated = await Organization.findById(org._id).populate(
      'members.user',
      'name email avatar'
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

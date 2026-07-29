const Organization = require('../models/Organization');
const { getUserRole } = require('../middleware/permissions');

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

exports.updateOrg = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const role = await getUserRole(req.params.id, req.user._id);
    if (role !== 'owner') return res.status(403).json({ message: 'Only the owner can update the organization' });

    const { name, description } = req.body;
    if (name) org.name = name;
    if (description !== undefined) org.description = description;
    await org.save();

    const updated = await Organization.findById(org._id).populate('members.user', 'name email avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOrg = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const role = await getUserRole(req.params.id, req.user._id);
    if (role !== 'owner') return res.status(403).json({ message: 'Only the owner can delete the organization' });

    await org.deleteOne();
    res.json({ message: 'Organization deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email, role: memberRole } = req.body;
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const currentUserRole = await getUserRole(req.params.id, req.user._id);
    if (!currentUserRole || !['owner', 'admin'].includes(currentUserRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with that email' });

    if (org.members.some((m) => m.user.toString() === userToAdd._id.toString())) {
      return res.status(409).json({ message: 'User is already a member' });
    }

    org.members.push({ user: userToAdd._id, role: memberRole || 'member' });
    await org.save();

    const updated = await Organization.findById(org._id).populate('members.user', 'name email avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const currentUserRole = await getUserRole(req.params.id, req.user._id);
    if (!currentUserRole || !['owner', 'admin'].includes(currentUserRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const memberId = req.params.memberId;
    if (memberId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove yourself' });
    }

    const member = org.members.find((m) => m.user.toString() === memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (member.role === 'owner') {
      return res.status(403).json({ message: 'Cannot remove the owner' });
    }

    if (currentUserRole === 'admin' && member.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot remove other admins' });
    }

    org.members.pull({ user: memberId });
    await org.save();

    const updated = await Organization.findById(org._id).populate('members.user', 'name email avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const currentUserRole = await getUserRole(req.params.id, req.user._id);
    if (currentUserRole !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can change member roles' });
    }

    const memberId = req.params.memberId;
    const { role: newRole } = req.body;
    if (!['admin', 'member'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or member' });
    }

    const member = org.members.find((m) => m.user.toString() === memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (member.role === 'owner') {
      return res.status(403).json({ message: 'Cannot change the owner role' });
    }

    member.role = newRole;
    await org.save();

    const updated = await Organization.findById(org._id).populate('members.user', 'name email avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

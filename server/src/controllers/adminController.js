const User = require('../models/User');

// Create a new admin (admin/support) - only super_admin can do this
exports.createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, password, role, permissions } = req.body;
    if (!['admin', 'support'].includes(role)) {
      return res.status(400).json({ error: 'Invalid admin role.' });
    }
    const exists = await User.findOne({ $or: [ { email }, { username } ] });
    if (exists) return res.status(409).json({ error: 'User already exists.' });
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      phone,
      passwordHash,
      role,
      permissions: permissions || [],
      isActive: true,
    });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin.' });
  }
};

// Promote existing user to admin/support
exports.promoteToAdmin = async (req, res) => {
  try {
    const { identifier, role, permissions } = req.body;
    if (!['admin', 'support'].includes(role)) {
      return res.status(400).json({ error: 'Invalid admin role.' });
    }
    const user = await User.findOne({ $or: [ { email: identifier }, { username: identifier } ] });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.role = role;
    user.permissions = permissions || [];
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to promote user.' });
  }
};

// Demote admin/support to regular user
exports.demoteAdmin = async (req, res) => {
  try {
    const { identifier, newRole } = req.body;
    const user = await User.findOne({ $or: [ { email: identifier }, { username: identifier } ] });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.role = newRole || 'tenant';
    user.permissions = [];
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to demote admin.' });
  }
};

// Update admin permissions
exports.updateAdminPermissions = async (req, res) => {
  try {
    const { identifier, permissions } = req.body;
    const user = await User.findOne({ $or: [ { email: identifier }, { username: identifier } ] });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.permissions = permissions || [];
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update permissions.' });
  }
};

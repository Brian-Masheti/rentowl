const User = require('../models/User');
const Landlord = require('../models/Landlord');
const Tenant = require('../models/Tenant');
const Caretaker = require('../models/Caretaker');
const bcrypt = require('bcrypt');

// Get current user's profile (works for all roles)
const getMyProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    let user = null;
    if (role === 'landlord') {
      user = await Landlord.findById(id).select('-passwordHash');
    } else if (role === 'tenant') {
      user = await Tenant.findById(id).select('-passwordHash');
    } else if (role === 'caretaker') {
      user = await Caretaker.findById(id).select('-passwordHash');
    } else {
      user = await User.findById(id).select('-passwordHash');
    }
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// Update current user's profile (name, email, phone, etc.)
const updateMyProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const updates = req.body;
    let user = null;
    if (role === 'landlord') {
      user = await Landlord.findByIdAndUpdate(id, updates, { new: true, select: '-passwordHash' });
    } else if (role === 'tenant') {
      user = await Tenant.findByIdAndUpdate(id, updates, { new: true, select: '-passwordHash' });
    } else if (role === 'caretaker') {
      user = await Caretaker.findByIdAndUpdate(id, updates, { new: true, select: '-passwordHash' });
    } else {
      user = await User.findByIdAndUpdate(id, updates, { new: true, select: '-passwordHash' });
    }
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// Change current user's password
const changeMyPassword = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required.' });
    let user = null;
    if (role === 'landlord') {
      user = await Landlord.findById(id);
    } else if (role === 'tenant') {
      user = await Tenant.findById(id);
    } else if (role === 'caretaker') {
      user = await Caretaker.findById(id);
    } else {
      user = await User.findById(id);
    }
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
};

// Get current user's notification preferences
const getMyNotificationPrefs = async (req, res) => {
  try {
    const { id, role } = req.user;
    let user = null;
    if (role === 'landlord') {
      user = await Landlord.findById(id).select('notificationPrefs');
    } else if (role === 'tenant') {
      user = await Tenant.findById(id).select('notificationPrefs');
    } else if (role === 'caretaker') {
      user = await Caretaker.findById(id).select('notificationPrefs');
    } else {
      user = await User.findById(id).select('notificationPrefs');
    }
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ notificationPrefs: user.notificationPrefs || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification preferences.' });
  }
};

// Update current user's notification preferences
const updateMyNotificationPrefs = async (req, res) => {
  try {
    const { id, role } = req.user;
    const updates = req.body;
    let user = null;
    if (role === 'landlord') {
      user = await Landlord.findByIdAndUpdate(id, { notificationPrefs: updates }, { new: true, select: 'notificationPrefs' });
    } else if (role === 'tenant') {
      user = await Tenant.findByIdAndUpdate(id, { notificationPrefs: updates }, { new: true, select: 'notificationPrefs' });
    } else if (role === 'caretaker') {
      user = await Caretaker.findByIdAndUpdate(id, { notificationPrefs: updates }, { new: true, select: 'notificationPrefs' });
    } else {
      user = await User.findByIdAndUpdate(id, { notificationPrefs: updates }, { new: true, select: 'notificationPrefs' });
    }
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ notificationPrefs: user.notificationPrefs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification preferences.' });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getMyNotificationPrefs,
  updateMyNotificationPrefs
};

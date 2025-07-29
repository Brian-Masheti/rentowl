const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Landlord = require('../models/Landlord');
const Tenant = require('../models/Tenant');
const Caretaker = require('../models/Caretaker');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function generateUserToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      permissions: user.permissions || []
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Password validation function
function isStrongPassword(password) {
  // At least 8 chars, 1 upper, 1 lower, 1 number, 1 symbol (!@#$)
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$])[A-Za-z\d!@#$]{8,}$/.test(password);
}

const register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, password, role, landlord } = req.body;
    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields required.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters, include upper and lower case letters, a number, and a symbol (!@#$).' });
    }
    // Prevent public registration as super admin
    if (role === 'super_admin') {
      return res.status(403).json({ error: 'Registration as super admin is not allowed.' });
    }
    // Check all collections for existing user
    const existingLandlord = await Landlord.findOne({ $or: [ { username }, { email }, { phone } ] });
    const existingTenant = await Tenant.findOne({ $or: [ { username }, { email }, { phone } ] });
    const existingCaretaker = await Caretaker.findOne({ $or: [ { username }, { email }, { phone } ] });
    const existingUser = await User.findOne({ $or: [ { username }, { email }, { phone } ] });
    if (existingLandlord || existingTenant || existingCaretaker || existingUser) {
      return res.status(409).json({ error: 'Username, email, or phone already taken.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    let user, token;
    if (role === 'landlord') {
      user = await Landlord.create({ firstName, lastName, username, email, phone, passwordHash, isActive: true });
      token = jwt.sign(
        { id: user._id, username: user.username, role: 'landlord' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    } else if (role === 'tenant') {
      const landlordId = landlord || (req.user && req.user.id);
      user = await Tenant.create({ firstName, lastName, username, email, phone, passwordHash, isActive: true, landlord: landlordId });
      await User.create({
        firstName,
        lastName,
        username,
        email,
        phone,
        passwordHash,
        role: 'tenant',
        isActive: true,
      });
      token = jwt.sign(
        { id: user._id, username: user.username, role: 'tenant' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    } else if (role === 'caretaker') {
      user = await Caretaker.create({ firstName, lastName, username, email, phone, passwordHash, isActive: true });
      token = jwt.sign(
        { id: user._id, username: user.username, role: 'caretaker' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    } else {
      user = await User.create({ firstName, lastName, username, email, phone, passwordHash, role });
      token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    }
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: role,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    let user = await User.findOne({ $or: [ { username: identifier }, { email: identifier } ] });
    let role = user && user.role;
    if (!user) {
      user = await Landlord.findOne({ $or: [ { username: identifier }, { email: identifier } ] });
      role = user ? 'landlord' : undefined;
    }
    if (!user) {
      user = await Tenant.findOne({ $or: [ { username: identifier }, { email: identifier } ] });
      role = user ? 'tenant' : undefined;
    }
    if (!user) {
      user = await Caretaker.findOne({ $or: [ { username: identifier }, { email: identifier } ] });
      role = user ? 'caretaker' : undefined;
    }
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = generateUserToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};

const usernameAvailable = async (req, res) => {
  try {
    const { username } = req.params;
    const exists = await User.exists({ username });
    res.json({ available: !exists });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check username.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user && req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

// Dedicated admin login (super admin only)
const adminLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    let user = await User.findOne({ $or: [ { username: identifier }, { email: identifier } ] });
    if (!user || user.role !== 'super_admin') {
      return res.status(401).json({ error: 'Admin access only.' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = generateUserToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed.' });
  }
};

module.exports = {
  register,
  login,
  usernameAvailable,
  getMe,
  adminLogin
};

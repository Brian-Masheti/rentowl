const Caretaker = require('../models/Caretaker');
const Property = require('../models/Property');
const bcrypt = require('bcrypt');

// List all caretakers (optionally filter by isActive)
const listCaretakers = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = typeof active === 'undefined' ? {} : { isActive: active === 'true' };
    const caretakers = await Caretaker.find(filter).select('-passwordHash');
    res.json({ caretakers });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch caretakers.' });
  }
};

// Get caretaker by ID
const getCaretakerById = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id).select('-passwordHash');
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found.' });
    res.json({ caretaker });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch caretaker.' });
  }
};

// Create caretaker
const createCaretaker = async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, password } = req.body;
    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const caretaker = await Caretaker.create({
      firstName, lastName, username, email, phone, passwordHash, isActive: true
    });
    res.status(201).json({ caretaker });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to create caretaker.' });
  }
};

// Update caretaker (info, status, password)
const updateCaretaker = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    const caretaker = await Caretaker.findByIdAndUpdate(id, updates, { new: true }).select('-passwordHash');
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found.' });
    res.json({ caretaker });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to update caretaker.' });
  }
};

// Soft delete caretaker (set isActive: false)
const deactivateCaretaker = async (req, res) => {
  try {
    const { id } = req.params;
    const caretaker = await Caretaker.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-passwordHash');
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found.' });
    res.json({ caretaker });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to deactivate caretaker.' });
  }
};

// Hard delete caretaker
const deleteCaretaker = async (req, res) => {
  try {
    const { id } = req.params;
    const caretaker = await Caretaker.findByIdAndDelete(id);
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found.' });
    res.json({ message: 'Caretaker deleted.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to delete caretaker.' });
  }
};

// Assignment overview: list properties assigned to a caretaker
const getCaretakerAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const properties = await Property.find({ caretaker: id, isDeleted: { $ne: true } });
    res.json({ properties });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
};

module.exports = {
  listCaretakers,
  getCaretakerById,
  createCaretaker,
  updateCaretaker,
  deactivateCaretaker,
  deleteCaretaker,
  getCaretakerAssignments,
};

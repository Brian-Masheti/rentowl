const Caretaker = require('../models/Caretaker');

// Get all active caretakers
const getActiveCaretakers = async (req, res) => {
  try {
    const caretakers = await Caretaker.find({ isActive: true }).select('-passwordHash');
    res.json({ caretakers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch caretakers.' });
  }
};

module.exports = {
  getActiveCaretakers,
};

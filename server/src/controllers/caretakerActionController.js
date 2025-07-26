const CaretakerAction = require('../models/CaretakerAction');
const Caretaker = require('../models/Caretaker');
const Property = require('../models/Property');
const { Parser } = require('json2csv');

// Log a new caretaker action
exports.createCaretakerAction = async (req, res) => {
  try {
    const { caretaker, property, actionType, description, status } = req.body;
    if (!caretaker || !actionType || !description) {
      return res.status(400).json({ error: 'caretaker, actionType, and description are required.' });
    }
    const action = await CaretakerAction.create({
      caretaker,
      property,
      actionType,
      description,
      status: status || 'completed',
    });
    // Emit real-time event via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Populate caretaker and property for the event
      const populatedAction = await action.populate([
        { path: 'caretaker', select: 'firstName lastName email' },
        { path: 'property', select: 'name' }
      ]);
      io.emit('caretakerAction:new', populatedAction);
    }
    res.status(201).json({ action });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log caretaker action.' });
  }
};

// Fetch caretaker actions with filters
exports.getCaretakerActions = async (req, res) => {
  try {
    const { caretaker, property, actionType, status, startDate, endDate, limit = 100, skip = 0 } = req.query;
    const filter = {};
    if (caretaker) filter.caretaker = caretaker;
    if (property) filter.property = property;
    if (actionType) filter.actionType = actionType;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    const actions = await CaretakerAction.find(filter)
      .populate('caretaker', 'firstName lastName email')
      .populate('property', 'name')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json({ actions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch caretaker actions.' });
  }
};

// Export caretaker actions as CSV
exports.exportCaretakerActionsCSV = async (req, res) => {
  try {
    const { caretaker, property, actionType, status, startDate, endDate } = req.query;
    const filter = {};
    if (caretaker) filter.caretaker = caretaker;
    if (property) filter.property = property;
    if (actionType) filter.actionType = actionType;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    const actions = await CaretakerAction.find(filter)
      .populate('caretaker', 'firstName lastName email')
      .populate('property', 'name')
      .sort({ createdAt: -1 });
    const fields = [
      { label: 'Caretaker', value: row => `${row.caretaker?.firstName || ''} ${row.caretaker?.lastName || ''}`.trim() },
      { label: 'Caretaker Email', value: 'caretaker.email' },
      { label: 'Property', value: 'property.name' },
      { label: 'Action Type', value: 'actionType' },
      { label: 'Description', value: 'description' },
      { label: 'Status', value: 'status' },
      { label: 'Date', value: row => row.createdAt?.toISOString() },
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(actions);
    res.header('Content-Type', 'text/csv');
    res.attachment('caretaker_actions.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export caretaker actions.' });
  }
};

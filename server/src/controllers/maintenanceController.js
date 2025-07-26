const MaintenanceRequest = require('../models/MaintenanceRequest');
const Property = require('../models/Property');

// Create a maintenance request (Tenant)
const createRequest = async (req, res) => {
  try {
    const { property, description, urgency } = req.body;
    const tenant = req.user && req.user.id;
    // Handle images
    let images = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map(file => file.path);
    } else if (req.files && req.files['images']) {
      images = req.files['images'].map(file => file.path);
    }
    // Find caretaker for the property
    const prop = await Property.findById(property);
    const caretaker = prop && prop.caretaker ? prop.caretaker : null;
    const request = await MaintenanceRequest.create({
      property,
      tenant,
      caretaker,
      description,
      urgency,
      images,
      status: 'pending',
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create maintenance request.' });
  }
};

// List requests for a tenant
const getTenantRequests = async (req, res) => {
  try {
    const tenant = req.user && req.user.id;
    const requests = await MaintenanceRequest.find({ tenant }).populate('property caretaker');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

// List requests for a caretaker
const getCaretakerRequests = async (req, res) => {
  try {
    const caretaker = req.user && req.user.id;
    const requests = await MaintenanceRequest.find({ caretaker }).populate('property tenant');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

// Update status and resolution (Caretaker)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    let update = { status };
    if (resolutionNotes) update.resolutionNotes = resolutionNotes;
    // Optionally handle new images
    if (req.files && req.files['images']) {
      update.$push = { images: { $each: req.files['images'].map(file => file.path) } };
    }
    const request = await MaintenanceRequest.findByIdAndUpdate(id, update, { new: true });
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request.' });
  }
};

// Escalate unresolved requests (system or admin)
const escalateUnresolved = async (req, res) => {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const escalated = await MaintenanceRequest.updateMany(
      { status: { $in: ['pending', 'in_progress'] }, updatedAt: { $lte: fortyEightHoursAgo } },
      { status: 'escalated' }
    );
    res.json({ message: 'Escalation check complete', escalated: escalated.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to escalate requests.' });
  }
};

module.exports = {
  createRequest,
  getTenantRequests,
  getCaretakerRequests,
  updateRequestStatus,
  escalateUnresolved
};

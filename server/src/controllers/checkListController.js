const CheckList = require('../models/CheckList');
const path = require('path');

// Create a checklist (caretaker or landlord if no caretaker)
exports.createCheckList = async (req, res) => {
  try {
    const { type, property, unit, unitType, tenant, items } = req.body;
    // Fetch property to check caretaker assignment
    const Property = require('../models/Property');
    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) return res.status(404).json({ error: 'Property not found.' });
    // If caretaker assigned, only caretaker can create; else landlord
    const caretakerId = propertyDoc.caretaker ? propertyDoc.caretaker.toString() : null;
    if (caretakerId) {
      if (req.user.role !== 'caretaker' || req.user.id !== caretakerId) {
        return res.status(403).json({ error: 'Only the assigned caretaker can create a checklist for this property.' });
      }
    } else {
      if (req.user.role !== 'landlord') {
        return res.status(403).json({ error: 'Only the landlord can create a checklist for this property.' });
      }
    }
    // Validate required fields
    if (!tenant) return res.status(400).json({ error: 'Tenant is required.' });
    if (!property) return res.status(400).json({ error: 'Property is required.' });
    if (!unitType) return res.status(400).json({ error: 'Unit type is required.' });
    if (!caretakerId && !req.user.id) return res.status(400).json({ error: 'Caretaker or creator is required.' });
    const checklist = await CheckList.create({
      type,
      property,
      unit,
      unitType,
      caretaker: caretakerId,
      tenant,
      createdBy: req.user.id,
      items: items || [],
      status: 'pending',
    });
    res.status(201).json({ checklist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create checklist.' });
  }
};

// List checklists (landlord/tenant)
exports.listCheckLists = async (req, res) => {
  try {
    const { type, property, tenant, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (property) filter.property = property;
    if (tenant) filter.tenant = tenant;
    if (status) filter.status = status;
    // Landlord: see all for their properties; Tenant: see only their own
    if (req.user.role === 'tenant') filter.tenant = req.user.id;
    const lists = await CheckList.find(filter)
      .populate({
        path: 'property',
        select: 'name unitType caretaker',
        populate: { path: 'caretaker', select: 'firstName lastName email' }
      })
      .populate('tenant', 'firstName lastName email')
      .populate('caretaker', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');
    console.log('DEBUG: Populated checklists:', JSON.stringify(lists, null, 2));
    // Transform checklists for frontend compatibility
    const transformed = lists.map(cl => {
      const obj = cl.toObject();
      // Ensure unitType at root (fallback to property.unitType if missing)
      if (!obj.unitType && obj.property && obj.property.unitType) {
        obj.unitType = obj.property.unitType;
      }
      // Map items to include a single photo field for frontend
      if (Array.isArray(obj.items)) {
        obj.items = obj.items.map(item => ({
          ...item,
          photo: Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : null
        }));
      }
      return obj;
    });
    res.json({ checklists: transformed });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch checklists.' });
  }
};

// Update checklist items/comments (landlord only)
exports.updateCheckList = async (req, res) => {
  try {
    const checklist = await CheckList.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found.' });
    if (req.user.role !== 'landlord' && req.user.id !== checklist.createdBy.toString()) {
      return res.status(403).json({ error: 'Permission denied.' });
    }
    const { items, landlordComment } = req.body;
    if (items) checklist.items = items;
    if (landlordComment) checklist.landlordComment = landlordComment;
    checklist.updatedAt = new Date();
    await checklist.save();
    res.json({ checklist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update checklist.' });
  }
};

// Tenant signs checklist
exports.tenantSignCheckList = async (req, res) => {
  try {
    const checklist = await CheckList.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found.' });
    if (req.user.role !== 'tenant' || checklist.tenant.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the assigned tenant can sign.' });
    }
    const { signature, comment } = req.body;
    if (!signature || typeof signature !== 'string' || signature.trim().length < 3) {
      return res.status(400).json({ error: 'Signature (full name) is required.' });
    }
    checklist.signedByTenant = true;
    checklist.tenantSignature = signature.trim();
    checklist.tenantComment = comment || checklist.tenantComment;
    checklist.tenantSignedAt = new Date();
    checklist.status = checklist.signedByLandlord ? 'completed' : 'signed_by_tenant';
    await checklist.save();
    res.json({ checklist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sign checklist.' });
  }
};

// Landlord signs checklist
exports.landlordSignCheckList = async (req, res) => {
  try {
    const checklist = await CheckList.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found.' });
    if (req.user.role !== 'landlord' && req.user.id !== checklist.createdBy.toString()) {
      return res.status(403).json({ error: 'Only the landlord can sign.' });
    }
    const { signature, comment } = req.body;
    if (!signature || typeof signature !== 'string' || signature.trim().length < 3) {
      return res.status(400).json({ error: 'Signature (full name) is required.' });
    }
    checklist.signedByLandlord = true;
    checklist.landlordSignature = signature.trim();
    checklist.landlordComment = comment || checklist.landlordComment;
    checklist.landlordSignedAt = new Date();
    checklist.status = checklist.signedByTenant ? 'completed' : 'signed_by_landlord';
    await checklist.save();
    res.json({ checklist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sign checklist.' });
  }
};

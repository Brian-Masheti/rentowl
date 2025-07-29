const LegalDocument = require('../models/LegalDocument');
const path = require('path');

// Upload a legal document
exports.uploadDocument = async (req, res) => {
  try {
    const { name, type, property, tenant, tags } = req.body;
    if (!req.file) return res.status(400).json({ error: 'File is required.' });
    const filePath = req.file.path.replace(/\\/g, '/');
    const doc = await LegalDocument.create({
      name,
      type,
      filePath,
      property: property || undefined,
      tenant: tenant || undefined,
      uploadedBy: req.user.id,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
    });
    res.status(201).json({ document: doc });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload document.' });
  }
};

// List all legal documents (with optional filters)
exports.listDocuments = async (req, res) => {
  try {
    const { type, property, tenant, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (property) filter.property = property;
    if (tenant) filter.tenant = tenant;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const docs = await LegalDocument.find(filter)
      .populate('property', 'name')
      .populate('tenant', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName email');
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
};

// Download a legal document
exports.downloadDocument = async (req, res) => {
  try {
    const doc = await LegalDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    res.download(path.resolve(doc.filePath), doc.name);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download document.' });
  }
};

// Delete a legal document
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await LegalDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    // Only allow uploader or super_admin to delete
    if (req.user.role !== 'super_admin' && doc.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied.' });
    }
    await doc.deleteOne();
    res.json({ message: 'Document deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document.' });
  }
};

// Tenant signs a legal document
exports.signDocument = async (req, res) => {
  try {
    const doc = await LegalDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    if (!doc.tenant || doc.tenant.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the assigned tenant can sign this document.' });
    }
    if (doc.signedByTenant) {
      return res.status(400).json({ error: 'Document already signed.' });
    }
    const { signature, agreed } = req.body;
    if (!agreed) return res.status(400).json({ error: 'You must agree to the terms before signing.' });
    if (!signature || typeof signature !== 'string' || signature.trim().length < 3) {
      return res.status(400).json({ error: 'Signature (full name) is required.' });
    }
    doc.signedByTenant = true;
    doc.tenantSignature = signature.trim();
    doc.signedAt = new Date();
    doc.signedIp = req.ip;
    await doc.save();
    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sign document.' });
  }
};

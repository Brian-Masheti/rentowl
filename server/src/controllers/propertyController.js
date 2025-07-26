const Property = require('../models/Property');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// CREATE property
const createProperty = async (req, res) => {
  try {
    let { name, address, units, description } = req.body;
    if (typeof units === 'string') {
      units = JSON.parse(units);
    }
    if (!name || !address || !units) {
      return res.status(400).json({ error: 'Name, address, and units are required.' });
    }
    const landlord = req.user && req.user.id;

    // Handle file uploads and generate thumbnails
    let profilePic, profilePicThumb, gallery = [], galleryThumbs = [];
    const makeThumb = async (origPath) => {
      const ext = path.extname(origPath);
      const base = path.basename(origPath, ext);
      const thumbDir = path.join(path.dirname(origPath), 'thumbs');
      if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
      const thumbPath = path.join(thumbDir, `${base}_thumb${ext}`);
      await sharp(origPath)
        .resize(300, 300, { fit: 'inside' })
        .toFile(thumbPath);
      return thumbPath.replace(/\\/g, '/');
    };
    if (req.files && req.files.profilePic) {
      profilePic = req.files.profilePic[0].path.replace(/\\/g, '/');
      profilePicThumb = await makeThumb(req.files.profilePic[0].path);
    }
    if (req.files && req.files.gallery) {
      gallery = req.files.gallery.map(file => file.path.replace(/\\/g, '/'));
      for (const file of req.files.gallery) {
        const thumb = await makeThumb(file.path);
        galleryThumbs.push(thumb);
      }
    }

    const property = await Property.create({
      name,
      address,
      landlord,
      units,
      description,
      tenants: [],
      profilePic,
      profilePicThumb,
      gallery,
      galleryThumbs,
    });
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create property.', details: err instanceof Error ? err.message : err });
  }
};

// GET all properties for landlord (with populated tenants)
const getLandlordProperties = async (req, res) => {
  try {
    const landlord = req.user && req.user.id;
    const properties = await Property.find({ landlord, isDeleted: { $ne: true } })
      .populate({
        path: 'tenants.tenant',
        model: 'Tenant',
        select: 'firstName lastName email phone',
      });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties.' });
  }
};

// GET property by ID (with populated tenants)
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id)
      .populate({
        path: 'tenants.tenant',
        model: 'Tenant',
        select: 'firstName lastName email phone',
      });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property.' });
  }
};

// UPDATE property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const property = await Property.findByIdAndUpdate(id, updates, { new: true })
      .populate({
        path: 'tenants.tenant',
        model: 'Tenant',
        select: 'firstName lastName email phone',
      });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update property.' });
  }
};

// DELETE property (soft delete)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json({ message: 'Property soft deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property.' });
  }
};

// REMOVE tenant from property
const removeTenantFromProperty = async (req, res) => {
  try {
    const { propertyId, tenantId } = req.params;
    const updated = await Property.findByIdAndUpdate(
      propertyId,
      { $pull: { tenants: { tenant: tenantId } } },
      { new: true }
    ).populate({
      path: 'tenants.tenant',
      model: 'Tenant',
      select: 'firstName lastName email phone',
    });
    if (!updated) return res.status(404).json({ error: 'Property not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove tenant from property.' });
  }
};

module.exports = {
  createProperty,
  getLandlordProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  removeTenantFromProperty
};

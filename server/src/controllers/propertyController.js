const Property = require('../models/Property');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Caretaker = require('../models/Caretaker');

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

    // Grouped units by floor with auto-generated labels
    let groupedUnits = [];
    if (Array.isArray(units)) {
      // Group all units by floor name, only include floors with non-empty units
      const floorMap = {};
      units.forEach((floorObj, floorIdx) => {
        const floorLabel = floorObj.floor || (floorIdx === 0 ? 'Ground' : floorIdx === 1 ? 'First' : `${floorIdx}F`);
        if (!floorMap[floorLabel]) floorMap[floorLabel] = [];
        let typeCounts = {};
        (floorObj.units || []).forEach((unit) => {
          // For mixed: label = G + type initial + number (e.g., GB1, G1B2, FB1, 2F2B3)
          const typeKey = unit.type;
          typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
          let label = '';
          if (floorLabel.toLowerCase().startsWith('ground')) label = `G${typeKey[0].toUpperCase()}${typeCounts[typeKey]}`;
          else if (floorLabel.toLowerCase().startsWith('first')) label = `F${typeKey[0].toUpperCase()}${typeCounts[typeKey]}`;
          else {
            const match = floorLabel.match(/(\d+)/);
            if (match) label = `${match[1]}F${typeKey[0].toUpperCase()}${typeCounts[typeKey]}`;
            else label = `${floorLabel[0].toUpperCase()}${typeKey[0].toUpperCase()}${typeCounts[typeKey]}`;
          }
          floorMap[floorLabel].push({
            ...unit,
            label,
            floor: floorLabel,
            status: unit.status || 'vacant',
            tenant: unit.tenant || null
          });
        });
      });
      groupedUnits = Object.entries(floorMap)
        .filter(([_, unitsArr]) => unitsArr.length > 0)
        .map(([floor, unitsArr]) => ({ floor, units: unitsArr }));
    }

    // Handle file uploads and generate thumbnails
    let profilePic, profilePicThumb, gallery = [], galleryThumbs = [];
    const makeThumb = async (origPath) => {
      try {
        if (!fs.existsSync(origPath)) {
          console.warn('makeThumb: File does not exist:', origPath);
          return null;
        }
        const ext = path.extname(origPath);
        const base = path.basename(origPath, ext);
        const thumbDir = path.join(path.dirname(origPath), 'thumbs');
        if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
        const thumbPath = path.join(thumbDir, `${base}_thumb${ext}`);
        await sharp(origPath)
          .resize(300, 300, { fit: 'inside' })
          .toFile(thumbPath);
        return thumbPath.replace(/\\/g, '/');
      } catch (err) {
        console.warn('makeThumb error:', err.message || err);
        return null;
      }
    };
    try {
      if (req.files && req.files.profilePic) {
        profilePic = req.files.profilePic[0].path.replace(/\\/g, '/');
        if (fs.existsSync(req.files.profilePic[0].path)) {
          profilePicThumb = await makeThumb(req.files.profilePic[0].path);
        } else {
          console.warn('Profile pic file missing:', req.files.profilePic[0].path);
        }
      }
      if (req.files && req.files.gallery) {
        gallery = req.files.gallery.map(file => file.path.replace(/\\/g, '/'));
        for (const file of req.files.gallery) {
          if (fs.existsSync(file.path)) {
            galleryThumbs.push(await makeThumb(file.path));
          } else {
            console.warn('Gallery image file missing:', file.path);
          }
        }
      }
    } catch (err) {
      console.warn('Image processing error:', err);
    }

    const property = await Property.create({
      name,
      address,
      landlord,
      units: groupedUnits,
      description,
      tenants: [],
      profilePic,
      profilePicThumb,
      gallery,
      galleryThumbs,
    });
    res.status(201).json(property);
  } catch (err) {
    console.error('createProperty error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Failed to create property.', details: err instanceof Error ? err.message : err });
  }
};

// GET all properties for landlord (with populated tenants)
const getLandlordProperties = async (req, res) => {
  try {
    const landlord = req.user && req.user.id;
    const properties = await Property.find({ landlord, isDeleted: { $ne: true } })
      // .populate({ path: 'caretaker', model: 'Caretaker', select: 'firstName lastName email phone' })
      .lean();
    // Populate tenant info for each unit
    for (const property of properties) {
      if (Array.isArray(property.units) && property.units.length > 0) {
        for (const unit of property.units) {
          if (unit.tenant) {
            try {
              // Only try to find tenant if it's a valid string or ObjectId
              if (typeof unit.tenant === 'string' || (unit.tenant && unit.tenant._id)) {
                const tenant = await require('../models/Tenant').findById(unit.tenant).select('firstName lastName email phone');
                unit.tenant = tenant;
              }
            } catch (err) {
              console.warn('Error populating tenant for unit:', unit, err.message || err);
              unit.tenant = null;
            }
          }
        }
      }
    }
    res.json(properties);
  } catch (err) {
    console.error('getLandlordProperties error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Failed to fetch properties.', details: err && err.message ? err.message : err });
  }
};

// GET property by ID (with populated tenants)
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id)
      .populate({ path: 'caretaker', model: 'Caretaker', select: 'firstName lastName email phone' })
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

// Assign caretaker to property
const assignCaretakerToProperty = async (req, res) => {
  console.log('assignCaretakerToProperty called', req.params, req.body);
  try {
    const { id } = req.params; // propertyId
    const { caretakerId } = req.body;
    const caretaker = await Caretaker.findOne({ _id: caretakerId, isActive: true });
    if (!caretaker && caretakerId) return res.status(404).json({ error: 'Caretaker not found or inactive.' });
    // If caretakerId is null, unassign
    const update = caretakerId ? { caretaker: caretakerId } : { $unset: { caretaker: 1 } };
    const property = await Property.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).populate({ path: 'caretaker', model: 'Caretaker', select: 'firstName lastName email phone' });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json({ property });
  } catch (err) {
    console.error('assignCaretakerToProperty error:', err);
    res.status(500).json({ error: 'Failed to assign caretaker.' });
  }
};


// Assign a tenant to a specific unit in a property (supports grouped-by-floor structure)
const assignTenantToUnit = async (req, res) => {
  try {
    const { propertyId, unitLabel } = req.params;
    const { tenantId } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    let found = false;
    // First, vacate any unit in this property currently assigned to this tenant
    for (const floorObj of property.units) {
      for (const u of floorObj.units) {
        if (u.tenant && u.tenant.toString() === tenantId) {
          u.tenant = null;
          u.status = 'vacant';
        }
      }
    }
    // Now, assign the tenant to the new unit
    for (const floorObj of property.units) {
      const unit = floorObj.units.find(u => u.label === unitLabel);
      if (unit) {
        if (unit.status === 'occupied' && unit.tenant && unit.tenant.toString() !== tenantId) {
          return res.status(400).json({ error: 'Unit is already occupied.' });
        }
        unit.tenant = tenantId;
        unit.status = 'occupied';
        // Also update the tenant's property, unitType, floor, unitLabel, and status
        const Tenant = require('../models/Tenant');
        await Tenant.findByIdAndUpdate(tenantId, {
          property: property._id,
          unitType: unit.type,
          floor: floorObj.floor,
          unitLabel: unit.label,
          status: 'Active',
        });
        found = true;
        break;
      }
    }
    if (!found) return res.status(404).json({ error: 'Unit not found.' });
    await property.save();
    res.json({ property });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign tenant to unit.' });
  }
};

// Remove a tenant from a unit (supports grouped-by-floor structure)
const removeTenantFromUnit = async (req, res) => {
  try {
    const { propertyId, unitLabel } = req.params;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    let found = false;
    for (const floorObj of property.units) {
      const unit = floorObj.units.find(u => u.label === unitLabel);
      if (unit) {
        unit.tenant = null;
        unit.status = 'vacant';
        found = true;
        break;
      }
    }
    if (!found) return res.status(404).json({ error: 'Unit not found.' });
    await property.save();
    res.json({ property });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove tenant from unit.' });
  }
};

module.exports = {
  createProperty,
  getLandlordProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  removeTenantFromProperty,
  assignCaretakerToProperty,
  assignTenantToUnit,
  removeTenantFromUnit
};

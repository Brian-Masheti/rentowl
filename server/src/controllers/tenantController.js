const { getLandlordTenants } = require('../utils/getLandlordTenants');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');

const getAllLandlordTenants = async (req, res) => {
  try {
    const landlordId = req.user && req.user.id;
    const tenants = await Tenant.find({ landlord: landlordId })
      .populate({ path: 'property', select: 'name' });
    res.json({ tenants });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants.' });
  }
};

const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, deleted, property: propertyId, unitLabel, floor } = req.body;
    const tenant = await Tenant.findById(id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });
    // If moving to a new room/unit, update property units
    let oldPropertyId = tenant.property;
    let oldUnitLabel = tenant.unitLabel;
    let oldFloor = tenant.floor;
    let newPropertyId = propertyId || tenant.property;
    let newUnitLabel = unitLabel || tenant.unitLabel;
    let newFloor = floor || tenant.floor;
    // If property/unitLabel changed, update old and new rooms
    if ((oldPropertyId && oldUnitLabel) && (oldPropertyId.toString() !== newPropertyId.toString() || oldUnitLabel !== newUnitLabel)) {
      // Set old room vacant
      const oldProperty = await Property.findById(oldPropertyId);
      if (oldProperty) {
        for (const floorObj of oldProperty.units) {
          const unit = floorObj.units.find(u => u.label === oldUnitLabel);
          if (unit && unit.tenant && unit.tenant.toString() === tenant._id.toString()) {
            unit.tenant = null;
            unit.status = 'vacant';
            break;
          }
        }
        await oldProperty.save();
      }
    }
    if (newPropertyId && newUnitLabel) {
      // Set new room occupied
      const newProperty = await Property.findById(newPropertyId);
      if (newProperty) {
        for (const floorObj of newProperty.units) {
          const unit = floorObj.units.find(u => u.label === newUnitLabel);
          if (unit) {
            unit.tenant = tenant._id;
            unit.status = 'occupied';
            newFloor = floorObj.floor;
            break;
          }
        }
        await newProperty.save();
      }
    }
    // Update tenant fields
    tenant.firstName = firstName !== undefined ? firstName : tenant.firstName;
    tenant.lastName = lastName !== undefined ? lastName : tenant.lastName;
    tenant.email = email !== undefined ? email : tenant.email;
    tenant.phone = phone !== undefined ? phone : tenant.phone;
    tenant.deleted = deleted !== undefined ? deleted : tenant.deleted;
    tenant.property = newPropertyId;
    tenant.unitLabel = newUnitLabel;
    tenant.floor = newFloor;
    await tenant.save();
    // Log activity: tenant assigned or moved
    try {
      if (newPropertyId && newUnitLabel) {
        const Activity = require('../models/Activity');
        const property = await Property.findById(newPropertyId);
        await Activity.create({
          landlord: property.landlord,
          type: 'tenant_assigned',
          message: `Tenant ${tenant.firstName} ${tenant.lastName} assigned to ${property.name} (${newUnitLabel})`,
          data: { tenantId: tenant._id, propertyId: property._id, unitLabel: newUnitLabel }
        });
      }
    } catch (err) { /* ignore activity log errors */ }
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tenant.' });
  }
};

const createTenant = async (req, res) => {
  try {
    // console.log('CREATE TENANT BODY:', req.body); // Removed debug log
    const { firstName, lastName, username, email, phone, password, propertyId, unitType, unitLabel, floor } = req.body;
    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields required.' });
    }
    const existing = await Tenant.findOne({ $or: [ { username }, { email }, { phone } ] });
    if (existing) {
      return res.status(409).json({ error: 'Username, email, or phone already taken.' });
    }
    const passwordHash = await require('bcrypt').hash(password, 10);
    const landlord = req.user && req.user.id;
    if (propertyId && !unitType) {
      return res.status(400).json({ error: 'unitType is required when assigning a property.' });
    }
    // Determine floor if not provided but unitLabel is
    let finalFloor = floor;
    if (!finalFloor && propertyId && unitLabel) {
      const property = await Property.findById(propertyId);
      if (property) {
        for (const floorObj of property.units) {
          const unit = floorObj.units.find(u => u.label === unitLabel);
          if (unit) {
            finalFloor = floorObj.floor;
            break;
          }
        }
      }
    }
    const tenant = await Tenant.create({
      firstName, lastName, username, email, phone, passwordHash, isActive: true, landlord,
      property: propertyId || undefined,
      unitType: unitType || undefined,
      unitLabel: unitLabel || undefined,
      floor: finalFloor || undefined,
    });
    // console.log('CREATED TENANT:', tenant); // Removed debug log
    // If propertyId and unitLabel are provided, assign the tenant to the unit
    if (propertyId && unitLabel) {
      const Property = require('../models/Property');
      const property = await Property.findById(propertyId);
      let found = false;
      if (property) {
        for (const floorObj of property.units) {
          const unit = floorObj.units.find(u => u.label === unitLabel);
          if (unit && unit.status === 'vacant') {
            unit.tenant = tenant._id;
            unit.status = 'occupied';
            found = true;
            break;
          }
        }
        if (found) await property.save();
      }
    }
    // Log activity: tenant created and assigned
    try {
      if (propertyId && unitLabel) {
        const Activity = require('../models/Activity');
        const property = await Property.findById(propertyId);
        await Activity.create({
          landlord: property.landlord,
          type: 'tenant_assigned',
          message: `Tenant ${tenant.firstName} ${tenant.lastName} assigned to ${property.name} (${unitLabel})`,
          data: { tenantId: tenant._id, propertyId: property._id, unitLabel }
        });
      }
    } catch (err) { /* ignore activity log errors */ }
    res.status(201).json(tenant);
  } catch (err) {
    console.error('CREATE TENANT ERROR:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Failed to create tenant.', details: err && err.message ? err.message : err });
  }
};

const assignTenantsBulk = async (req, res) => {
  try {
    const { userIds, propertyId, unitType } = req.body;
    if (!userIds || !propertyId) {
      return res.status(400).json({ error: 'userIds and propertyId are required.' });
    }
    await Tenant.updateMany(
      { _id: { $in: userIds } },
      { property: propertyId, ...(unitType ? { unitType } : {}) }
    );
    const property = await Property.findById(propertyId);
    if (property) {
      userIds.forEach((tenantId) => {
        if (!property.tenants.some((t) => t.tenant.toString() === tenantId)) {
          property.tenants.push({ tenant: tenantId, unitType: unitType || '' });
        }
      });
      await property.save();
    }
    res.json({ message: 'Tenants assigned successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign tenants.' });
  }
};

module.exports = {
  getAllLandlordTenants,
  updateTenant,
  createTenant,
  assignTenantsBulk
};

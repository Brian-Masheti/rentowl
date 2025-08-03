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
    const { firstName, lastName, email, phone, deleted } = req.body;
    const updated = await Tenant.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone, deleted },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Tenant not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tenant.' });
  }
};

const createTenant = async (req, res) => {
  try {
    console.log('CREATE TENANT PAYLOAD:', req.body);
    const { firstName, lastName, username, email, phone, password, propertyId, unitType } = req.body;
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
    const tenant = await Tenant.create({
      firstName, lastName, username, email, phone, passwordHash, isActive: true, landlord,
      property: propertyId || undefined,
      unitType: unitType || undefined,
    });
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

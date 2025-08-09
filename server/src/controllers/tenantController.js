const { getLandlordTenants } = require('../utils/getLandlordTenants');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');

const getAllLandlordTenants = async (req, res) => {
  try {
    const landlordId = req.user && req.user.id;
    const tenants = await Tenant.find({ landlord: landlordId })
      .select('+rent')
      .populate({ path: 'property', select: 'name' });
    res.json({ tenants });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants.' });
  }
};

const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updatedTenant = await Tenant.findByIdAndUpdate(id, update, { new: true });
    res.json(updatedTenant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tenant.', details: err.message });
  }
};

const bcrypt = require('bcrypt');

const createTenant = async (req, res) => {
  try {
    console.log('DEBUG createTenant: request body:', req.body);
    if (req.file) {
      console.log('DEBUG createTenant: file uploaded:', req.file);
    }
    const leaseDocument = req.file ? req.file.path : undefined;
    // Hash the password
    const passwordHash = req.body.password ? await bcrypt.hash(req.body.password, 10) : undefined;
    // Set landlord from the logged-in user
    const landlord = req.user && req.user.id;
    // Set rent if property/unit is provided (accept propertyId or property)
    const propertyId = req.body.propertyId || req.body.property;
    let rent = undefined;
    let deposit = undefined;
    if (propertyId && req.body.unitLabel) {
      const property = await Property.findById(propertyId);
      if (property && property.units) {
        for (const floorObj of property.units) {
          const unit = floorObj.units.find(u => u.label === req.body.unitLabel);
          if (unit && unit.rent) {
            rent = unit.rent;
            deposit = unit.rent; // Deposit = rent by default for new tenants
            break;
          }
        }
      }
    }
    const tenantData = {
      ...req.body,
      property: propertyId,
      landlord,
      passwordHash,
      leaseDocument: leaseDocument || undefined,
      rent: rent !== undefined ? rent : undefined,
      deposit: deposit !== undefined ? deposit : undefined,
    };
    console.log('DEBUG createTenant: tenantData to save:', tenantData);
    const tenant = await Tenant.create(tenantData);
    console.log('DEBUG createTenant: tenant saved:', tenant);

    // --- Create initial Payment records for deposit and rent if not present ---
    const Payment = require('../models/Payment');
    const now = new Date();
    if (tenant.deposit && tenant.deposit > 0) {
      const existingDeposit = await Payment.findOne({ tenant: tenant._id, property: tenant.property, type: 'deposit' });
      if (!existingDeposit) {
        await Payment.create({
          tenant: tenant._id,
          property: tenant.property,
          amount: tenant.deposit,
          amountPaid: 0,
          dueDate: tenant.leaseStart || now,
          status: 'unpaid',
          type: 'deposit',
        });
      }
    }
    if (tenant.rent && tenant.rent > 0) {
      const existingRent = await Payment.findOne({ tenant: tenant._id, property: tenant.property, type: 'rent' });
      if (!existingRent) {
        await Payment.create({
          tenant: tenant._id,
          property: tenant.property,
          amount: tenant.rent,
          amountPaid: 0,
          dueDate: tenant.leaseStart || now,
          status: 'unpaid',
          type: 'rent',
        });
      }
    }
    // --- End Payment record creation ---

    res.status(201).json(tenant);
  } catch (err) {
    console.error('DEBUG createTenant error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Failed to create tenant.', details: err && err.message ? err.message : err });
  }
};

const assignTenantsBulk = async (req, res) => {
  // ... (unchanged)
};

// GET /api/tenants/me/property - get the property and unit for the logged-in tenant
const getMyPropertyAndUnit = async (req, res) => {
  try {
    console.log('DEBUG getMyPropertyAndUnit req.user:', req.user);
    const tenantId = req.user && req.user.id;
    const tenant = await Tenant.findById(tenantId).populate('property');
    console.log('DEBUG getMyPropertyAndUnit tenant:', tenant);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }
    if (!tenant.property) {
      return res.status(404).json({ error: 'No property assigned to this tenant.' });
    }
    // Find the specific unit for this tenant
    let assignedUnit = null;
    if (tenant.property.units && tenant.unitLabel) {
      for (const floorObj of tenant.property.units) {
        const unit = floorObj.units.find(u => u.label === tenant.unitLabel);
        if (unit) {
          assignedUnit = { ...unit.toObject(), floor: floorObj.floor };
          break;
        }
      }
    }
    res.json({
      property: {
        _id: tenant.property._id,
        name: tenant.property.name,
        address: tenant.property.address,
        paymentOptions: tenant.property.paymentOptions,
        description: tenant.property.description,
        profilePic: tenant.property.profilePic,
        gallery: tenant.property.gallery,
      },
      unit: assignedUnit,
      tenant: {
        _id: tenant._id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone,
        unitLabel: tenant.unitLabel,
        unitType: tenant.unitType,
        floor: tenant.floor,
        rent: tenant.rent,
        leaseType: tenant.leaseType,
        leaseStart: tenant.leaseStart,
        leaseEnd: tenant.leaseEnd,
      }
    });
  } catch (err) {
    console.error('DEBUG getMyPropertyAndUnit error:', err);
    res.status(500).json({ error: 'Failed to fetch property/unit for tenant.' });
  }
};

module.exports = {
  getAllLandlordTenants,
  updateTenant,
  createTenant,
  assignTenantsBulk,
  getMyPropertyAndUnit,
};

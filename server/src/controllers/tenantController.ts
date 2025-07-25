import { Request, Response } from 'express';
import { getLandlordTenants } from '../utils/getLandlordTenants';
import Tenant from '../models/Tenant';
import Property from '../models/Property';

export const getAllLandlordTenants = async (req: Request, res: Response) => {
  try {
    const landlordId = req.user?.id;
    // Populate property field for each tenant
    const tenants = await Tenant.find({ landlord: landlordId })
      .populate({ path: 'property', select: 'name' });
    res.json({ tenants });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants.' });
  }
};

export const updateTenant = async (req: Request, res: Response) => {
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

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email, phone, password, propertyId, unitType } = req.body;
    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields required.' });
    }
    // Check for existing tenant
    const existing = await Tenant.findOne({ $or: [ { username }, { email }, { phone } ] });
    if (existing) {
      return res.status(409).json({ error: 'Username, email, or phone already taken.' });
    }
    const passwordHash = await require('bcrypt').hash(password, 10);
    const landlord = req.user?.id;
    // If propertyId is provided, unitType must also be provided
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
    res.status(500).json({ error: 'Failed to create tenant.' });
  }
};

// Bulk assign tenants to property/unit
export const assignTenantsBulk = async (req: Request, res: Response) => {
  try {
    const { userIds, propertyId, unitType } = req.body;
    if (!userIds || !propertyId) {
      return res.status(400).json({ error: 'userIds and propertyId are required.' });
    }
    // Update tenants
    await Tenant.updateMany(
      { _id: { $in: userIds } },
      { property: propertyId, ...(unitType ? { unitType } : {}) }
    );
    // Update property tenants array
    const property = await Property.findById(propertyId);
    if (property) {
      userIds.forEach((tenantId: string) => {
        if (!property.tenants.some((t: any) => t.tenant.toString() === tenantId)) {
          property.tenants.push({ tenant: tenantId, unitType: unitType || '' });
        }
      });
      await property.save();
    }
    res.json({ message: 'Tenants assigned successfully.' });
  } catch (err) {
    console.error('assignTenantsBulk error:', err);
    res.status(500).json({ error: 'Failed to assign tenants.' });
  }
};

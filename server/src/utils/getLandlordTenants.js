const Tenant = require('../models/Tenant');

/**
 * Fetch all tenants for a given landlord (optionally filter by deleted=false)
 * @param landlordId - The ObjectId of the landlord
 * @param includeDeleted - If true, include deleted tenants (default: false)
 */
async function getLandlordTenants(landlordId, includeDeleted = false) {
  const query = { landlord: landlordId };
  if (!includeDeleted) query.deleted = { $ne: true };
  return Tenant.find(query);
}

module.exports = { getLandlordTenants };

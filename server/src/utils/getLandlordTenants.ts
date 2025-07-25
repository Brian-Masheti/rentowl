import Tenant from '../models/Tenant';
import { Types } from 'mongoose';

/**
 * Fetch all tenants for a given landlord (optionally filter by deleted=false)
 * @param landlordId - The ObjectId of the landlord
 * @param includeDeleted - If true, include deleted tenants (default: false)
 */
export async function getLandlordTenants(landlordId: Types.ObjectId | string, includeDeleted = false) {
  const query: any = { landlord: landlordId };
  if (!includeDeleted) query.deleted = { $ne: true };
  return Tenant.find(query);
}

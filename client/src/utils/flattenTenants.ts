// Utility to flatten tenants from property API response for display in TenantTable
export interface TenantTableRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyName: string;
  unitType?: string;
}

export function flattenTenants(properties: any[]): TenantTableRow[] {
  const allTenants: TenantTableRow[] = [];
  for (const property of properties) {
    const defaultUnitType = property.units && property.units.length === 1 ? property.units[0].type : 'N/A';
    if (property.tenants && Array.isArray(property.tenants)) {
      for (const t of property.tenants) {
        // t should be { tenant: { ...user fields... }, unitType }
        const user = t && t.tenant && typeof t.tenant === 'object' ? t.tenant : null;
        if (user && (user._id || user.id)) {
          allTenants.push({
            id: user._id || user.id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            propertyName: property.name,
            unitType: t.unitType || defaultUnitType || 'N/A',
          });
        }
      }
    }
  }
  return allTenants;
}

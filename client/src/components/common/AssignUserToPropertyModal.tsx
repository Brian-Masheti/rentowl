import React, { useState, useEffect } from 'react';

interface PropertyWithUnits {
  id: string;
  name: string;
  units?: any[];
  tenants?: any[];
}

interface AssignUserToPropertyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  mode: 'add' | 'edit';
  // userType: 'tenant' | 'caretaker';
  properties: PropertyWithUnits[];
  initialPropertyId?: string;
  initialTenantData?: TenantFormData;
  themeColor?: string;
}

export interface TenantFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
}

const initialTenantState: TenantFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  password: '',
};

const AssignUserToPropertyModal: React.FC<AssignUserToPropertyModalProps> = ({
  open,
  onClose,
  onSubmit,
  mode,
  // userType,
  properties,
  initialPropertyId = '',
  initialTenantData = initialTenantState,
  themeColor = '#03A6A1',
}) => {
  const [propertyId, setPropertyId] = useState(initialPropertyId);
  const [tenant, setTenant] = useState<TenantFormData>(initialTenantData);
  const [unitType, setUnitType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Debug: log properties array
  useEffect(() => {
    if (open) {
      setPropertyId(initialPropertyId);
      setTenant(initialTenantData);
      setError('');
      setSuccess('');
      // Debug log
      console.log('AssignUserToPropertyModal properties:', properties);
    }
  }, [open, initialPropertyId, initialTenantData, properties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTenant({ ...tenant, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProperty = properties.find(p => p.id === propertyId);
    const needsUnitType = selectedProperty && selectedProperty.units && selectedProperty.units.length > 1;
    if (!propertyId || !tenant.firstName || !tenant.lastName || !tenant.email || !tenant.phone || !tenant.username || !tenant.password || (needsUnitType && !unitType)) {
      setError('Please fill all fields and select a property.' + (needsUnitType ? ' Select a unit type.' : ''));
      return;
    }
    // Check if the selected unit type is full
    if (selectedProperty && selectedProperty.units) {
      let available = 0;
      if (needsUnitType) {
        // Mixed units: check selected unit type
        const unit = selectedProperty.units.find(u => u.type === unitType);
        if (unit) {
          // Count tenants of this unit type
          const tenantsOfType = Array.isArray(selectedProperty.tenants)
            ? selectedProperty.tenants.filter((t: any) => t.unitType && t.unitType.toLowerCase() === unitType.toLowerCase())
            : [];
          available = (unit.count || 0) - tenantsOfType.length;
        }
      } else {
        // Uniform units: only one type
        const unit = selectedProperty.units[0];
        if (unit) {
          // If tenants are objects with unitType, only count those with matching unitType or no unitType
          let tenantsCount = 0;
          if (Array.isArray(selectedProperty.tenants) && selectedProperty.tenants.length > 0 && typeof selectedProperty.tenants[0] === 'object' && selectedProperty.tenants[0].unitType) {
            tenantsCount = selectedProperty.tenants.filter((t: any) => !t.unitType || t.unitType === unit.type).length;
          } else {
            tenantsCount = Array.isArray(selectedProperty.tenants) ? selectedProperty.tenants.length : 0;
          }
          available = (unit.count || 0) - tenantsCount;
        }
      }
      if (available <= 0) {
        setError('This unit is fully occupied. Please select another property or increase unit count.');
        return;
      }
    }
    setError('');
    setLoading(true);
    try {
      // Always send unitType for uniform units as well
      await onSubmit({
        ...tenant,
        propertyId,
        unitType: (needsUnitType ? unitType : (selectedProperty?.units?.[0]?.type || ''))
      });
      setSuccess('Tenant added and assigned successfully!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to add tenant.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] relative"
        style={{ border: `2px solid ${themeColor}` }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
          {mode === 'add' ? `Add Tenant to Property` : `Edit Tenant Assignment`}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1">Property</label>
            {properties.length === 0 && (
              <div className="text-red-500 mb-2">No properties available. Please add a property first.</div>
            )}
            <select
              className="border rounded px-4 py-2 w-full"
              value={propertyId}
              onChange={e => setPropertyId(e.target.value)}
              required
            >
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {/* Unit Type Dropdown: only show if property has more than one unit type */}
          {propertyId && (properties.find(p => p.id === propertyId)?.units?.length || 0) > 1 && (
            <div>
              <label className="block font-semibold mb-1">Unit Type</label>
              <select
                className="border rounded px-4 py-2 w-full"
                value={unitType}
                onChange={e => setUnitType(e.target.value)}
                required
              >
                <option value="">Select Unit Type</option>
                {properties.find(p => p.id === propertyId)?.units?.map(u => (
                  <option key={u.type} value={u.type}>{u.type}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                className="border rounded px-4 py-2 w-full"
                value={tenant.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="border rounded px-4 py-2 w-full"
                value={tenant.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="border rounded px-4 py-2 w-full"
                value={tenant.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                className="border rounded px-4 py-2 w-full"
                value={tenant.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">Username</label>
              <input
                type="text"
                name="username"
                className="border rounded px-4 py-2 w-full"
                value={tenant.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Password</label>
              <input
                type="password"
                name="password"
                className="border rounded px-4 py-2 w-full"
                value={tenant.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded font-bold text-white"
              style={{ background: themeColor }}
              disabled={loading}
            >
              {loading ? 'Adding...' : mode === 'add' ? 'Add Tenant' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignUserToPropertyModal;

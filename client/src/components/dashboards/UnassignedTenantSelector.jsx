import React, { useEffect, useState } from 'react';

const UnassignedTenantSelector = ({ onAssign, properties }) => {
  const [unassignedTenants, setUnassignedTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState('');
  const [unitTypes, setUnitTypes] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [unitOptions, setUnitOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnassigned = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/tenants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const all = await res.json();
        // Support both { tenants: [...] } and [...] response
        const tenantsArray = Array.isArray(all) ? all : all.tenants || [];
        // Filter out tenants already assigned to any property
        const assignedIds = properties.flatMap((p) => (p.tenants || []).map((t) => t.tenant?._id || t.tenant));
        // Only show tenants who self-registered with this landlord's code and are not assigned to a property/unit
        const landlordId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;
        setUnassignedTenants(
          tenantsArray.filter((t) =>
            t.landlord === landlordId && (!t.property || t.property === null) && !assignedIds.includes(t._id)
          )
        );
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    };
    fetchUnassigned();
  }, [properties]);

  useEffect(() => {
    if (selectedProperty) {
      setSelectedFloor('');
      setSelectedUnitType('');
      setUnitOptions([]);
    } else {
      setUnitTypes([]);
      setSelectedUnitType('');
      setSelectedFloor('');
      setUnitOptions([]);
    }
  }, [selectedProperty, properties]);

  useEffect(() => {
    if (selectedProperty && selectedFloor) {
      const prop = properties.find((p) => p.id === selectedProperty);
      const floorObj = prop?.units?.find(f => f.floor === selectedFloor);
      if (floorObj && Array.isArray(floorObj.units)) {
        // Get all unique unit types with at least one vacant unit on this floor
        const vacantUnits = floorObj.units.filter(u => u.status === 'vacant');
        const uniqueTypes = [...new Set(vacantUnits.map(u => u.type))];
        setUnitTypes(uniqueTypes);
        setSelectedUnitType('');
        setUnitOptions([]);
      } else {
        setUnitTypes([]);
        setSelectedUnitType('');
        setUnitOptions([]);
      }
    } else {
      setUnitTypes([]);
      setSelectedUnitType('');
      setUnitOptions([]);
    }
  }, [selectedProperty, selectedFloor, properties]);

  useEffect(() => {
    if (selectedProperty && selectedFloor && selectedUnitType) {
      const prop = properties.find((p) => p.id === selectedProperty);
      const floorObj = prop?.units?.find(f => f.floor === selectedFloor);
      if (floorObj && Array.isArray(floorObj.units)) {
        setUnitOptions(floorObj.units.filter(u => u.status === 'vacant' && u.type === selectedUnitType));
      } else {
        setUnitOptions([]);
      }
    } else {
      setUnitOptions([]);
    }
  }, [selectedProperty, selectedFloor, selectedUnitType, properties]);

  try {
    return (
      <div className="mb-6 p-4 bg-[#FFF8F0] rounded-xl border border-[#FFA673]/40">
        <h3 className="font-bold text-[#03A6A1] mb-2">Assign Existing Tenant to Property</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg">
            <thead>
              <tr className="bg-[#FFF8F0] text-[#03A6A1]">
                <th className="px-4 py-2 text-left">First Name</th>
                <th className="px-4 py-2 text-left">Last Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {unassignedTenants.map(t => (
                <tr key={t._id} className="hover:bg-[#FFE3BB]/60">
                  <td className="px-4 py-2">{t.firstName}</td>
                  <td className="px-4 py-2">{t.lastName}</td>
                  <td className="px-4 py-2">{t.email}</td>
                  <td className="px-4 py-2">{t.phone}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-[#03A6A1] text-white font-bold px-4 py-2 rounded hover:bg-[#FFA673] transition"
                      onClick={() => setSelectedTenant(t._id)}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedTenant && (
          <div className="flex flex-wrap gap-2 items-center mt-4">
            <select
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
            >
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selectedProperty && (
              <select
                value={selectedFloor}
                onChange={e => setSelectedFloor(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
              >
                <option value="">Select Floor</option>
                {properties.find(p => p.id === selectedProperty)?.units?.map(floorObj => (
                  <option key={floorObj.floor} value={floorObj.floor}>{floorObj.floor}</option>
                ))}
              </select>
            )}
            {selectedFloor && unitTypes.length > 0 && (
              <select
                value={selectedUnitType}
                onChange={e => setSelectedUnitType(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1] text-black bg-white"
                style={{ color: '#23272F', background: '#FFF' }}
              >
                <option value="">Select Unit Type</option>
                {unitTypes.map(u => (
                  <option key={u} value={u} style={{ color: '#23272F', background: '#FFF' }}>{u}</option>
                ))}
              </select>
            )}
            {selectedFloor && selectedUnitType && (
              <select
                value={unitOptions.length > 0 ? unitOptions[0].label : ''}
                onChange={e => setUnitOptions(unitOptions.map(u => u.label === e.target.value ? { ...u, selected: true } : { ...u, selected: false }))}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1] text-black bg-white"
                style={{ color: '#23272F', background: '#FFF' }}
              >
                <option value="">Select Room/Unit</option>
                {unitOptions.map(u => (
                  <option key={u.label} value={u.label} style={{ color: '#23272F', background: '#FFF' }}>{u.label}</option>
                ))}
              </select>
            )}
            <button
              className="bg-[#03A6A1] text-white font-bold px-4 py-2 rounded hover:bg-[#FFA673] transition"
              disabled={!selectedProperty || !selectedFloor || !selectedUnitType || unitOptions.length === 0}
              onClick={() => {
                // Assign the selected unit of the selected type on the selected floor
                const selectedUnit = unitOptions.find(u => u.selected) || unitOptions[0];
                if (selectedUnit) {
                  onAssign(selectedTenant, selectedProperty, selectedUnitType, selectedFloor, selectedUnit.label);
                }
                setSelectedTenant('');
                setSelectedProperty('');
                setSelectedUnitType('');
                setSelectedFloor('');
                setUnitOptions([]);
              }}
            >
              Assign
            </button>
            <button
              className="ml-2 px-3 py-2 rounded bg-[#FFA673] text-white font-bold hover:bg-[#03A6A1] transition"
              onClick={() => {
                setSelectedTenant('');
                setSelectedProperty('');
                setSelectedUnitType('');
                setSelectedFloor('');
                setUnitOptions([]);
              }}
            >
              Cancel
            </button>
          </div>
        )}
        {loading && <div className="text-gray-500 text-sm mt-2">Loading unassigned tenants...</div>}
      </div>
    );
  } catch (error) {
    return <div style={{ color: 'red', padding: 20 }}>An error occurred: {error.message}</div>;
  }
};

export default UnassignedTenantSelector;

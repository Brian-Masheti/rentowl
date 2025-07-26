import React, { useEffect, useState } from 'react';

const UnassignedTenantSelector = ({ onAssign, properties }) => {
  const [unassignedTenants, setUnassignedTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState('');
  const [unitTypes, setUnitTypes] = useState([]);
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
        // Filter out tenants already assigned to any property
        const assignedIds = properties.flatMap((p) => (p.tenants || []).map((t) => t.tenant?._id || t.tenant));
        setUnassignedTenants(all.filter((t) => !assignedIds.includes(t._id)));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchUnassigned();
  }, [properties]);

  useEffect(() => {
    if (selectedProperty) {
      const prop = properties.find((p) => p.id === selectedProperty);
      setUnitTypes(prop?.units?.map((u) => u.type) || []);
      setSelectedUnitType('');
    } else {
      setUnitTypes([]);
      setSelectedUnitType('');
    }
  }, [selectedProperty, properties]);

  try {
    return (
      <div className="mb-6 p-4 bg-[#FFF8F0] rounded-xl border border-[#FFA673]/40">
        <h3 className="font-bold text-[#03A6A1] mb-2">Assign Existing Tenant to Property</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedTenant}
            onChange={e => setSelectedTenant(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
          >
            <option value="">Select Tenant</option>
            {unassignedTenants.map(t => (
              <option key={t._id} value={t._id}>{t.firstName} {t.lastName} ({t.email})</option>
            ))}
          </select>
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
          {unitTypes.length > 0 && (
            <select
              value={selectedUnitType}
              onChange={e => setSelectedUnitType(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
            >
              <option value="">Select Unit Type</option>
              {unitTypes.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          )}
          <button
            className="bg-[#03A6A1] text-white font-bold px-4 py-2 rounded hover:bg-[#FFA673] transition"
            disabled={!selectedTenant || !selectedProperty || (unitTypes.length > 0 && !selectedUnitType)}
            onClick={() => {
              onAssign(selectedTenant, selectedProperty, selectedUnitType);
              setSelectedTenant('');
              setSelectedProperty('');
              setSelectedUnitType('');
            }}
          >
            Assign
          </button>
        </div>
        {loading && <div className="text-gray-500 text-sm mt-2">Loading unassigned tenants...</div>}
      </div>
    );
  } catch (error) {
    return <div style={{ color: 'red', padding: 20 }}>An error occurred: {error.message}</div>;
  }
};

export default UnassignedTenantSelector;

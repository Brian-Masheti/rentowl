import React from 'react';

const PropertySummary = ({ name, address, status, units, tenants, profilePic, gallery }) => {
  // Group units by type and rent
  const grouped = {};
  (units || []).forEach((unit) => {
    const key = `${unit.type}-${unit.rent}`;
    if (!grouped[key]) {
      grouped[key] = { ...unit, total: 0, occupied: 0 };
    }
    grouped[key].total += unit.count || 0;
    // Count occupied for this type/rent
    if (Array.isArray(tenants) && tenants.length > 0) {
      if (typeof tenants[0] === 'object' && tenants[0].unitType) {
        grouped[key].occupied += tenants.filter((t) => t.unitType && t.unitType.toLowerCase() === unit.type.toLowerCase()).length;
      } else {
        grouped[key].occupied += tenants.length;
      }
    }
  });
  const unitSummaries = Object.entries(grouped).map(([key, unit], idx) => (
    <div key={key + '-' + idx} className="flex flex-wrap items-center gap-2 mt-1 mb-2">
      <span className="text-base font-semibold text-[#03A6A1]">
        {unit.type}: <span className="text-[#FFA673]">Kshs {unit.rent !== undefined && unit.rent !== null ? unit.rent.toLocaleString() : ''}</span>
      </span>
    </div>
  ));

  return (
    <div className="bg-white border border-[#FFA673]/40 rounded-xl shadow p-6 mb-4">
      <h2 className="text-xl font-bold mb-2 text-[#03A6A1]">{name}</h2>
      {profilePic && (
        <img src={profilePic} alt="Profile" className="h-24 w-24 object-cover rounded mb-2 border border-[#FFA673]/40" />
      )}
      <div className="text-sm text-gray-700 mb-2 font-medium flex items-center gap-2">
        {status && <span className="inline-block w-2 h-2 rounded-full bg-[#03A6A1] mr-1" />}
        {status && <span>{status}</span>}
        <span>{/* separator */}</span>
        <span>{/* address */}{gallery && gallery.length > 0 && (
          <span className="ml-2">|</span>
        )} {name && <span className="ml-2">|</span>} {name && <span className="ml-2">{name}</span>} </span>
      </div>
      <div className="text-base text-[#FFA673] font-bold mb-1">
        {address && <span>{address}</span>}
      </div>
      {gallery && gallery.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {gallery.map((img, idx) => (
            <img key={img + '-' + idx} src={img} alt={`Gallery ${idx + 1}`} className="h-12 w-12 object-cover rounded shadow" />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 120, minHeight: 48 }}>
        {unitSummaries}
      </div>
    </div>
  );
};

export default PropertySummary;

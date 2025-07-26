import React from 'react';

const PropertySummary = ({ name, status, units, tenants }) => {
  const unitSummaries = (units || []).map((unit) => {
    let occupied = 0;
    if (Array.isArray(tenants) && tenants.length > 0) {
      if (typeof tenants[0] === 'object' && tenants[0].unitType) {
        occupied = tenants.filter((t) => t.unitType && t.unitType.toLowerCase() === unit.type.toLowerCase()).length;
      } else {
        occupied = tenants.length;
      }
    }
    const available = (unit.count || 0) - occupied;
    let status = '';
    let badgeColor = '';
    if (occupied === 0) {
      status = 'Vacant';
      badgeColor = 'bg-[#FF4F0F] text-white';
    } else if (available === 0) {
      status = 'Fully Occupied';
      badgeColor = 'bg-[#03A6A1] text-white';
    } else if (available > 0 && occupied > 0) {
      status = 'Partially Occupied';
      badgeColor = 'bg-gray-400 text-white';
    } else {
      status = 'Unknown';
      badgeColor = 'bg-yellow-400 text-black';
    }
    return (
      <div key={unit.type} className="flex flex-wrap items-center gap-2 mt-1 mb-2">
        <span className={`px-2 py-1 rounded text-xs font-bold ${badgeColor}`}>{unit.type}: {status}</span>
        <span className="text-xs text-[#03A6A1] font-semibold">Available: {available} / {unit.count}</span>
        <span className="text-xs text-[#FFA673] font-semibold">Occupied: {occupied}</span>
        <span className="text-xs text-[#FFA673] font-semibold">Rent: {unit.rent.toLocaleString()}</span>
      </div>
    );
  });

  return (
    <div className="bg-white border border-[#FFA673]/40 rounded-xl shadow p-6 mb-4">
      <h2 className="text-xl font-bold mb-2 text-[#03A6A1]">{name} Summary</h2>
      <div
        className="flex flex-col gap-2 overflow-y-auto"
        style={{ maxHeight: 120, minHeight: 48 }}
      >
        {unitSummaries}
      </div>
    </div>
  );
};

export default PropertySummary;

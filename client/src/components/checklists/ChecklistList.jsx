import React from 'react';

const ChecklistList = ({ checklists, role, onView }) => {
  const isMobile = window.innerWidth < 768;
  return isMobile ? (
    <div className="flex flex-col gap-4">
      {checklists.map(cl => (
        <div key={cl._id} className="rounded-lg border border-[#FFA673]/40 shadow p-4 bg-[#FFF8F0]">
          <div className="font-bold text-[#03A6A1] mb-2">{cl.type === 'move_in' ? 'Check-in' : 'Check-out'} Checklist</div>
          <div className="mb-1 text-sm"><span className="font-semibold">Property:</span> {cl.property?.name || '-'}</div>
          <div className="mb-1 text-sm"><span className="font-semibold">Unit Type:</span> {cl.unitType || '-'}</div>
          {(role === 'landlord' || role === 'tenant') && <div className="mb-1 text-sm"><span className="font-semibold">Caretaker:</span> {cl.caretaker?.firstName || '-'}</div>}
          {(role === 'landlord' || role === 'caretaker') && <div className="mb-1 text-sm"><span className="font-semibold">Tenant:</span> {cl.tenant?.firstName || '-'}</div>}
          <div className="mb-1 text-sm"><span className="font-semibold">Status:</span> {cl.status || '-'}</div>
          <button className="bg-[#03A6A1] text-white px-3 py-1 rounded hover:bg-[#FFA673] text-sm mt-2" onClick={() => onView(cl)}>View</button>
        </div>
      ))}
    </div>
  ) : (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-[#03A6A1]/10">
          <th className="p-2 text-left">Type</th>
          <th className="p-2 text-left">Property</th>
          <th className="p-2 text-left">Unit Type</th>
          {(role === 'landlord' || role === 'tenant') && <th className="p-2 text-left">Caretaker</th>}
          {(role === 'landlord' || role === 'caretaker') && <th className="p-2 text-left">Tenant</th>}
          <th className="p-2 text-left">Status</th>
          <th className="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {checklists.map(cl => (
          <tr key={cl._id} className="hover:bg-[#FFE3BB]/60">
            <td className="p-2">{cl.type === 'move_in' ? 'Check-in' : 'Check-out'}</td>
            <td className="p-2">{cl.property?.name || '-'}</td>
            <td className="p-2">{cl.unitType || '-'}</td>
            {(role === 'landlord' || role === 'tenant') && <td className="p-2">{cl.caretaker?.firstName || '-'}</td>}
            {(role === 'landlord' || role === 'caretaker') && <td className="p-2">{cl.tenant?.firstName || '-'}</td>}
            <td className="p-2">{cl.status || '-'}</td>
            <td className="p-2">
              <button className="bg-[#03A6A1] text-white px-3 py-1 rounded hover:bg-[#FFA673] text-sm" onClick={() => onView(cl)}>View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ChecklistList;

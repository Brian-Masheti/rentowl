import React, { useEffect, useState } from 'react';
import { DEFAULT_CHECKLIST_ITEMS } from './CheckListItems';
import CheckListPhotoInput from './CheckListPhotoInput';

const STATUS_OPTIONS = [
  { value: 'ok', label: 'OK' },
  { value: 'needs_repair', label: 'Needs Repair' },
  { value: 'not_present', label: 'Not Present' },
];

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

/**
 * ChecklistSection is a DRY, role-aware checklist UI for both landlord and caretaker dashboards.
 * @param {string} role - 'landlord', 'caretaker', or 'tenant'
 * @param {object} property - property context (should include caretaker info)
 * @param {boolean} canEdit - whether the current user can edit/submit the checklist
 * @param {object} [initialData] - optional initial checklist data
 */
const ChecklistSection = ({ role, checklist, canEdit }) => {
  const [checkType, setCheckType] = useState(checklist?.type === 'move_out' ? 'check_out' : 'check_in');
  const [items, setItems] = useState(
    (checklist && checklist.items) ||
    DEFAULT_CHECKLIST_ITEMS.map(item => ({ ...item, status: '', comment: '', photo: null }))
  );
  const isMobile = useIsMobile();
  // For columns
  const property = checklist?.property || {};
  const caretaker = checklist?.caretaker;
  const tenant = checklist?.tenant;
  const unitType = checklist?.unitType;

  // DRY column config per role
  const columnsByRole = {
    landlord: [
      { key: 'item', label: 'Item' },
      { key: 'status', label: 'Status' },
      { key: 'comment', label: 'Comment' },
      { key: 'tenant', label: 'Tenant' },
      { key: 'caretaker', label: 'Caretaker' },
      { key: 'property', label: 'Property' },
      { key: 'unitType', label: 'Unit Type' },
      { key: 'photo', label: 'Photo' },
    ],
    caretaker: [
      { key: 'item', label: 'Item' },
      { key: 'status', label: 'Status' },
      { key: 'comment', label: 'Comment' },
      { key: 'property', label: 'Property' },
      { key: 'tenant', label: 'Tenant' },
      { key: 'unitType', label: 'Unit Type' },
      { key: 'photo', label: 'Photo' },
    ],
    tenant: [
      { key: 'item', label: 'Item' },
      { key: 'status', label: 'Status' },
      { key: 'comment', label: 'Comment' },
      { key: 'caretaker', label: 'Caretaker' },
      { key: 'property', label: 'Property' },
      { key: 'unitType', label: 'Unit Type' },
      { key: 'photo', label: 'Photo' },
    ],
    // Add a default/fourth dashboard if needed
  };
  const columns = columnsByRole[role] || columnsByRole.tenant;

  // Handle status, comment, and photo changes
  const handleItemChange = (idx, field, value) => {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // Reset checklist when type changes
  useEffect(() => {
    setItems(
      (checklist && checklist.items) ||
      DEFAULT_CHECKLIST_ITEMS.map(item => ({ ...item, status: '', comment: '', photo: null }))
    );
  }, [checkType, checklist]);

  // TODO: Add save/submit/review logic based on role and canEdit

  try {
    if (role === 'landlord') {
      console.log('DEBUG: Landlord checklist object:', JSON.stringify(checklist, null, 2));
    }
    console.log('ChecklistSection checklist:', checklist);
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
          <h2 className="text-xl font-bold text-[#03A6A1] mb-2 md:mb-0">{checkType === 'check_in' ? 'Check-in' : 'Check-out'} Checklist</h2>
          <select
            className="border rounded px-3 py-2 w-full md:w-auto"
            value={checkType}
            onChange={e => setCheckType(e.target.value)}
            disabled={role !== 'tenant' && !canEdit}
          >
            <option value="check_in">Check-in</option>
            <option value="check_out">Check-out</option>
          </select>
        </div>
        {/* Meta info for the checklist (always visible for landlord, no placeholders) */}
        {role === 'landlord' && (
          (!tenant?.firstName || !caretaker?.firstName || !property?.name || !unitType)
            ? <div className="text-red-500 mb-4">Missing checklist meta info: Tenant, Caretaker, Property, or Unit Type.</div>
            : <div className="mb-4 flex flex-wrap gap-6 text-sm text-gray-700">
                <div><span className="font-semibold">Tenant:</span> {tenant.firstName} {tenant.lastName}</div>
                <div><span className="font-semibold">Caretaker:</span> {caretaker.firstName} {caretaker.lastName}</div>
                <div><span className="font-semibold">Property:</span> {property.name}</div>
                <div><span className="font-semibold">Unit Type:</span> {unitType}</div>
              </div>
        )}
        
        <div className="flex flex-col gap-4">
          {items.map((item, idx) => (
            <div key={item.key} className="rounded-lg border border-[#FFA673]/40 shadow p-4 bg-[#FFF8F0]">
              {columns.map(col => {
                switch (col.key) {
                  case 'item':
                    return <div key={col.key} className="font-bold text-[#03A6A1] mb-2">{item.label}</div>;
                  case 'status':
                    return (
                      <div key={col.key} className="mb-2">
                        <span className="font-semibold">Status: </span>
                        {STATUS_OPTIONS.map(opt => (
                          <label key={opt.value} className={`px-2 py-1 rounded cursor-pointer text-xs font-semibold ${item.status === opt.value ? 'bg-[#03A6A1] text-white' : 'bg-gray-100 text-gray-700'}`}
                            style={{ marginRight: 8 }}>
                            <input
                              type="radio"
                              name={`status-${item.key}`}
                              value={opt.value}
                              checked={item.status === opt.value}
                              onChange={e => handleItemChange(idx, 'status', e.target.value)}
                              className="mr-1"
                              disabled={!canEdit}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    );
                  case 'comment':
                    return (
                      <div key={col.key} className="mb-2">
                        <span className="font-semibold">Comment: </span>
                        <textarea
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Comment (optional)"
                          value={item.comment}
                          onChange={e => handleItemChange(idx, 'comment', e.target.value)}
                          disabled={!canEdit}
                        />
                      </div>
                    );
                  case 'tenant':
                    return <div key={col.key} className="mb-2"><span className="font-semibold">Tenant: </span>{tenant?.firstName || ''} {tenant?.lastName || ''}</div>;
                  case 'caretaker':
                    return <div key={col.key} className="mb-2"><span className="font-semibold">Caretaker: </span>{caretaker?.firstName || ''} {caretaker?.lastName || ''}</div>;
                  case 'property':
                    return <div key={col.key} className="mb-2"><span className="font-semibold">Property: </span>{property?.name || ''}</div>;
                  case 'unitType':
                    return <div key={col.key} className="mb-2"><span className="font-semibold">Unit Type: </span>{unitType || ''}</div>;
                  case 'photo':
                    return (
                      <div key={col.key} className="mb-2">
                        <span className="font-semibold">Photo: </span>
                        <CheckListPhotoInput
                          photo={item.photo}
                          onChange={file => handleItemChange(idx, 'photo', file)}
                          onRemove={() => handleItemChange(idx, 'photo', null)}
                          canEdit={canEdit}
                        />
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          ))}
        </div>
        {/* TODO: Add save/submit and digital signature logic */}
      </div>
    );
  } catch (err) {
    return <div className="text-red-500">Error rendering checklist: {err.message}</div>;
  }
};

export default ChecklistSection;

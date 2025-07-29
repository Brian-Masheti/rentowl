import React, { useEffect, useState } from 'react';
import { DEFAULT_CHECKLIST_ITEMS } from './CheckListItems';
import CheckListPhotoInput from './CheckListPhotoInput';

const API_URL = import.meta.env.VITE_API_URL || '';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

const STATUS_OPTIONS = [
  { value: 'ok', label: 'OK' },
  { value: 'needs_repair', label: 'Needs Repair' },
  { value: 'not_present', label: 'Not Present' },
];

const CheckListManager = () => {
  const [checkType, setCheckType] = useState('check_in');
  const [items, setItems] = useState(
    DEFAULT_CHECKLIST_ITEMS.map(item => ({ ...item, status: '', comment: '', photo: null }))
  );
  const isMobile = useIsMobile();

  // Handle status, comment, and photo changes
  const handleItemChange = (idx, field, value) => {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // Reset checklist when type changes
  useEffect(() => {
    setItems(DEFAULT_CHECKLIST_ITEMS.map(item => ({ ...item, status: '', comment: '', photo: null })));
  }, [checkType]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
        <h2 className="text-xl font-bold text-[#03A6A1] mb-2 md:mb-0">{checkType === 'check_in' ? 'Check-in' : 'Check-out'} Checklist</h2>
        <select
          className="border rounded px-3 py-2 w-full md:w-auto"
          value={checkType}
          onChange={e => setCheckType(e.target.value)}
        >
          <option value="check_in">Check-in</option>
          <option value="check_out">Check-out</option>
        </select>
      </div>
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {items.map((item, idx) => (
            <div key={item.key} className="rounded-lg border border-[#FFA673]/40 shadow p-4 bg-[#FFF8F0]">
              <div className="font-bold text-[#03A6A1] mb-2">{item.label}</div>
              <div className="flex gap-2 mb-2">
                {STATUS_OPTIONS.map(opt => (
                  <label key={opt.value} className={`px-2 py-1 rounded cursor-pointer text-xs font-semibold ${item.status === opt.value ? 'bg-[#03A6A1] text-white' : 'bg-gray-100 text-gray-700'}`}>
                    <input
                      type="radio"
                      name={`status-${item.key}`}
                      value={opt.value}
                      checked={item.status === opt.value}
                      onChange={e => handleItemChange(idx, 'status', e.target.value)}
                      className="mr-1"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <textarea
                className="w-full border rounded px-2 py-1 mb-2 text-sm"
                placeholder="Comment (optional)"
                value={item.comment}
                onChange={e => handleItemChange(idx, 'comment', e.target.value)}
              />
              <CheckListPhotoInput
                photo={item.photo}
                onChange={file => handleItemChange(idx, 'photo', file)}
                onRemove={() => handleItemChange(idx, 'photo', null)}
              />
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-[#03A6A1]/10">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Comment</th>
              <th className="p-2 text-left">Photo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.key} className="hover:bg-[#FFE3BB]/60">
                <td className="p-2 font-semibold text-[#03A6A1]">{item.label}</td>
                <td className="p-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={item.status}
                    onChange={e => handleItemChange(idx, 'status', e.target.value)}
                  >
                    <option value="">Select</option>
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Comment (optional)"
                    value={item.comment}
                    onChange={e => handleItemChange(idx, 'comment', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <CheckListPhotoInput
                    photo={item.photo}
                    onChange={file => handleItemChange(idx, 'photo', file)}
                    onRemove={() => handleItemChange(idx, 'photo', null)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* TODO: Add save/submit and digital signature logic */}
    </div>
  );
};

export default CheckListManager;

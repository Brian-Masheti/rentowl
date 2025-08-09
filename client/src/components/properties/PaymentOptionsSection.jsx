import React, { useState } from 'react';
import { getPaymentMethodIcon, FaTrash, FaEdit } from './PaymentMethodIcons';

const PAYMENT_METHODS = [
  { value: 'mpesa', label: 'Direct Mpesa' },
  { value: 'dtb', label: 'DTB (Diamond Trust Bank)' },
  { value: 'cooperative', label: 'Cooperative Bank' },
  { value: 'equity', label: 'Equity Bank' },
  { value: 'family', label: 'Family Bank' },
  { value: 'kcb', label: 'KCB' },
  { value: 'custom', label: 'Custom/Other' },
];

const DEFAULT_FIELDS = {
  mpesa: { phone: '' },
  dtb: { paybill: '516600', account: '' },
  cooperative: { paybill: '400200', account: '' },
  equity: { paybill: '247247', account: '' },
  family: { paybill: '222169', account: '' },
  kcb: { paybill: '522559', account: '' },
  custom: { paybill: '', account: '', label: '' },
};

const PaymentOptionsSection = ({ value = [], onChange }) => {
  const [options, setOptions] = useState(value);
  const [adding, setAdding] = useState(false);
  const [newMethod, setNewMethod] = useState('');
  const [fields, setFields] = useState({});
  const [editIdx, setEditIdx] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState(null);

  const handleAdd = () => {
    if (!newMethod) return;
    setFields(DEFAULT_FIELDS[newMethod] || {});
    setAdding(true);
  };

  const handleSave = () => {
    if (!newMethod) return;
    const option = {
      method: newMethod,
      ...fields,
    };
    let updated;
    if (editIdx !== null) {
      updated = [...options];
      updated[editIdx] = option;
    } else {
      updated = [...options, option];
    }
    setOptions(updated);
    setAdding(false);
    setNewMethod('');
    setFields({});
    setEditIdx(null);
    if (onChange) onChange(updated);
  };

  const handleRemove = idx => {
    setShowDeleteModal(true);
    setDeleteIdx(idx);
  };
  const confirmRemove = () => {
    if (deleteIdx === null) return;
    const updated = options.filter((_, i) => i !== deleteIdx);
    setOptions(updated);
    setShowDeleteModal(false);
    setDeleteIdx(null);
    if (onChange) onChange(updated);
  };
  const cancelRemove = () => {
    setShowDeleteModal(false);
    setDeleteIdx(null);
  };

  const handleFieldChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col gap-3">
      {options.length === 0 && <div className="text-gray-500 text-sm">No payment methods added yet.</div>}
      {options.map((opt, idx) => (
        <div key={idx} className="flex flex-col border-b pb-2 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-1 items-start justify-between w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              {getPaymentMethodIcon(opt.method)}
              <div className="flex flex-col gap-1">
                <span className={
                  `text-[#03A6A1] ${editIdx === idx ? 'font-extrabold underline underline-offset-4' : 'font-semibold'}`
                }>
                  {PAYMENT_METHODS.find(m => m.value === opt.method)?.label || opt.label || opt.method}
                </span>
                {opt.phone && (
                <div className="flex items-center gap-2 min-w-[120px]">
                <span className="font-semibold text-gray-700 text-right w-20">Phone:</span>
                <span className="font-mono rounded-full px-3 py-1 font-bold text-[#23272F] tracking-wide shadow"
                style={{
                background: '#E6F7F8',
                border: '2px solid #03A6A1',
                boxShadow: '0 2px 8px #03A6A133',
                minWidth: '120px',
                textAlign: 'left',
                }}
                >{opt.phone}</span>
                </div>
                )}
                {opt.paybill && (
                <div className="flex items-center gap-2 min-w-[120px]">
                <span className="font-semibold text-gray-700 text-right w-20">Paybill:</span>
                <span className="font-mono rounded-full px-3 py-1 font-bold text-[#23272F] tracking-wide shadow"
                style={{
                background: '#E6F7F8',
                border: '2px solid #03A6A1',
                boxShadow: '0 2px 8px #03A6A133',
                minWidth: '120px',
                textAlign: 'left',
                }}
                >{opt.paybill}</span>
                </div>
                )}
                {opt.account && (
                <div className="flex items-center gap-2 min-w-[120px]">
                <span className="font-semibold text-gray-700 text-right w-20">Account:</span>
                <span className="font-mono rounded-full px-3 py-1 font-bold text-[#23272F] tracking-wide shadow"
                style={{
                background: '#E6F7F8',
                border: '2px solid #03A6A1',
                boxShadow: '0 2px 8px #03A6A133',
                minWidth: '120px',
                textAlign: 'left',
                }}
                >{opt.account}</span>
                </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0 justify-center">
              <button
                type="button"
                className="bg-[#FFA673] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-[#03A6A1] transition"
                title="Edit Payment Method"
                onClick={() => {
                  setNewMethod(opt.method);
                  setFields({ ...opt });
                  setAdding(true);
                  setEditIdx(idx);
                }}
              >
                <FaEdit />
              </button>
              <button
                type="button"
                className="bg-[#FF4F0F] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-[#FFA673] transition"
                title="Delete Payment Method"
                onClick={() => handleRemove(idx)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
          {/* Delete confirmation modal */}
          {showDeleteModal && deleteIdx === idx && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full flex flex-col items-center">
                <div className="text-[#FF4F0F] text-3xl mb-2"><FaTrash /></div>
                <div className="font-bold text-lg mb-2">Delete Payment Method?</div>
                <div className="text-gray-700 mb-4 text-center">Are you sure you want to delete this payment method? This action cannot be undone.</div>
                <div className="flex gap-4 justify-center">
                  <button className="bg-gray-300 text-gray-700 rounded-full px-4 py-1 font-semibold hover:bg-gray-400 transition" onClick={cancelRemove}>Cancel</button>
                  <button className="bg-[#FF4F0F] text-white rounded-full px-4 py-1 font-semibold hover:bg-[#FFA673] transition" onClick={confirmRemove}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {adding ? (
        <div className="flex flex-col gap-2 border p-2 rounded bg-[#F8F8F8]">
          <span className="font-semibold text-[#03A6A1]">{PAYMENT_METHODS.find(m => m.value === newMethod)?.label}</span>
          {newMethod === 'mpesa' && (
            <input
              type="text"
              className="border rounded px-2 py-1"
              placeholder="Mpesa Phone Number"
              value={fields.phone || ''}
              onChange={e => handleFieldChange('phone', e.target.value)}
              required
            />
          )}
          {['dtb', 'cooperative', 'equity', 'family', 'kcb', 'custom'].includes(newMethod) && (
            <>
              <input
                type="text"
                className="border rounded px-2 py-1"
                placeholder="Paybill/Business Number"
                value={fields.paybill || ''}
                onChange={e => handleFieldChange('paybill', e.target.value)}
                required
              />
              <input
                type="text"
                className="border rounded px-2 py-1"
                placeholder="Account Number (or Card/ID)"
                value={fields.account || ''}
                onChange={e => handleFieldChange('account', e.target.value)}
                required
              />
              {newMethod === 'custom' && (
                <input
                  type="text"
                  className="border rounded px-2 py-1"
                  placeholder="Custom Label (e.g. Bank Name)"
                  value={fields.label || ''}
                  onChange={e => handleFieldChange('label', e.target.value)}
                />
              )}
            </>
          )}
          <div className="flex gap-2 mt-2">
            <button type="button" className="bg-[#03A6A1] text-white rounded-full px-4 py-1 font-semibold hover:bg-[#FFA673] transition" onClick={handleSave}>Save</button>
            <button type="button" className="bg-gray-300 text-gray-700 rounded-full px-4 py-1 font-semibold hover:bg-gray-400 transition" onClick={() => { setAdding(false); setNewMethod(''); setFields({}); setEditIdx(null); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <select
            className="border rounded-full px-2 py-1 text-[#03A6A1] font-semibold bg-white focus:ring-2 focus:ring-[#03A6A1]"
            value={newMethod}
            onChange={e => setNewMethod(e.target.value)}
          >
            <option value="">Add Payment Method</option>
            {PAYMENT_METHODS.filter(m => !options.some(o => o.method === m.value)).map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="bg-[#03A6A1] text-white rounded-full px-4 py-1 font-semibold hover:bg-[#FFA673] transition"
            onClick={handleAdd}
            disabled={!newMethod}
          >
            + Add
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentOptionsSection;

import React, { useState } from 'react';

interface DeleteTenantModalProps {
  open: boolean;
  tenant: any;
  onClose: () => void;
  onDelete: (tenant: any) => void;
  themeColor?: string;
}

const DeleteTenantModal: React.FC<DeleteTenantModalProps> = ({ open, tenant, onClose, onDelete, themeColor = '#03A6A1' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open || !tenant) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await onDelete(tenant);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tenant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] relative"
        style={{ border: `2px solid ${themeColor}` }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
          Delete Tenant
        </h2>
        <p className="mb-4">Are you sure you want to <span className="text-[#FFA673] font-bold">soft delete</span> tenant <b>{tenant.firstName} {tenant.lastName}</b>?</p>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
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
            type="button"
            className="px-4 py-2 rounded font-bold text-white"
            style={{ background: themeColor }}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTenantModal;

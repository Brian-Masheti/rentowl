import React, { useState } from 'react';

interface EditTenantModalProps {
  open: boolean;
  tenant: any;
  onClose: () => void;
  onSave: (updated: any) => void;
  themeColor?: string;
}

const EditTenantModal: React.FC<EditTenantModalProps> = ({ open, tenant, onClose, onSave, themeColor = '#03A6A1' }) => {
  const [form, setForm] = useState({
    firstName: tenant?.firstName || '',
    lastName: tenant?.lastName || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (open && tenant) {
      setForm({
        firstName: tenant.firstName || '',
        lastName: tenant.lastName || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
      });
      setError('');
    }
  }, [open, tenant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Call parent onSave with updated tenant
      await onSave({ ...tenant, ...form });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update tenant.');
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
          Edit Tenant
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                className="border rounded px-4 py-2 w-full"
                value={form.firstName}
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
                value={form.lastName}
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
                value={form.email}
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
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
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
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTenantModal;

import React, { useState, useEffect } from 'react';

const EditCaretakerModal = ({ open, onClose, caretaker, onSuccess }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (caretaker) {
      setForm({
        firstName: caretaker.firstName || '',
        lastName: caretaker.lastName || '',
        username: caretaker.username || '',
        email: caretaker.email || '',
        phone: caretaker.phone || '',
        password: '',
        isActive: caretaker.isActive !== false,
      });
    }
  }, [caretaker]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/caretakers/${caretaker._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update caretaker');
      }
      setLoading(false);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to update caretaker');
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Edit Caretaker</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="border rounded px-3 py-2" required />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="border rounded px-3 py-2" required />
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="border rounded px-3 py-2" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" className="border rounded px-3 py-2" required />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border rounded px-3 py-2" required />
          <input name="password" value={form.password} onChange={handleChange} placeholder="New Password (optional)" type="password" className="border rounded px-3 py-2" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            Active
          </label>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCaretakerModal;

import React, { useState } from 'react';

const AddCaretakerModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/caretakers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add caretaker');
      }
      setLoading(false);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to add caretaker');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Add Caretaker</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="border rounded px-3 py-2" required />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="border rounded px-3 py-2" required />
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="border rounded px-3 py-2" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" className="border rounded px-3 py-2" required />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border rounded px-3 py-2" required />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" className="border rounded px-3 py-2" required />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition" disabled={loading}>
            {loading ? 'Adding...' : 'Add Caretaker'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCaretakerModal;

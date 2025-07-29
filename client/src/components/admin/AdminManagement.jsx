import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'support', label: 'Support' },
  { value: 'devops', label: 'DevOps' }
];
const PERMISSIONS = [
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'view_reports', label: 'View Reports' },
  { value: 'manage_properties', label: 'Manage Properties' },
  { value: 'manage_payments', label: 'Manage Payments' },
  // Add more as needed
];

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '', phone: '', password: '', role: 'admin', permissions: []
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch all admins/support users
  const fetchAdmins = async () => {
  setLoading(true);
  setError(null);
  try {
  const token = localStorage.getItem('token');
  // Only fetch users with admin/support/devops/super_admin roles from backend
  const res2 = await fetch(`${API_URL}/api/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
  const admins = (await res2.json()).admins || [];
  setAdmins(admins);
  } catch (err) {
  console.log(err);
  setError('Failed to fetch admins.');
  } finally {
  setLoading(false);
  }
  };

  useEffect(() => { fetchAdmins(); }, []);

  // Create new admin/support
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');
      setForm({ firstName: '', lastName: '', username: '', email: '', phone: '', password: '', role: 'admin', permissions: [] });
      fetchAdmins();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Promote/demote/permissions logic would be similar, calling /api/admin/promote, /api/admin/demote, /api/admin/update-permissions

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Admin Management</h2>
      <form onSubmit={handleCreate} className="mb-8 flex flex-wrap gap-4 items-end">
        <input type="text" placeholder="First Name" className="border rounded px-3 py-2" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
        <input type="text" placeholder="Last Name" className="border rounded px-3 py-2" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
        <input type="text" placeholder="Username" className="border rounded px-3 py-2" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
        <input type="email" placeholder="Email" className="border rounded px-3 py-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <input type="tel" placeholder="Phone" className="border rounded px-3 py-2" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
        <input type="password" placeholder="Password" className="border rounded px-3 py-2" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        <select className="border rounded px-3 py-2" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select multiple className="border rounded px-3 py-2" value={form.permissions} onChange={e => setForm(f => ({ ...f, permissions: Array.from(e.target.selectedOptions, o => o.value) }))}>
          {PERMISSIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <button type="submit" className="bg-[#03A6A1] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition" disabled={formLoading}>{formLoading ? 'Creating...' : 'Create Admin'}</button>
      </form>
      {formError && <div className="text-red-500 mb-4">{formError}</div>}
      <h3 className="text-lg font-bold mb-2">Current Admins</h3>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <table className="min-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg">
          <thead>
            <tr className="bg-[#FFF8F0] text-[#03A6A1]">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Permissions</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins
              .filter(a => ['admin', 'support', 'devops', 'super_admin'].includes(a.role))
              .map(a => (
                <tr key={a._id} className="hover:bg-[#FFE3BB]/60">
                  <td className="px-4 py-2">{a.firstName} {a.lastName}</td>
                  <td className="px-4 py-2">{a.username}</td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2">{a.role === 'devops' ? 'DevOps' : a.role === 'super_admin' ? 'Super Admin' : a.role.charAt(0).toUpperCase() + a.role.slice(1)}</td>
                  <td className="px-4 py-2">{(a.permissions || []).join(', ')}</td>
                  <td className="px-4 py-2">{/* TODO: Add promote/demote/permissions UI */}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminManagement;

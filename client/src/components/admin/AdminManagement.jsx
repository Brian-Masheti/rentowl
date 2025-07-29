import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'support', label: 'Support' },
  { value: 'devops', label: 'DevOps' }
];
const PERMISSIONS = [
  { value: 'manage_checklists', label: 'Manage Checklists' },
  { value: 'manage_deployments', label: 'Manage Deployments' },
  { value: 'manage_documents', label: 'Manage Documents' },
  { value: 'manage_finances', label: 'Manage Finances' },
  { value: 'manage_infrastructure', label: 'Manage Infrastructure' },
  { value: 'manage_maintenance', label: 'Manage Maintenance' },
  { value: 'manage_payments', label: 'Manage Payments' },
  { value: 'manage_properties', label: 'Manage Properties' },
  { value: 'manage_roles', label: 'Manage Roles' },
  { value: 'manage_tickets', label: 'Manage Tickets' },
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'receive_notifications', label: 'Receive Notifications' },
  { value: 'send_announcements', label: 'Send Announcements' },
  { value: 'view_logs', label: 'View Logs' },
  { value: 'view_properties', label: 'View Properties' },
  { value: 'view_reports', label: 'View Reports' },
];

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '', phone: '', password: '', role: '', permissions: []
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editUser, setEditUser] = useState(null); // user being edited
  const [editPermissions, setEditPermissions] = useState([]); // permissions being edited
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#03A6A1]">Admin Role</label>
          <select
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-[#03A6A1]/40 focus:bg-[#FFF8F0] transition"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            required
          >
            <option value="" disabled>
              ---Select Admin Role---
            </option>
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Permissions</label>
          <div className="flex flex-wrap gap-2">
            {PERMISSIONS.map(p => {
              const selected = form.permissions.includes(p.value);
              return (
                <button
                  type="button"
                  key={p.value}
                  className={
                    `px-3 py-1 rounded-full border text-xs font-semibold transition-all duration-150 ${selected ? 'bg-[#03A6A1] text-white border-[#03A6A1]' : 'bg-white text-[#03A6A1] border-[#03A6A1]/40 hover:bg-[#03A6A1]/10'}`
                  }
                  style={{ outline: 'none' }}
                  onClick={() => setForm(f => ({
                    ...f,
                    permissions: selected
                      ? f.permissions.filter(val => val !== p.value)
                      : [...f.permissions, p.value]
                  }))}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
        <button type="submit" className="bg-[#03A6A1] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition" disabled={formLoading}>{formLoading ? 'Creating...' : 'Create Admin'}</button>
      </form>
      {formError && <div className="text-red-500 mb-4">{formError}</div>}
      <h3 className="text-lg font-bold mb-2">Current Admins</h3>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <table className="min-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg">
          <thead className="sticky top-0 z-10">
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
              .map((a, idx) => (
                <tr
                  key={a._id}
                  className={
                    `transition-colors duration-150 ${idx % 2 === 0 ? 'bg-[#FFF8F0]/60' : 'bg-white'} hover:bg-[#FFE3BB]/80`
                  }
                >
                  <td className="px-4 py-2 font-semibold flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#03A6A1]/20 text-[#03A6A1] font-bold text-base">
                      {a.firstName?.[0] || ''}{a.lastName?.[0] || ''}
                    </span>
                    <span>{a.firstName} {a.lastName}</span>
                  </td>
                  <td className="px-4 py-2">{a.username}</td>
                  <td className="px-4 py-2 truncate max-w-[160px]" title={a.email}>{a.email}</td>
                  <td className="px-4 py-2">{a.role === 'devops' ? 'DevOps' : a.role === 'super_admin' ? 'Super Admin' : a.role.charAt(0).toUpperCase() + a.role.slice(1)}</td>
                  <td className="px-4 py-2 align-top">
                    {(a.permissions && a.permissions.length > 0)
                      ? <div className="flex flex-wrap gap-1 max-w-xs md:max-w-md overflow-y-auto" style={{ maxHeight: 90 }}>
                          {a.permissions.map(p => {
                            const label = PERMISSIONS.find(perm => perm.value === p)?.label || p;
                            return (
                              <span
                                key={p}
                                className="group bg-[#03A6A1]/10 text-[#03A6A1] border border-[#03A6A1]/30 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1 relative"
                                style={{ marginBottom: 2 }}
                              >
                                {label}
                                <button
                                  type="button"
                                  className="ml-1 text-[#FF4F0F] hover:text-red-700 font-bold focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute right-1"
                                  style={{ top: 0, bottom: 0 }}
                                  onClick={async () => {
                                    // Remove permission for this user
                                    const newPerms = a.permissions.filter(perm => perm !== p);
                                    const token = localStorage.getItem('token');
                                    await fetch(`${API_URL}/api/admin/update-permissions`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ identifier: a.email, permissions: newPerms })
                                    });
                                    fetchAdmins();
                                  }}
                                  aria-label={`Remove ${label}`}
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      : <span className="text-gray-400 italic">No permissions</span>}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-[#03A6A1] text-white px-3 py-1 rounded hover:bg-[#FFA673] transition text-xs font-semibold"
                      onClick={() => {
                        setEditUser(a);
                        setEditPermissions(a.permissions || []);
                        setEditError(null);
                      }}
                    >
                      Edit Permissions
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    {/* Edit Permissions Modal */}
      {editUser && (
        <EditPermissionsModal
          editUser={editUser}
          setEditUser={setEditUser}
          editPermissions={editPermissions}
          setEditPermissions={setEditPermissions}
          setEditError={setEditError}
          setEditLoading={setEditLoading}
          editLoading={editLoading}
          editError={editError}
          fetchAdmins={fetchAdmins}
        />
      )}
    </div>
  );
};

function EditPermissionsModal({ editUser, setEditUser, editPermissions, setEditPermissions, setEditError, setEditLoading, editLoading, editError, fetchAdmins }) {
  React.useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') setEditUser(null);
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setEditUser]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl min-h-[500px] relative flex flex-col justify-between">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-[#03A6A1] text-xl"
          onClick={() => setEditUser(null)}
        >
          &times;
        </button>
        <h3 className="text-lg font-bold mb-4 text-[#03A6A1]">Edit Permissions for {editUser.firstName} {editUser.lastName}</h3>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setEditLoading(true);
            setEditError(null);
            try {
              const token = localStorage.getItem('token');
              const res = await fetch(`${API_URL}/api/admin/update-permissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ identifier: editUser.email, permissions: editPermissions })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Failed to update permissions');
              setEditUser(null);
              fetchAdmins();
            } catch (err) {
              setEditError(err.message);
            } finally {
              setEditLoading(false);
            }
          }}
        >
          <label className="block mb-2 font-semibold">Permissions</label>
          <div className="flex flex-wrap gap-1 mb-4">
            {editPermissions.length > 0 ? (
              editPermissions.map(p => {
                const label = PERMISSIONS.find(perm => perm.value === p)?.label || p;
                return (
                  <span
                    key={p}
                    className="inline-block bg-[#03A6A1]/10 text-[#03A6A1] border border-[#03A6A1]/30 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1"
                    style={{ marginBottom: 2 }}
                  >
                    {label}
                    <button
                      type="button"
                      className="ml-1 text-[#FF4F0F] hover:text-red-700 font-bold focus:outline-none"
                      onClick={() => setEditPermissions(editPermissions.filter(perm => perm !== p))}
                      aria-label={`Remove ${label}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="text-gray-400 italic">No permissions</span>
            )}
          </div>
          <select
            multiple
            className="border rounded px-3 py-2 w-full mb-4"
            style={{ minHeight: 220, fontSize: 16 }}
            value={editPermissions}
            onChange={e => setEditPermissions(Array.from(e.target.selectedOptions, o => o.value))}
          >
            {PERMISSIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {editError && <div className="text-red-500 mb-2">{editError}</div>}
          <button
            type="submit"
            className="bg-[#03A6A1] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition"
            disabled={editLoading}
          >
            {editLoading ? 'Saving...' : 'Save Permissions'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminManagement;

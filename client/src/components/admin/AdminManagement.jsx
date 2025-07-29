import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaUserCircle } from 'react-icons/fa';

// Success Toast with checkmark animation
function Toast({ message, onClose, type = 'success' }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${type === 'success' ? 'bg-[#03A6A1] text-white' : 'bg-[#FF4F0F] text-white'}`}>
      {type === 'success' && (
        <span className="inline-flex items-center justify-center animate-bounce">
          <FaCheckCircle className="text-white text-xl mr-2" />
        </span>
      )}
      {message}
      <button onClick={onClose} className="ml-2 text-lg font-bold focus:outline-none">×</button>
    </div>
  );
}

function DeleteAdminModal({ admin, onCancel, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FF4F0F]/10 mb-4">
          <FaTrash className="text-[#FF4F0F] text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-[#FF4F0F] mb-2">Delete Admin</h2>
        <p className="text-gray-700 mb-6 text-center">
          Are you sure you want to delete or demote <span className="font-semibold">{admin.firstName} {admin.lastName}</span> ({admin.email})?<br/>
          This action cannot be undone.
        </p>
        <div className="flex gap-4 w-full justify-center">
          <button
            className="px-6 py-2 rounded-full bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-full bg-[#FF4F0F] text-white font-bold hover:bg-[#FFA673] transition"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminProfileModal({ admin, onClose }) {
  if (!admin) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center relative">
        <button
          className="absolute top-2 right-2 text-[#03A6A1] hover:text-[#FF4F0F] text-2xl font-bold focus:outline-none"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex flex-col items-center mb-4">
          <FaUserCircle className="text-6xl text-[#03A6A1]/60 mb-2" />
          <h2 className="text-xl font-bold text-[#03A6A1]">{admin.firstName} {admin.lastName}</h2>
          <div className="text-gray-500">{admin.email}</div>
          <div className="text-gray-500">{admin.username}</div>
          <div className="text-gray-500">{admin.phone}</div>
          <div className="text-sm mt-2 px-3 py-1 rounded-full bg-[#03A6A1]/10 text-[#03A6A1] font-semibold">
            {admin.role === 'devops' ? 'DevOps' : admin.role === 'super_admin' ? 'Super Admin' : admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
          </div>
        </div>
        <div className="w-full">
          <h3 className="font-bold mb-2 text-[#03A6A1]">Permissions</h3>
          {admin.permissions && admin.permissions.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {admin.permissions.map(p => (
                <li key={p} className="bg-[#03A6A1]/10 text-[#03A6A1] border border-[#03A6A1]/30 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                  {p}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-400 italic">No permissions</span>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [toast, setToast] = useState(null); // { message, type }
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editUser, setEditUser] = useState(null); // user being edited
  const [editPermissions, setEditPermissions] = useState([]); // permissions being edited
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null); // admin to delete
  const [profileUser, setProfileUser] = useState(null); // admin for profile modal

  // Fetch all admins/support users
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res2 = await fetch(`${API_URL}/api/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      const admins = (await res2.json()).admins || [];
      setAdmins(admins);
    } catch (err) {
      console.log(err)
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
      setForm({ firstName: '', lastName: '', username: '', email: '', phone: '', password: '', role: '', permissions: [] });
      setToast({ message: 'Admin created successfully!', type: 'success' });
      fetchAdmins();
    } catch (err) {
      setFormError(err.message);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  // Custom error handler for API errors
  const handleApiError = (err) => {
    let msg = err.message || 'An error occurred.';
    if (msg.includes('last super admin')) {
      msg = 'Cannot demote the last super admin!';
    }
    setToast({ message: msg, type: 'error' });
  };

    // Empty state illustration (simple SVG)
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <svg width="120" height="120" fill="none" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="56" fill="#FFF8F0" stroke="#FFA673" strokeWidth="4" />
        <rect x="35" y="60" width="50" height="20" rx="6" fill="#FFA673" />
        <rect x="45" y="40" width="30" height="20" rx="6" fill="#03A6A1" />
        <circle cx="60" cy="50" r="4" fill="#FFF8F0" />
      </svg>
      <div className="mt-6 text-lg font-semibold text-[#03A6A1]">No admins found</div>
      <div className="text-gray-500">Admins you add will appear here.</div>
    </div>
  );

  // Admin Card for mobile
  const AdminCard = ({ a }) => (
    <div className="bg-[#FFF8F0]/60 rounded-xl shadow p-4 mb-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#03A6A1]/20 text-[#03A6A1] font-bold text-lg">
          {a.firstName?.[0] || ''}{a.lastName?.[0] || ''}
        </span>
        <button className="text-lg font-bold text-[#03A6A1] hover:underline" onClick={() => setProfileUser(a)}>
          {a.firstName} {a.lastName}
        </button>
      </div>
      <div className="text-sm text-gray-600">Username: {a.username}</div>
      <div className="text-sm text-gray-600">Email: {a.email}</div>
      <div className="text-sm text-gray-600">Role: {a.role === 'devops' ? 'DevOps' : a.role === 'super_admin' ? 'Super Admin' : a.role.charAt(0).toUpperCase() + a.role.slice(1)}</div>
      <div className="flex flex-wrap gap-1 mt-1">
        {(a.permissions && a.permissions.length > 0)
          ? a.permissions.map(p => {
              const label = PERMISSIONS.find(perm => perm.value === p)?.label || p;
              return (
                <span key={p} className="bg-[#03A6A1]/10 text-[#03A6A1] border border-[#03A6A1]/30 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                  {label}
                </span>
              );
            })
          : <span className="text-gray-400 italic">No permissions</span>}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="bg-[#03A6A1] text-white p-2 rounded-full hover:bg-[#FFA673] transition"
          onClick={() => {
            setEditUser(a);
            setEditPermissions(a.permissions || []);
            setEditError(null);
          }}
          aria-label="Edit Permissions"
          title="Edit Permissions"
        >
          <FaEdit />
        </button>
        <button
          className="bg-[#FF4F0F] text-white p-2 rounded-full hover:bg-[#FFA673] transition"
          onClick={() => setDeleteUser(a)}
          aria-label="Delete Admin"
          title="Delete Admin"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Admin Management</h2>
      <form onSubmit={handleCreate} className="mb-8 flex flex-wrap gap-4 items-end">
        <input type="text" placeholder="First Name" className="border rounded-full px-3 py-2 focus:ring-2 focus:ring-[#03A6A1]/40 focus:bg-[#FFF8F0] hover:bg-[#FFF8F0] hover:border-[#03A6A1] transition" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required aria-label="First Name" />
        <input type="text" placeholder="Last Name" className="border rounded-full px-3 py-2 focus:ring-2 focus:ring-[#03A6A1]/40 focus:bg-[#FFF8F0] hover:bg-[#FFF8F0] hover:border-[#03A6A1] transition" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required aria-label="Last Name" />
        <input type="text" placeholder="Username" className="border rounded-full px-3 py-2 focus:ring-2 focus:ring-[#03A6A1]/40 focus:bg-[#FFF8F0] hover:bg-[#FFF8F0] hover:border-[#03A6A1] transition" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required aria-label="Username" />
        <input type="email" placeholder="Email" className="border rounded-full px-3 py-2 focus:ring-2 focus:ring-[#03A6A1]/40 focus:bg-[#FFF8F0] hover:bg-[#FFF8F0] hover:border-[#03A6A1] transition" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required aria-label="Email" />
        <input type="tel" placeholder="Phone" className="border rounded-full px-3 py-2 focus:ring-2 focus:ring-[#03A6A1]/40 focus:bg-[#FFF8F0] hover:bg-[#FFF8F0] hover:border-[#03A6A1] transition" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required aria-label="Phone" />
        <input type="password" placeholder="Password" className="border rounded-full px-3 py-2 focus:ring-2 focus:ring-[#03A6A1]/40 focus:bg-[#FFF8F0] hover:bg-[#FFF8F0] hover:border-[#03A6A1] transition" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required aria-label="Password" />
        <div className="flex flex-col gap-1">
          <select
            className="border rounded-full px-3 py-2 focus:ring-2 focus:ring-[#03A6A1]/40 focus:bg-[#FFF8F0] hover:bg-[#FFF8F0] hover:border-[#03A6A1] transition"
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
        <button
          type="submit"
          className={`bg-[#03A6A1] text-white px-4 py-2 rounded-full font-bold hover:bg-[#FFA673] transition flex items-center gap-2 ${formLoading || !form.firstName || !form.lastName || !form.username || !form.email || !form.phone || !form.password || !form.role ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={formLoading || !form.firstName || !form.lastName || !form.username || !form.email || !form.phone || !form.password || !form.role}
        >
          {formLoading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
          {formLoading ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
      {formError && <div className="text-red-500 mb-4">{formError}</div>}
      <h3 className="text-lg font-bold mb-2">Current Admins</h3>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        admins.length === 0 ? <EmptyState /> : (
          <div>
            {/* Responsive: show table on desktop, cards on mobile */}
            <div className="hidden md:block overflow-x-auto">
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
                    .filter(a => ['admin', 'support', 'devops', 'super_admin'].includes(a.role) && a.isActive !== false)
                    .map((a, idx) => (
                      <tr
                        key={a._id}
                        className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-[#FFF8F0]/60' : 'bg-white'} hover:bg-[#FFE3BB]/80`}
                      >
                        <td className="px-4 py-2 font-semibold flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#03A6A1]/20 text-[#03A6A1] font-bold text-base">
                            {a.firstName?.[0] || ''}{a.lastName?.[0] || ''}
                          </span>
                          <button className="text-[#03A6A1] font-bold hover:underline" onClick={() => setProfileUser(a)}>
                            {a.firstName} {a.lastName}
                          </button>
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
                                          try {
                                            await fetch(`${API_URL}/api/admin/update-permissions`, {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                              body: JSON.stringify({ identifier: a.email, permissions: newPerms })
                                            });
                                            fetchAdmins();
                                          } catch (err) {
                                            handleApiError(err);
                                          }
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
                        <td className="px-4 py-2 flex gap-2 items-center">
                          <button
                            className="bg-[#03A6A1] text-white p-2 rounded-full hover:bg-[#FFA673] transition"
                            onClick={() => {
                              setEditUser(a);
                              setEditPermissions(a.permissions || []);
                              setEditError(null);
                            }}
                            aria-label="Edit Permissions"
                            title="Edit Permissions"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="bg-[#FF4F0F] text-white p-2 rounded-full hover:bg-[#FFA673] transition"
                            onClick={() => setDeleteUser(a)}
                            aria-label="Delete Admin"
                            title="Delete Admin"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="block md:hidden">
              {admins
                .filter(a => ['admin', 'support', 'devops', 'super_admin'].includes(a.role) && a.isActive !== false)
                .map(a => <AdminCard key={a._id} a={a} />)}
            </div>
          </div>
        )
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
      {deleteUser && (
        <DeleteAdminModal
          admin={deleteUser}
          onCancel={() => setDeleteUser(null)}
          onDelete={async () => {
            try {
              const token = localStorage.getItem('token');
              const res = await fetch(`${API_URL}/api/admin/demote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ identifier: deleteUser.email })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Failed to delete/demote admin');
              setToast({ message: 'Admin deleted/demoted successfully!', type: 'success' });
              setDeleteUser(null);
              fetchAdmins();
            } catch (err) {
              handleApiError(err);
              setDeleteUser(null);
            }
          }}
        />
      )}
      {profileUser && (
        <AdminProfileModal admin={profileUser} onClose={() => setProfileUser(null)} />
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
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
      <div className="bg-white rounded-2xl border-2 border-[#03A6A1]/20 shadow-lg p-8 w-full max-w-2xl min-h-[500px] relative flex flex-col justify-between">
        <button
          className="absolute top-2 right-2 text-[#03A6A1] hover:text-[#FF4F0F] text-2xl font-bold focus:outline-none"
          onClick={() => setEditUser(null)}
        >
          &times;
        </button>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#03A6A1]/10 flex items-center justify-center text-[#03A6A1] font-bold text-xl">
            {editUser.firstName?.[0] || ''}{editUser.lastName?.[0] || ''}
          </div>
          <h3 className="text-lg font-bold text-[#03A6A1]">Edit Permissions for {editUser.firstName} {editUser.lastName}</h3>
        </div>
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
                    className="bg-[#03A6A1]/10 text-[#03A6A1] border border-[#03A6A1]/30 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1"
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
            className="border rounded px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-[#03A6A1]/40 focus:bg-[#FFF8F0] hover:bg-[#FFF8F0] hover:border-[#03A6A1] transition bg-[#FFF8F0] text-[#03A6A1]"
            style={{ minHeight: 220, fontSize: 16 }}
            value={editPermissions}
            onChange={e => setEditPermissions(Array.from(e.target.selectedOptions, o => o.value))}
          >
            {PERMISSIONS.map(p => (
              <option
                key={p.value}
                value={p.value}
                className={editPermissions.includes(p.value)
                  ? 'bg-[#03A6A1] text-white font-semibold'
                  : 'bg-white text-[#03A6A1]'}
              >
                {p.label}
              </option>
            ))}
          </select>
          {editError && <div className="text-red-500 mb-2">{editError}</div>}
          <button
            type="submit"
            className="bg-[#03A6A1] text-white px-4 py-2 rounded-full font-bold hover:bg-[#FFA673] transition"
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

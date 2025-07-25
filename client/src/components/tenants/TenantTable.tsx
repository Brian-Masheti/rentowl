import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EditTenantModal from './EditTenantModal';
import DeleteTenantModal from './DeleteTenantModal';

export type TenantTableRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyName: string;
  unitType?: string;      // <-- Added for table display
  deleted?: boolean;      // <-- Added for soft delete
};

interface TenantTableProps {
  tenants: TenantTableRow[];
}

const TenantTable: React.FC<TenantTableProps> = ({ tenants }) => {
  const [editTenant, setEditTenant] = useState<TenantTableRow | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<TenantTableRow | null>(null);
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'property' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filter out soft-deleted tenants and deduplicate by id
  let visibleTenants = Array.from(
    new Map(
      tenants
        .filter(t => !t.deleted)
        .map(t => [t.id, t])
    ).values()
  );

  // Filter by search
  if (search) {
    visibleTenants = visibleTenants.filter(t =>
      (`${t.firstName ?? ''} ${t.lastName ?? ''}`).toLowerCase().includes(search.toLowerCase()) ||
      (t.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.phone ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.propertyName ?? '').toLowerCase().includes(search.toLowerCase())
    );
  }
  // Filter by property
  if (propertyFilter) {
    visibleTenants = visibleTenants.filter(t => t.propertyName === propertyFilter);
  }
  // Sort (copy array before sorting)
  if (sortBy === 'name') {
    visibleTenants = [...visibleTenants].sort((a, b) => {
      const aName = (`${a.firstName ?? ''} ${a.lastName ?? ''}`).toLowerCase();
      const bName = (`${b.firstName ?? ''} ${b.lastName ?? ''}`).toLowerCase();
      return sortDir === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    });
  } else if (sortBy === 'property') {
    visibleTenants = [...visibleTenants].sort((a, b) => {
      return sortDir === 'asc'
        ? (a.propertyName ?? '').localeCompare(b.propertyName ?? '')
        : (b.propertyName ?? '').localeCompare(a.propertyName ?? '');
    });
  }

  // Unique property names for filter dropdown
  const propertyOptions = Array.from(new Set(tenants.map(t => t.propertyName)));

  return (
    <div className="overflow-x-auto mt-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
        />
        <select
          value={propertyFilter}
          onChange={e => setPropertyFilter(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
        >
          <option value="">All Properties</option>
          {propertyOptions.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <table className="min-w-full bg-white border border-[#FFA673]/40 rounded-xl shadow">
        <thead>
          <tr className="bg-[#FFE3BB] text-[#03A6A1]">
            <th className="py-2 px-4 text-left font-bold cursor-pointer select-none" onClick={() => {
              setSortBy('name');
              setSortDir(sortBy === 'name' && sortDir === 'asc' ? 'desc' : 'asc');
            }}>
              Name {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
            </th>
            <th className="py-2 px-4 text-left font-bold">Email</th>
            <th className="py-2 px-4 text-left font-bold">Phone</th>
            <th className="py-2 px-4 text-left font-bold cursor-pointer select-none" onClick={() => {
              setSortBy('property');
              setSortDir(sortBy === 'property' && sortDir === 'asc' ? 'desc' : 'asc');
            }}>
              Property {sortBy === 'property' && (sortDir === 'asc' ? '▲' : '▼')}
            </th>
            <th className="py-2 px-4 text-left font-bold">Unit Type</th>
            <th className="py-2 px-4 text-left font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleTenants.map(t => (
            <tr key={t.id} className="border-t border-[#FFA673]/20 hover:bg-[#FFF8F0]">
              <td className="py-2 px-4">{`${t.firstName || ''} ${t.lastName || ''}`}</td>
              <td className="py-2 px-4">{t.email}</td>
              <td className="py-2 px-4">{t.phone}</td>
              <td className="py-2 px-4">{t.propertyName}</td>
              <td className="py-2 px-4">{t.unitType || ''}</td>
              <td className="py-2 px-4 flex gap-3 items-center">
                <button
                  className="text-[#03A6A1] hover:text-[#FFA673] transition"
                  title="Edit Tenant"
                  onClick={() => setEditTenant(t)}
                >
                  <FaEdit />
                </button>
                <button
                  className="text-[#FFA673] hover:text-red-600 transition"
                  title="Delete Tenant"
                  onClick={() => setDeleteTenant(t)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditTenantModal
        open={!!editTenant}
        tenant={editTenant}
        onClose={() => setEditTenant(null)}
        onSave={async (updated) => {
          if (!updated || !updated.id) return;
          try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/tenants/${updated.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                firstName: updated.firstName,
                lastName: updated.lastName,
                email: updated.email,
                phone: updated.phone,
              }),
            });
            if (!res.ok) throw new Error('Failed to update tenant');
            setEditTenant(null);
            window.location.reload(); // Quick refresh to show changes
          } catch (err) {
            alert('Failed to update tenant.');
          }
        }}
        themeColor="#03A6A1"
      />
      <DeleteTenantModal
        open={!!deleteTenant}
        tenant={deleteTenant}
        onClose={() => setDeleteTenant(null)}
        onDelete={async (tenant) => {
          if (!tenant || !tenant.id) return;
          try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/tenants/${tenant.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ deleted: true }),
            });
            if (!res.ok) throw new Error('Failed to delete tenant');
            setDeleteTenant(null);
            window.location.reload();
          } catch (err) {
            alert('Failed to delete tenant.');
          }
        }}
        themeColor="#03A6A1"
      />
    </div>
  );
};

export default TenantTable;

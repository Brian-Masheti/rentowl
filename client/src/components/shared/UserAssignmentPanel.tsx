import React, { useState, useEffect } from 'react';
import ResponsiveTableOrCards from '../common/ResponsiveTableOrCards';

interface UserAssignmentPanelProps {
  userType: 'tenant' | 'caretaker';
  properties: any[];
  fetchUsers: () => Promise<any[]>;
  onAssign: (userIds: string[], propertyId: string, unitType: string) => void;
  onResendInvite?: (userId: string) => void;
  getUnitAvailability?: (propertyId: string, unitType: string) => number;
  getUserDetails?: (userId: string) => Promise<any>;
  onWelcomeMessage?: (userId: string, message: string) => void;
  fetchAuditLog?: () => Promise<any[]>;
}

const UserAssignmentPanel: React.FC<UserAssignmentPanelProps> = ({
  userType,
  properties,
  fetchUsers,
  onAssign,
  onResendInvite,
  getUnitAvailability,
  getUserDetails,
  onWelcomeMessage,
  fetchAuditLog,
}) => {
  // State for users, selection, filters, modals, etc.
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  // Per-row selection state
  const [rowSelections, setRowSelections] = useState<{ [userId: string]: { propertyId: string; unitType: string } }>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState('');
  const [showDetails, setShowDetails] = useState<any | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState<any | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Remove all references to selectedProperty, selectedUnitType, setSelectedProperty, setSelectedUnitType, setUnitTypes
  useEffect(() => {
    setLoading(true);
    fetchUsers().then(setUsers).catch(() => setError('Failed to fetch users')).finally(() => setLoading(false));
  }, [fetchUsers]);

  // (Per-row unit type logic is now handled in rowSelections, so this effect is removed)

  // Only show unassigned users in the assignment UI
  const unassignedUsers = users.filter(u => !u.property && !u.unitType);
  // Filtered and searched users for assignment UI
  let filteredUsers = unassignedUsers;
  if (search) {
    filteredUsers = filteredUsers.filter(u =>
      (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (statusFilter) filteredUsers = filteredUsers.filter(u => u.status === statusFilter);
  if (propertyFilter) filteredUsers = filteredUsers.filter(u => u.propertyName === propertyFilter);
  if (unitTypeFilter) filteredUsers = filteredUsers.filter(u => u.unitType === unitTypeFilter);

  // Unique property/unitType/status options
  const propertyOptions = Array.from(new Set(properties.map(p => p.name)));
  const unitTypeOptions = Array.from(new Set(properties.flatMap(p => p.units?.map((u: any) => u.type) || [])));
  const statusOptions = ['Active', 'Pending', 'Deleted', 'Invited'];

  // Bulk assign handler removed: per-row assignment only

  return (
    <div className="mb-6 p-4 bg-[#FFF8F0] rounded-xl border border-[#FFA673]/40">
      <h3 className="font-bold text-[#03A6A1] mb-2">Assign {userType === 'tenant' ? 'Tenant(s)' : 'Caretaker(s)'} to Property</h3>
      {/* Search, filter, and bulk actions */}
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <input
          type="text"
          placeholder={`Search ${userType}s...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All Properties</option>
          {propertyOptions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={unitTypeFilter} onChange={e => setUnitTypeFilter(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All Unit Types</option>
          {unitTypeOptions.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        {/* Bulk Assign button removed: per-row assignment only */}
        <button
          className="bg-[#FFA673] text-white font-bold px-4 py-2 rounded hover:bg-[#03A6A1] transition"
          onClick={() => setShowAuditLog(true)}
        >
          View Audit Log
        </button>
      </div>
      {/* Bulk Assign Modal */}
      {showDetails === 'bulk' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowDetails(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] relative" style={{ border: '2px solid #03A6A1' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#03A6A1' }}>Bulk Assign Tenants</h2>
            <table className="min-w-full bg-white border border-[#FFA673]/40 rounded-xl shadow mb-4">
              <thead>
                <tr className="bg-[#FFE3BB] text-[#03A6A1]">
                  <th className="py-2 px-4 text-left font-bold">Name</th>
                  <th className="py-2 px-4 text-left font-bold">Property</th>
                  <th className="py-2 px-4 text-left font-bold">Unit Type</th>
                  <th className="py-2 px-4 text-left font-bold">Assign</th>
                </tr>
              </thead>
              <tbody>
                {selectedUsers.map(userId => {
                  const u = users.find(u => u._id === userId);
                  return (
                    <tr key={userId}>
                      <td className="py-2 px-4">{u?.firstName} {u?.lastName}</td>
                      <td className="py-2 px-4">
                        <select
                          value={u?.propertyId || ''}
                          onChange={e => {
                            u.propertyId = e.target.value;
                            setUnitTypes(properties.find(p => p.id === e.target.value)?.units?.map((u: any) => u.type) || []);
                          }}
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Select Property</option>
                          {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <select
                          value={u?.unitType || ''}
                          onChange={e => { u.unitType = e.target.value; setUnitTypes(unitTypes); }}
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Select Unit Type</option>
                          {unitTypes.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          className="bg-[#03A6A1] text-white font-bold px-2 py-1 rounded hover:bg-[#FFA673] transition"
                          disabled={!u?.propertyId || !u?.unitType}
                          onClick={() => {
                            onAssign([userId], u.propertyId, u.unitType);
                            setSelectedUsers(selectedUsers.filter(id => id !== userId));
                          }}
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button className="bg-gray-300 text-gray-800 rounded px-4 py-2 font-bold" onClick={() => setShowDetails(null)}>Close</button>
          </div>
        </div>
      )}
      {/* User Table - Responsive */}
      <div className="mt-2">
        {/* Assignment UI: Only unassigned tenants */}
        <ResponsiveTableOrCards
          columns={[
            {
              key: 'select',
              label: 'Select',
              render: (u) => (
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u._id)}
                  onChange={e => {
                    setSelectedUsers(e.target.checked
                      ? [...selectedUsers, u._id]
                      : selectedUsers.filter(id => id !== u._id));
                  }}
                  className="w-5 h-5"
                />
              ),
            },
            {
              key: 'name',
              label: 'Name',
              render: (u) => (
                <span
                  className="cursor-pointer text-[#03A6A1] underline"
                  onClick={() => getUserDetails && setShowDetails(u)}
                >
                  {u.firstName} {u.lastName}
                </span>
              ),
            },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'status', label: 'Status', render: (u) => u.status || 'Active' },
            { key: 'propertyName', label: 'Property' },
            { key: 'unitType', label: 'Unit Type' },
            {
              key: 'actions',
              label: 'Actions',
              render: (u) => (
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <select
                    value={rowSelections[u._id]?.propertyId || ''}
                    onChange={e => {
                      const propertyId = e.target.value;
                      const property = properties.find(p => p.id === propertyId);
                      setRowSelections(prev => ({
                        ...prev,
                        [u._id]: {
                          propertyId,
                          unitType: '', // reset unit type when property changes
                        },
                      }));
                    }}
                    className="border rounded px-2 py-1 w-full sm:w-auto"
                  >
                    <option value="">Select Property</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {(() => {
                    const propertyId = rowSelections[u._id]?.propertyId;
                    const property = properties.find(p => p.id === propertyId);
                    const unitTypes = property?.units?.map((u: any) => u.type) || [];
                    return unitTypes.length > 0 ? (
                      <select
                        value={rowSelections[u._id]?.unitType || ''}
                        onChange={e => setRowSelections(prev => ({
                          ...prev,
                          [u._id]: {
                            ...prev[u._id],
                            unitType: e.target.value,
                          },
                        }))}
                        className="border rounded px-2 py-1 w-full sm:w-auto"
                      >
                        <option value="">Select Unit Type</option>
                        {unitTypes.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    ) : null;
                  })()}
                  <button
                    className="bg-[#03A6A1] text-white font-bold px-2 py-1 rounded hover:bg-[#FFA673] transition w-full sm:w-auto"
                    disabled={
                      !rowSelections[u._id]?.propertyId ||
                      ((properties.find(p => p.id === rowSelections[u._id]?.propertyId)?.units?.length || 0) > 0 && !rowSelections[u._id]?.unitType)
                    }
                    onClick={() => onAssign([
                      u._id,
                    ], rowSelections[u._id]?.propertyId, rowSelections[u._id]?.unitType)}
                  >
                    Assign
                  </button>
                  {onResendInvite && <button className="text-[#03A6A1] hover:text-[#FFA673] w-full sm:w-auto" onClick={() => onResendInvite(u._id)}>Resend Invite</button>}
                  <button className="text-[#FFA673] hover:text-red-600 w-full sm:w-auto" onClick={() => onWelcomeMessage && setShowWelcomeModal(u)}>Welcome Msg</button>
                </div>
              ),
            },
          ]}
          data={filteredUsers}
          keyField="_id"
          cardTitle={(u) => `${u.firstName} ${u.lastName}`}
        />
      </div>
      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowDetails(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] relative" style={{ border: '2px solid #03A6A1' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#03A6A1' }}>User Details</h2>
            <pre className="text-xs bg-[#FFF8F0] p-2 rounded mb-4 max-h-64 overflow-auto">{JSON.stringify(showDetails, null, 2)}</pre>
            <button className="bg-[#03A6A1] text-white rounded px-4 py-2 font-bold" onClick={() => setShowDetails(null)}>Close</button>
          </div>
        </div>
      )}
      {/* Welcome Message Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowWelcomeModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] relative" style={{ border: '2px solid #03A6A1' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#03A6A1' }}>Send Welcome Message</h2>
            {(() => {
              const u = showWelcomeModal;
              const row = rowSelections[u._id] || {};
              const property = properties.find(p => p.id === row.propertyId);
              const unitType = row.unitType || '';
              const defaultMsg = `Hi ${u.firstName}, welcome to ${property ? property.name : '[Property]'}${unitType ? `, ${unitType}` : ''}! We're excited to have you as a resident.`;
              const [message, setMessage] = useState(defaultMsg);
              return (
                <>
                  <textarea
                    className="w-full border rounded p-2 mb-4"
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  <button
                    className="bg-[#03A6A1] text-white rounded px-4 py-2 font-bold mr-2"
                    onClick={() => {
                      if (onWelcomeMessage) onWelcomeMessage(u._id, message);
                      setShowWelcomeModal(null);
                    }}
                  >
                    Send
                  </button>
                  <button className="bg-gray-300 text-gray-800 rounded px-4 py-2 font-bold" onClick={() => setShowWelcomeModal(null)}>Cancel</button>
                </>
              );
            })()}
          </div>
        </div>
      )}
      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAuditLog(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] relative" style={{ border: '2px solid #03A6A1' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#03A6A1' }}>Audit Log</h2>
            <pre className="text-xs bg-[#FFF8F0] p-2 rounded mb-4 max-h-64 overflow-auto">Audit log coming soon...</pre>
            <button className="bg-[#03A6A1] text-white rounded px-4 py-2 font-bold" onClick={() => setShowAuditLog(false)}>Close</button>
          </div>
        </div>
      )}
      {loading && <div className="text-gray-500 text-sm mt-2">Loading users...</div>}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default UserAssignmentPanel;

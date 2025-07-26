import React, { useState, useEffect } from 'react';
import ResponsiveTableOrCards from '../common/ResponsiveTableOrCards';

const UserAssignmentPanel = ({
  userType,
  properties,
  fetchUsers,
  onAssign,
  onResendInvite,
  getUserDetails,
  onWelcomeMessage,
}) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [rowSelections, setRowSelections] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState('');
  const [showDetails, setShowDetails] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchUsers().then(setUsers).catch(() => setError('Failed to fetch users')).finally(() => setLoading(false));
  }, [fetchUsers]);

  const unassignedUsers = users.filter(u => !u.property && !u.unitType);
  let filteredUsers = unassignedUsers;
  if (search) {
    filteredUsers = filteredUsers.filter(u =>
      (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.phone && u.phone.toLowerCase().includes(search.toLowerCase()))
    );
  }
  if (statusFilter) filteredUsers = filteredUsers.filter(u => u.status === statusFilter);
  if (propertyFilter) filteredUsers = filteredUsers.filter(u => u.propertyName === propertyFilter);
  if (unitTypeFilter) filteredUsers = filteredUsers.filter(u => u.unitType === unitTypeFilter);

  const propertyOptions = Array.from(new Set(properties.map(p => p.name)));
  const unitTypeOptions = Array.from(new Set(properties.flatMap(p => (p.units ? p.units.map((u) => u.type) : []))));
  const statusOptions = ['Active', 'Pending', 'Deleted', 'Invited'];

  return (
    <div className="mb-6 p-4 bg-[#FFF8F0] rounded-xl border border-[#FFA673]/40">
      <h3 className="font-bold text-[#03A6A1] mb-2">Assign {userType === 'tenant' ? 'Tenant(s)' : 'Caretaker(s)'} to Property</h3>
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
        <button
          className="bg-[#FFA673] text-white font-bold px-4 py-2 rounded hover:bg-[#03A6A1] transition"
          onClick={() => setShowAuditLog(true)}
        >
          View Audit Log
        </button>
      </div>
      <div className="mt-2">
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
                      setRowSelections(prev => ({
                        ...prev,
                        [u._id]: {
                          propertyId,
                          unitType: '',
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
                    const unitTypes = (properties.find(p => p.id === propertyId)?.units ?? []).map((u) => u.type);
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
      {showDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowDetails(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] relative" style={{ border: '2px solid #03A6A1' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#03A6A1' }}>User Details</h2>
            <pre className="text-xs bg-[#FFF8F0] p-2 rounded mb-4 max-h-64 overflow-auto">{JSON.stringify(showDetails, null, 2)}</pre>
            <button className="bg-[#03A6A1] text-white rounded px-4 py-2 font-bold" onClick={() => setShowDetails(null)}>Close</button>
          </div>
        </div>
      )}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowWelcomeModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] relative" style={{ border: '2px solid #03A6A1' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#03A6A1' }}>Send Welcome Message</h2>
            {(() => {
              const u = showWelcomeModal;
              const row = rowSelections[u._id] || {};
              const propertyName = (() => {
                const propertyObj = properties.find(p => p.id === row.propertyId);
                return propertyObj ? propertyObj.name : '[Property]';
              })();
              const unitType = row.unitType || '';
              const defaultMsg = `Hi ${u.firstName}, welcome to ${propertyName}${unitType ? `, ${unitType}` : ''}! We're excited to have you as a resident.`;
              return (
                <>
                  <textarea
                    className="w-full border rounded p-2 mb-4"
                    rows={4}
                    value={row.message ?? defaultMsg}
                    onChange={e => setRowSelections(prev => ({
                      ...prev,
                      [u._id]: {
                        ...prev[u._id],
                        message: e.target.value,
                      },
                    }))}
                  />
                  <button
                    className="bg-[#03A6A1] text-white rounded px-4 py-2 font-bold mr-2"
                    onClick={() => {
                      if (onWelcomeMessage) onWelcomeMessage(u._id, row.message ?? defaultMsg);
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

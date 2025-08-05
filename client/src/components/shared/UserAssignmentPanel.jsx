import React, { useState, useEffect } from 'react';
// Eye icons for show/hide password
const EyeOpen = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const EyeClosed = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.362-2.7A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
);

const UserAssignmentPanel = ({
  properties,
  onAssignTenant,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedUnitLabel, setSelectedUnitLabel] = useState('');
  const [tenantDetails, setTenantDetails] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    leaseStart: '',
    leaseEnd: '',
    leaseDocument: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get property object
  const property = properties.find(p => (p._id || p.id) === selectedPropertyId);

  // Get floors with at least one vacant unit
  const floorOptions = property && Array.isArray(property.units)
    ? property.units.filter(floorObj => Array.isArray(floorObj.units) && floorObj.units.some(u => u.status === 'vacant'))
    : [];

  // Get vacant units for selected floor
  const unitOptions = property && selectedFloor
    ? (property.units.find(f => f.floor === selectedFloor)?.units.filter(u => u.status === 'vacant') || [])
    : [];

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!selectedPropertyId || !selectedFloor || !selectedUnitLabel) {
      setError('Please select property, floor, and unit.');
      setLoading(false);
      return;
    }
    if (!tenantDetails.firstName || !tenantDetails.lastName || !tenantDetails.username || !tenantDetails.email || !tenantDetails.password) {
      setError('Please fill in all tenant details, username, and password.');
      setLoading(false);
      return;
    }
    if (tenantDetails.password !== tenantDetails.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      // Only send password, not confirmPassword, to backend
      const { confirmPassword, ...tenantPayload } = tenantDetails;
      // Remove leaseStart/leaseEnd if not lease
      if (tenantPayload.leaseType !== 'lease') {
        delete tenantPayload.leaseStart;
        delete tenantPayload.leaseEnd;
      }
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('propertyId', selectedPropertyId);
      formData.append('floor', selectedFloor);
      formData.append('unitLabel', selectedUnitLabel);
      formData.append('unitType', unitOptions.find(u => u.label === selectedUnitLabel)?.type || '');
      Object.entries(tenantPayload).forEach(([key, value]) => {
        if (key === 'leaseDocument' && value) {
          formData.append('leaseDocument', value);
        } else if (value) {
          formData.append(key, value);
        }
      });
      // Do not set Content-Type header for FormData! Let browser handle it.
      await onAssignTenant(formData, true); // true = multipart
      setSuccess('Tenant assigned successfully!');
      setTenantDetails({ firstName: '', lastName: '', email: '', phone: '' });
      setSelectedPropertyId('');
      setSelectedFloor('');
      setSelectedUnitLabel('');
    } catch (err) {
      let msg = 'Failed to add tenant.';
      if (err && err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      } else if (err && err.message) {
        msg = err.message;
      } else if (err && typeof err === 'string') {
        msg = err;
      }
      setError(msg);
      // Also log the error for debugging
      // eslint-disable-next-line no-console
      console.error('Add Tenant Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAssign} className="bg-white p-6 rounded-lg shadow-md max-w-2xl w-full mx-auto flex flex-col gap-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <h2 className="text-xl font-bold mb-2 text-[#03A6A1]">Add Tenant to Property</h2>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <div>
        <label className="block font-semibold mb-1">Property</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedPropertyId}
          onChange={e => {
            setSelectedPropertyId(e.target.value);
            setSelectedFloor('');
            setSelectedUnitLabel('');
          }}
          required
        >
          <option value="">Select Property</option>
          {properties.map(p => (
            <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {selectedPropertyId && (
        <div>
          <label className="block font-semibold mb-1">Select Floor</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedFloor}
            onChange={e => {
              setSelectedFloor(e.target.value);
              setSelectedUnitLabel('');
            }}
            required
          >
            <option value="">Select Floor</option>
            {floorOptions.map(f => (
              <option key={f.floor} value={f.floor}>{f.floor}</option>
            ))}
          </select>
        </div>
      )}
      {selectedPropertyId && selectedFloor && (
        <div>
          <label className="block font-semibold mb-1">Select Room/Unit</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedUnitLabel}
            onChange={e => setSelectedUnitLabel(e.target.value)}
            required
          >
            <option value="">Select Room/Unit</option>
            {unitOptions.map(u => (
              <option key={u.label} value={u.label}>{u.label} ({u.type})</option>
            ))}
          </select>
        </div>
      )}
      {selectedPropertyId && selectedFloor && selectedUnitLabel && (
        <>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-1">First Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={tenantDetails.firstName}
                onChange={e => setTenantDetails({ ...tenantDetails, firstName: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">Last Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={tenantDetails.lastName}
                onChange={e => setTenantDetails({ ...tenantDetails, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Username</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={tenantDetails.username}
              onChange={e => setTenantDetails({ ...tenantDetails, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={tenantDetails.email}
              onChange={e => setTenantDetails({ ...tenantDetails, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={tenantDetails.phone}
              onChange={e => setTenantDetails({ ...tenantDetails, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Lease Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={tenantDetails.leaseType}
              onChange={e => setTenantDetails({ ...tenantDetails, leaseType: e.target.value })}
              required
            >
              <option value="">---Select lease type---</option>
              <option value="lease">Lease (fixed-term)</option>
              <option value="month-to-month">Month-to-Month</option>
            </select>
          </div>
          {tenantDetails.leaseType === 'lease' && (
            <>
              <div>
                <label className="block font-semibold mb-1">Lease Start Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={tenantDetails.leaseStart}
                  onChange={e => setTenantDetails({ ...tenantDetails, leaseStart: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Lease End Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={tenantDetails.leaseEnd}
                  onChange={e => setTenantDetails({ ...tenantDetails, leaseEnd: e.target.value })}
                  required
                />
              </div>
            </>
          )}
          <div className="flex flex-col items-start gap-2">
            <label className="block font-semibold mb-1">Lease Document (PDF/DOCX/Image, optional)</label>
            <label className="rounded-full bg-[#03A6A1] text-white px-4 py-2 cursor-pointer hover:bg-[#FFA673] transition font-bold">
              Upload Lease Document
              <input
                type="file"
                accept=".pdf,.docx,image/*"
                className="hidden"
                onChange={e => setTenantDetails({ ...tenantDetails, leaseDocument: e.target.files[0] })}
              />
            </label>
            {tenantDetails.leaseDocument && (
              <span className="text-xs text-[#03A6A1] mt-1">{tenantDetails.leaseDocument.name}</span>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded px-3 py-2 pr-10"
                value={tenantDetails.password}
                onChange={e => setTenantDetails({ ...tenantDetails, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full border rounded px-3 py-2 pr-10"
                value={tenantDetails.confirmPassword}
                onChange={e => setTenantDetails({ ...tenantDetails, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(v => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
          </div>
        </>
      )}
      <button
        type="submit"
        className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Tenant'}
      </button>
    </form>
  );
};

export default UserAssignmentPanel;

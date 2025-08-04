
import React, { useState, useEffect, Suspense, lazy } from 'react';
import LandlordSidebar from '../sidebars/LandlordSidebar';
import {
  FaHome,
  FaBuilding,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaBalanceScale,
  FaUserTie,
  FaClipboardCheck,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

// --- RecentActivity component ---
function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/landlord/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setActivities(data.activities || []);
      } catch (err) {
        setError('Failed to fetch recent activity.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 col-span-2">
      <div className="font-bold text-lg mb-2 text-[#03A6A1]">Recent Activity</div>
      {loading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && activities.length === 0 && (
        <div className="text-gray-400">No recent activity yet.</div>
      )}
      {!loading && !error && activities.length > 0 && (
        <ul className="divide-y divide-[#FFA673]/30">
          {activities.map((a, idx) => (
            <li key={a._id || idx} className="py-2 text-sm flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#03A6A1]" />
              <span>{a.message}</span>
              <span className="text-gray-400 ml-auto" title={a.createdAt}>{formatTimeAgo(a.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

// --- CollapsibleCaretakerCard for mobile ---
function CollapsibleCaretakerCard({ property, caretakers, selectedCaretaker, setSelectedCaretaker, assigning, setModalInfo, setShowModal, properties, bulkSelected, setBulkSelected }) {
  const [open, setOpen] = useState(false);
  const c = property.caretaker;
  return (
    <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col gap-2 border border-[#FFA673]/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
      <button
        className="flex items-center w-full gap-3 p-2 focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`caretaker-card-${property.id}`}
      >
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#03A6A1]/20 text-[#03A6A1] font-bold text-base shadow-sm">
          {property.name?.[0]}
        </span>
        <span className="flex-1 text-left">
          <span className="text-[#03A6A1] font-bold text-base">{property.name}</span>
          <span className="block text-xs text-gray-500">{property.address}</span>
        </span>
        <span className="text-xs text-[#FFA673] font-semibold">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div id={`caretaker-card-${property.id}`} className="flex flex-col gap-1 text-sm px-2 pb-2">
          <div><span className="font-semibold text-[#FFA673]">Current Caretaker:</span> {c && (c.firstName || c.lastName)
            ? `${c.firstName || ''} ${c.lastName || ''}`.trim()
            : <span className="text-gray-400">None assigned</span>}</div>
          <div><span className="font-semibold text-[#FFA673]">Caretaker Contact:</span> {c ? (<span><span className="font-semibold text-[#03A6A1]">{c.name}</span> <span className="text-xs text-gray-500">({c.email}, {c.phone})</span></span>) : <span className="text-gray-400">N/A</span>}</div>
          <div><span className="font-semibold text-[#FFA673]">Caretaker Workload:</span> {c ? (<span>{properties.filter(p => p.caretaker && p.caretaker._id === c._id).length} propert{properties.filter(p => p.caretaker && p.caretaker._id === c._id).length === 1 ? 'y' : 'ies'}</span>) : <span className="text-gray-400">N/A</span>}</div>
          <div className="flex flex-col gap-2 mt-2">
            <select
              className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-2 py-1 focus:ring-2 focus:ring-[#FFA673]"
              value={selectedCaretaker[property.id] || ''}
              onChange={e => setSelectedCaretaker(s => ({ ...s, [property.id]: e.target.value }))}
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              <option value="">Select caretaker...</option>
              {caretakers.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.isActive ? '' : '(Inactive)'}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded font-bold transition-colors duration-200 w-full ${!selectedCaretaker[property.id] || assigning === property.id ? 'bg-[#FFA673] text-white opacity-60 cursor-not-allowed' : 'bg-[#03A6A1] text-white hover:bg-[#FFA673]'}`}
                disabled={!selectedCaretaker[property.id] || assigning === property.id}
                onClick={() => {
                  setModalInfo({ property, caretaker: caretakers.find(c => c.id === selectedCaretaker[property.id]), action: 'assign' });
                  setShowModal(true);
                }}
              >
                Assign
              </button>
              {property.caretaker && (
                <button
                  className="px-3 py-1 rounded font-bold border border-[#FFA673] text-[#FFA673] bg-white hover:bg-[#FFA673] hover:text-white transition-colors duration-200 w-full"
                  disabled={assigning === property.id}
                  onClick={() => {
                    setModalInfo({ property, action: 'unassign' });
                    setShowModal(true);
                  }}
                >
                  Unassign
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- AssignCaretakerToPropertySection component ---
function AssignCaretakerToPropertySection({ properties, refresh }) {
  const [search, setSearch] = useState('');
  const [caretakers, setCaretakers] = useState([]); // fetched from backend
  const [assigning, setAssigning] = useState(null); // propertyId being assigned
  const [selectedCaretaker, setSelectedCaretaker] = useState({}); // propertyId -> caretakerId
  const [showModal, setShowModal] = useState(false);

  // Close caretaker modal on Escape key
  useEffect(() => {
    if (!showModal) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showModal]);
  const [modalInfo, setModalInfo] = useState({}); // { property, caretaker }
  const [caretakerFilter, setCaretakerFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [bulkSelected, setBulkSelected] = useState([]);
  const [bulkCaretaker, setBulkCaretaker] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  // Fetch caretakers from backend (real API call)
  useEffect(() => {
    const fetchCaretakers = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        if (!token) {
          setCaretakers([]);
          return;
        }
        const res = await fetch(`${apiUrl}/api/caretakers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCaretakers((data.caretakers || []).map(c => ({
          id: c._id,
          name: c.firstName + ' ' + c.lastName,
          email: c.email,
          phone: c.phone,
          isActive: c.isActive,
        })));
      } catch (err) {
        console.error(err);
        // If fetch fails, reset caretakers to empty array
        setCaretakers([]);
      }
    };
    fetchCaretakers();
  }, []);

  // Fetch caretakers from backend
  useEffect(() => {
    const fetchCaretakers = async () => {
      try {
        const token = localStorage.getItem('token');
        // Use absolute URL for dev/prod compatibility
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        if (!token) {
          setCaretakers([]);
          return;
        }
        const res = await fetch(`${apiUrl}/api/caretakers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCaretakers((data.caretakers || []).map(c => ({
          id: c._id,
          name: c.firstName + ' ' + c.lastName,
          email: c.email,
          phone: c.phone,
          isActive: c.isActive,
        })));
      } catch (err) {
        console.error(err);
        // If fetch fails, reset caretakers to empty array
        setCaretakers([]);
      }
    };
    fetchCaretakers();
  }, []);

  // Filter properties
  let filtered = properties;
  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (caretakerFilter) {
    filtered = filtered.filter(p => p.caretaker && p.caretaker._id === caretakerFilter);
  }
  if (sortBy === 'caretakerName') {
    filtered = [...filtered].sort((a, b) => {
      const aName = a.caretaker ? `${a.caretaker.firstName || ''} ${a.caretaker.lastName || ''}`.trim() : '';
      const bName = b.caretaker ? `${b.caretaker.firstName || ''} ${b.caretaker.lastName || ''}`.trim() : '';
      return aName.localeCompare(bName);
    });
  } else if (sortBy === 'workload') {
    filtered = [...filtered].sort((a, b) => {
      const aId = a.caretaker && a.caretaker._id;
      const bId = b.caretaker && b.caretaker._id;
      const aWorkload = aId ? properties.filter(p => p.caretaker && p.caretaker._id === aId).length : 0;
      const bWorkload = bId ? properties.filter(p => p.caretaker && p.caretaker._id === bId).length : 0;
      return bWorkload - aWorkload;
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search properties..."
          className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-[#FFA673]"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ outline: 'none', boxShadow: 'none' }}
        />
        <select
          className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-[#FFA673]"
          value={caretakerFilter}
          onChange={e => setCaretakerFilter(e.target.value)}
        >
          <option value="">All Caretakers</option>
          {caretakers.filter(c => c.isActive).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-[#FFA673]"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="caretakerName">Caretaker Name</option>
          <option value="workload">Caretaker Workload</option>
        </select>
      </div>
            <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="checkbox"
          checked={bulkSelected.length === filtered.length && filtered.length > 0}
          onChange={e => setBulkSelected(e.target.checked ? filtered.map(p => p.id) : [])}
        />
        <span className="text-sm">Select All</span>
        <select
          className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-[#FFA673]"
          value={bulkCaretaker}
          onChange={e => setBulkCaretaker(e.target.value)}
        >
          <option value="">Bulk Assign Caretaker...</option>
          {caretakers.filter(c => c.isActive).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          className="px-4 py-2 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition-colors duration-200"
          disabled={!bulkCaretaker || bulkSelected.length === 0}
          onClick={() => setShowBulkModal(true)}
        >
          Assign Selected
        </button>
      </div>
      {/* Desktop Table */}
      <div className="overflow-x-auto md:block hidden">
        <table className="min-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg">
          <thead>
            <tr className="bg-[#FFF8F0] text-[#03A6A1]">
              <th className="px-4 py-2 text-left"></th>
              <th className="px-4 py-2 text-left">Property</th>
              <th className="px-4 py-2 text-left">Current Caretaker</th>
              <th className="px-4 py-2 text-left">Assign Caretaker</th>
              <th className="px-4 py-2 text-left">Caretaker Contact</th>
              <th className="px-4 py-2 text-left">Caretaker Workload</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(property => (
              <tr key={property.id} className="hover:bg-[#FFE3BB]/60">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={bulkSelected.includes(property.id)}
                    onChange={e => setBulkSelected(sel => e.target.checked ? [...sel, property.id] : sel.filter(id => id !== property.id))}
                  />
                </td>
                <td className="px-4 py-2">{property.name}</td>
                <td className="px-4 py-2">{property.caretaker && (property.caretaker.firstName || property.caretaker.lastName)
                  ? `${property.caretaker.firstName || ''} ${property.caretaker.lastName || ''}`.trim()
                  : <span className="text-gray-400">None assigned</span>}
                </td>
                <td className="px-4 py-2">
                  <select
                    className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-2 py-1 focus:ring-2 focus:ring-[#FFA673]"
                    value={selectedCaretaker[property.id] || ''}
                    onChange={e => setSelectedCaretaker(s => ({ ...s, [property.id]: e.target.value }))}
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    <option value="">Select caretaker...</option>
                    {caretakers.filter(c => c.isActive).map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.isActive ? '' : '(Inactive)'}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 align-top">
                  {/* Caretaker Contact Info - Enhanced Presentation with Profile Quick View */}
                  {(() => {
                    const c = property.caretaker && caretakers.find(c => c.id === property.caretaker._id);
                    if (!c) return <span className="text-gray-400">N/A</span>;
                    return (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-[#03A6A1] flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-[#FFA673]/30 text-[#FFA673] font-bold flex items-center justify-center text-sm mr-1">
                            {c.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                          {c.name}
                          <button
                            className="ml-2 px-2 py-0.5 rounded bg-[#03A6A1]/10 text-[#03A6A1] text-xs font-bold hover:bg-[#03A6A1]/20 focus:outline-none"
                            title="View Profile"
                            onClick={() => setModalInfo({ caretaker: c, action: 'profile' }) || setShowModal(true)}
                          >
                            View Profile
                          </button>
                        </span>
                        <span className="flex items-center gap-1 text-gray-700 text-sm">
                          <span role="img" aria-label="Phone">📞</span> <span>{c.phone}</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-700 text-sm">
                          <span role="img" aria-label="Email">✉️</span> <span>{c.email}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold mt-1 ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-2">
                  {/* Caretaker Workload */}
                  {(() => {
                    const c = property.caretaker && caretakers.find(c => c.id === property.caretaker._id);
                    if (!c) return <span className="text-gray-400">N/A</span>;
                    // Count how many properties this caretaker is assigned to
                    const workload = properties.filter(p => p.caretaker && p.caretaker._id === c.id).length;
                    return <span>{workload} propert{workload === 1 ? 'y' : 'ies'}</span>;
                  })()}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className={`px-3 py-1 rounded font-bold transition-colors duration-200 ${!selectedCaretaker[property.id] || assigning === property.id ? 'bg-[#FFA673] text-white opacity-60 cursor-not-allowed' : 'bg-[#03A6A1] text-white hover:bg-[#FFA673]'}`}
                    disabled={!selectedCaretaker[property.id] || assigning === property.id}
                    onClick={() => {
                      setModalInfo({ property, caretaker: caretakers.find(c => c.id === selectedCaretaker[property.id]), action: 'assign' });
                      setShowModal(true);
                    }}
                  >
                    Assign
                  </button>
                  {property.caretaker && (
                    <button
                      className="px-3 py-1 rounded font-bold border border-[#FFA673] text-[#FFA673] bg-white hover:bg-[#FFA673] hover:text-white transition-colors duration-200"
                      disabled={assigning === property.id}
                      onClick={() => {
                        setModalInfo({ property, action: 'unassign' });
                        setShowModal(true);
                      }}
                    >
                      Unassign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile: Collapsible Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filtered.map(property => (
          <CollapsibleCaretakerCard
            key={property.id}
            property={property}
            caretakers={caretakers}
            selectedCaretaker={selectedCaretaker}
            setSelectedCaretaker={setSelectedCaretaker}
            assigning={assigning}
            setModalInfo={setModalInfo}
            setShowModal={setShowModal}
            properties={properties}
            bulkSelected={bulkSelected}
            setBulkSelected={setBulkSelected}
          />
        ))}
      </div>
      {/* Confirmation Modal */}
            {showBulkModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowBulkModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Bulk Assign Caretaker</h2>
            <p className="mb-4">
              Assign <span className="font-bold text-[#FFA673]">{caretakers.find(c => c.id === bulkCaretaker)?.name}</span> to <span className="font-bold text-[#03A6A1]">{bulkSelected.length}</span> selected propert{bulkSelected.length === 1 ? 'y' : 'ies'}?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded border border-[#FFA673] text-[#FFA673] bg-white font-bold hover:bg-[#FFA673] hover:text-white transition-colors duration-200"
                onClick={() => setShowBulkModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#03A6A1] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition-colors duration-200"
                onClick={async () => {
                  setAssigning('bulk');
                  try {
                    const token = localStorage.getItem('token');
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    for (const propertyId of bulkSelected) {
                      await fetch(`${apiUrl}/api/properties/${propertyId}/assign-caretaker`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ caretakerId: bulkCaretaker }),
                      });
                    }
                    setAssigning(null);
                    setShowBulkModal(false);
                    setBulkSelected([]);
                    setBulkCaretaker('');
                    if (refresh) refresh();
                  } catch (err) {
                    console.log(err);
                    setAssigning(null);
                    setShowBulkModal(false);
                    alert('Error in bulk assignment.');
                  }
                }}
                disabled={assigning === 'bulk'}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 md:p-6 shadow-lg w-full max-w-xs md:max-w-md relative text-sm md:text-base">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl md:text-2xl font-bold" onClick={() => setShowModal(false)}>&times;</button>
            {/* Caretaker Profile Quick View Modal */}
            {modalInfo.action === 'profile' ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Caretaker Profile</h2>
                <div className="flex flex-col items-center gap-2 mb-4">
                  <span className="w-16 h-16 rounded-full bg-[#FFA673]/30 text-[#FFA673] font-bold flex items-center justify-center text-2xl">
                    {modalInfo.caretaker?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                  <span className="font-bold text-lg text-[#03A6A1]">{modalInfo.caretaker?.name}</span>
                  <span className="text-gray-700">{modalInfo.caretaker?.email}</span>
                  <span className="text-gray-700">{modalInfo.caretaker?.phone}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold mt-1 ${modalInfo.caretaker?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{modalInfo.caretaker?.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-[#FFA673]">Assignment History:</span>
                  <ul className="text-gray-600 text-sm mt-1 list-disc pl-5">
                    <li>2024-06-01: Assigned to Property A</li>
                    <li>2024-05-15: Unassigned from Property B</li>
                    <li>2024-05-01: Assigned to Property B</li>
                  </ul>
                  </div>
                <button
                  className="mt-4 px-4 py-2 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition-colors duration-200"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Confirm Assignment</h2>
                <p className="mb-4">
                  Assign <span className="font-bold text-[#FFA673]">{modalInfo.caretaker?.name}</span> to property <span className="font-bold text-[#03A6A1]">{modalInfo.property?.name}</span>?
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    className="px-4 py-2 rounded border border-[#FFA673] text-[#FFA673] bg-white font-bold hover:bg-[#FFA673] hover:text-white transition-colors duration-200"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  {modalInfo.action === 'assign' && (
                    <button
                      className="bg-[#03A6A1] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition-colors duration-200"
                      onClick={async () => {
                        setAssigning(modalInfo.property.id);
                        try {
                          const token = localStorage.getItem('token');
                          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                          // Cleaned: no console.log for assigning caretaker
                          const res = await fetch(`${apiUrl}/api/properties/${modalInfo.property.id}/assign-caretaker`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ caretakerId: modalInfo.caretaker?.id }),
                          });
                          const data = await res.json();
                          // Cleaned: no console.log for assign caretaker response
                          if (!res.ok) {
                          const errData = data;
                          throw new Error(errData.error || 'Failed to assign caretaker.');
                          }
                          setAssigning(null);
                          setShowModal(false);
                          if (refresh) refresh();
                        } catch (err) {
                          setAssigning(null);
                          setShowModal(false);
                          alert('Error assigning caretaker: ' + (err.message || err));
                        }
                      }}
                    >
                      Confirm
                    </button>
                  )}
                  {modalInfo.action === 'unassign' && (
                    <button
                      className="bg-[#FF4F0F] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition-colors duration-200"
                      onClick={async () => {
                        setAssigning(modalInfo.property.id);
                        try {
                          const token = localStorage.getItem('token');
                          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                          const res = await fetch(`${apiUrl}/api/properties/${modalInfo.property.id}/assign-caretaker`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ caretakerId: null }),
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            const errData = data;
                            throw new Error(errData.error || 'Failed to unassign caretaker.');
                          }
                          setAssigning(null);
                          setShowModal(false);
                          if (refresh) refresh();
                        } catch (err) {
                          setAssigning(null);
                          setShowModal(false);
                          alert('Error unassigning caretaker: ' + (err.message || err));
                        }
                      }}
                    >
                      Unassign
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import MobileDashboardView from './MobileDashboardView';
import UserAssignmentPanel from '../shared/UserAssignmentPanel';
import AssignUserToPropertyModal from '../common/AssignUserToPropertyModal';
import FinancialReport from '../financial/FinancialReport';
import OccupancyVacancyStats from '../properties/OccupancyVacancyStats';
import ResponsiveTableOrCards from '../common/ResponsiveTableOrCards';
import CaretakerManagement from '../caretakers/CaretakerManagement';
import CaretakerActions from '../caretakers/actions/CaretakerActions';
import LegalDocuments from '../legal/LegalDocuments';
import CheckListManager from '../checklists/CheckListManager';
import UnassignedTenantSelector from './UnassignedTenantSelector';
const PropertyCreateForm = lazy(() => import('../properties/PropertyCreateForm'));
const PropertyList = lazy(() => import('../properties/PropertyList'));

const AddTenantSection = ({ properties, refresh, onAssignTenant }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        className="fixed right-4 bottom-0 md:bottom-8 md:right-8 z-50 bg-[#03A6A1] text-white font-bold rounded-full shadow-lg hover:bg-[#FFA673] transition text-base md:text-lg px-5 py-2 md:px-6 md:py-4"
        style={{ minWidth: 120, minHeight: 44 }}
        onClick={() => setModalOpen(true)}
        disabled={properties.length === 0}
      >
        + Add Tenant
      </button>
      {properties.length === 0 && (
        <div className="text-red-500 mt-2">No properties available. Please add a property first.</div>
      )}
      {/* Unassigned tenants table below the add tenant button/modal */}
      <div className="mt-8 mb-32 md:mb-8">
        <UnassignedTenantSelector
          properties={properties}
          onAssign={async (tenantId, propertyId, unitType, floor, unitLabel) => {
            // Assign the tenant to the selected property/unit
            const API_URL = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('token');
            try {
              // Update the tenant's property/unit assignment in the backend
              const assignRes = await fetch(`${API_URL}/api/properties/${propertyId}/units/${unitLabel}/assign-tenant`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ tenantId }),
              });
              if (!assignRes.ok) {
                let errMsg = 'Unknown error';
                try {
                  const errData = await assignRes.json();
                  errMsg = errData.error || errMsg;
                } catch (jsonErr) {
                  errMsg = 'Failed to parse error response';
                }
                alert('Failed to assign tenant: ' + errMsg);
                console.error('Assign tenant error:', errMsg);
                return;
              }
              // Refresh data so the tenant is removed from the unassigned list and appears in the assigned table
              if (typeof window !== 'undefined' && window.location) {
                window.location.reload(); // Force a full reload to update all tables immediately
              }
            } catch (err) {
              alert('Failed to assign tenant: ' + (err.message || 'Unknown error'));
              console.error('Assign tenant network error:', err);
            }
          }}
        />
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setModalOpen(false)}>&times;</button>
            <UserAssignmentPanel
              properties={properties}
              onAssignTenant={async (data) => {
                // POST to backend to create tenant
                const API_URL = import.meta.env.VITE_API_URL || '';
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/tenants`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(data),
                });
                if (!res.ok) {
                  let errMsg = 'Unknown error';
                  try {
                    const errData = await res.json();
                    errMsg = errData.error || errMsg;
                  } catch (jsonErr) {
                    errMsg = 'Failed to parse error response';
                    console.log(jsonErr);
                  }
                  throw new Error(errMsg);
                }
                setModalOpen(false);
                refresh();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

import { landlordMenu } from './dashboardConfig';
import StickyNavBar from '../shared/StickyNavBar.jsx';

const sectionTitles = {
  dashboard: 'Landlord Dashboard',
  properties: 'Properties',
  'financial-reports': 'Financial Reports',
  'tenant-statements': 'Tenant Statements',
  'add-tenant': 'Add Tenant to Property',
  'assign-caretaker': 'Assign Caretaker to Property',
  'caretaker-management': 'Caretaker Management',
  'caretaker-actions': 'Caretaker Actions',
  'legal-documents': 'Legal Documents',
  'tenant-checkin': 'Tenant Check-in Docs',
  'monthly-income': 'Monthly Income',
  'occupancy-vacancy': 'Occupancy vs. Vacancy',
  'rent-arrears': 'Rent Arrears',
  profile: 'My Profile',
};

const PropertySection = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshTokenLocal, setRefreshTokenLocal] = useState(Date.now());
  const handleSuccess = () => {
    setShowForm(false);
    setRefreshTokenLocal(Date.now());
  };
  return (
    <div>
      <button
        className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition mb-4 fixed bottom-8 right-8 z-50 shadow-lg"
        onClick={() => setShowForm(true)}
        style={{ minWidth: 160 }}
      >
        + Add Property
      </button>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <Suspense fallback={<div className="text-center p-8">Loading form...</div>}>
              <PropertyCreateForm onSuccess={handleSuccess} onClose={() => setShowForm(false)} />
            </Suspense>
          </div>
        </div>
      )}
      <Suspense fallback={<div className="text-center p-8">Loading properties...</div>}>
        <PropertyList refreshToken={refreshTokenLocal} />
      </Suspense>
    </div>
  );
};

// Quick access links component
function QuickAccessLinks({ onQuickAccess }) {
  const links = [
    { label: 'Add Property', section: 'properties', color: '#03A6A1', icon: <FaBuilding /> },
    { label: 'Add Tenant', section: 'add-tenant', color: '#FFA673', icon: <FaUsers /> },
    { label: 'Assign Caretaker', section: 'assign-caretaker', color: '#23272F', icon: <FaUserTie /> },
    { label: 'View Maintenance', section: 'maintenance', color: '#FF4F0F', icon: <FaClipboardCheck /> },
    { label: 'Financial Reports', section: 'financial-reports', color: '#03A6A1', icon: <FaMoneyBillWave /> },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {links.map(link => (
        <button
          key={link.label}
          onClick={() => onQuickAccess && onQuickAccess(link.section)}
          className="rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform"
          style={{ background: '#FFF', border: `2px solid ${link.color}`, cursor: 'pointer' }}
        >
          <span className="text-2xl mb-1" style={{ color: link.color }}>{link.icon}</span>
          <span className="font-semibold text-gray-700 text-sm">{link.label}</span>
        </button>
      ))}
    </div>
  );
}

// Dashboard overview stats component
function DashboardOverviewStats() {
  const [stats, setStats] = React.useState(null);
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env ? import.meta.env.VITE_API_URL : '';
        const res = await fetch(`${API_URL || ''}/api/landlord/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);
  if (!stats) return <div className="mb-6">Loading overview...</div>;
  const cards = [
    { label: 'Properties', value: stats.properties, color: '#03A6A1' },
    { label: 'Tenants', value: stats.tenants, color: '#FFA673' },
    { label: 'Caretakers', value: stats.caretakers, color: '#23272F' },
    { label: 'Open Maintenance', value: stats.openMaintenance, color: '#FF4F0F' },
    { label: 'Arrears', value: `Ksh ${stats.arrears}`, color: '#FF4F0F' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {cards.map(card => (
        <div key={card.label} className="rounded-xl shadow-lg p-4 flex flex-col items-center" style={{ background: '#FFF', border: `2px solid ${card.color}` }}>
          <div className="text-2xl font-bold mb-1" style={{ color: card.color }}>{card.value}</div>
          <div className="text-sm font-semibold text-gray-700">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

// Personalized welcome message component
function PersonalizedWelcome() {
  let name = 'User';
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        name = user.firstName || user.username || 'User';
      } catch (err) {
        console.error(err);
      }
    }
  }
  return (
    <div style={{ fontWeight: 700, fontSize: 22, color: '#03A6A1', marginBottom: 16 }}>
      Welcome, {name}!
    </div>
  );
}

function LandlordDashboard() {
  // On mount, try to load last selected section from localStorage
  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('landlordSelectedSection');
      if (saved) return saved;
    }
    return 'add-tenant'; // Default to Add Tenant section
  };
  const [selectedSection, setSelectedSection] = useState(getInitialSection());
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProperty, setFilterProperty] = useState('');


  // State for modals
  const [editTenant, setEditTenant] = useState(null);
  const [deactivateTenant, setDeactivateTenant] = useState(null);
  const [drawerTenant, setDrawerTenant] = useState(null);
  // Sidebar expanded state for layout
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Close tenant drawer on Escape key
  useEffect(() => {
    if (!drawerTenant) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setDrawerTenant(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [drawerTenant]);

  // Filtered tenants for display and assignment
  const PAGE_SIZE = 10;
  const [tenantPage, setTenantPage] = useState(1);
  const filteredTenants = tenants
    .filter(t => t.propertyName)
    .filter(t =>
      (!search || t.firstName?.toLowerCase().includes(search.toLowerCase()) || t.lastName?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase()))
      && (!filterStatus || t.status === filterStatus)
      && (!filterProperty || t.propertyName === filterProperty)
    );
  const totalTenantPages = Math.ceil(filteredTenants.length / PAGE_SIZE) || 1;
  const paginatedTenants = filteredTenants.slice((tenantPage - 1) * PAGE_SIZE, tenantPage * PAGE_SIZE);

  // Export to CSV function
  function exportToCSV() {
    const visibleTenants = tenants.filter(t => t.propertyName)
      .filter(t =>
        (!search || t.firstName?.toLowerCase().includes(search.toLowerCase()) || t.lastName?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase()))
        && (!filterStatus || t.status === filterStatus)
        && (!filterProperty || t.propertyName === filterProperty)
      );
    const rows = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Property', 'Unit Type', 'Floor', 'Room/Unit', 'Status'],
      ...visibleTenants.map(t => [
        t.firstName, t.lastName, t.email, t.phone, t.propertyName, t.unitType, t.floor, t.unitLabel, t.status
      ])
    ];
    const csvContent = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tenants.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Placeholder modal components and handlers
  function EditTenantModal({ tenant, onClose, onSave }) {
    // Find the property for this tenant
    const property = properties.find(p => p.name === tenant.propertyName || p.id === tenant.propertyId || (tenant.property && p.id === tenant.property._id));
    // Get all floors and all units/rooms for this property
    const floors = property ? (property.units || []).map(floorObj => floorObj.floor) : [];
    const [form, setForm] = useState({
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phone: tenant.phone,
      floor: tenant.floor || '',
      unitLabel: tenant.unitLabel || '',
    });
    const [success, setSuccess] = useState(false);
    // Get units for selected floor
    const floorObj = property && form.floor ? (property.units || []).find(f => f.floor === form.floor) : null;
    // Only show vacant units or the tenant's current unit
    const availableUnits = floorObj ? (floorObj.units || []).filter(u => u.status === 'vacant' || u.label === tenant.unitLabel) : [];
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose}>&times;</button>
          <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Edit Tenant</h2>
          <form onSubmit={e => { e.preventDefault(); setSuccess(true); setTimeout(() => { setSuccess(false); onSave(form); }, 1000); }} className="flex flex-col gap-3">
            <div>
              <label className="block font-semibold mb-1">First Name</label>
              <input className="border rounded px-3 py-2 w-full" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Last Name</label>
              <input className="border rounded px-3 py-2 w-full" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input className="border rounded px-3 py-2 w-full" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone</label>
              <input className="border rounded px-3 py-2 w-full" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Floor</label>
              <select className="border rounded px-3 py-2 w-full" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value, unitLabel: '' }))} required>
                <option value="">Select Floor</option>
                {floors.map(floor => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Room/Unit</label>
              <select className="border rounded px-3 py-2 w-full" value={form.unitLabel} onChange={e => setForm(f => ({ ...f, unitLabel: e.target.value }))} required disabled={!form.floor}>
                <option value="">Select Room/Unit</option>
                {availableUnits.map(u => (
                  <option key={u.label} value={u.label}>{u.label} ({u.type})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition mt-2">Save</button>
            {success && <div className="text-green-600 text-sm mt-2">Tenant updated successfully!</div>}
          </form>
        </div>
      </div>
    );
  }
  function handleEditTenantSave(updated) {
    setEditTenant(null);
    // TODO: Call backend to update tenant, then refresh
  }
  function DeactivateTenantModal({ tenant, onClose, onConfirm }) {
    const [success, setSuccess] = useState(false);
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose}>&times;</button>
          <h2 className="text-xl font-bold mb-4 text-[#FF4F0F]">Deactivate Tenant</h2>
          <p className="mb-4">Are you sure you want to deactivate <b>{tenant.firstName} {tenant.lastName}</b>? This will mark them as inactive.</p>
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 rounded border border-[#FFA673] text-[#FFA673] bg-white font-bold hover:bg-[#FFA673] hover:text-white transition" onClick={onClose}>Cancel</button>
            <button className="bg-[#FF4F0F] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition" onClick={() => { setSuccess(true); setTimeout(() => { setSuccess(false); onConfirm(tenant); }, 1000); }}>Deactivate</button>
          </div>
          {success && <div className="text-green-600 text-sm mt-4">Tenant deactivated successfully!</div>}
        </div>
      </div>
    );
  }
  function handleDeactivateTenantConfirm(tenant) {
    setDeactivateTenant(null);
    // TODO: Call backend to deactivate tenant, then refresh
  }

  // Save selected section to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('landlordSelectedSection', selectedSection);
    }
    // Scroll to top on section change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSection]);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('token');
        // Fetch properties and tenants in parallel
        const [propRes, tenantRes] = await Promise.all([
          fetch(`${API_URL}/api/properties`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/tenants`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        let propData = await propRes.json();
        let propertyArray = Array.isArray(propData) ? propData : propData.properties || [];
        setProperties(
          propertyArray.map((p) => ({
            id: p._id,
            name: p.name,
            units: p.units || [],
            tenants: p.tenants || [],
            profilePic: p.profilePic,
            profilePicThumb: p.profilePicThumb,
            gallery: p.gallery,
            galleryThumbs: p.galleryThumbs,
            caretaker: p.caretaker, // include caretaker field
          }))
        );
        const tenantData = await tenantRes.json();
        setTenants((tenantData.tenants || []).map((t) => {
          // Find property and unit for assigned tenants
          let floor = '';
          let unitLabel = '';
          if (t.propertyName || (t.property && t.property.name)) {
            const prop = propertyArray.find(
              p => p.name === t.propertyName || p._id === t.propertyId || (t.property && p._id === t.property._id)
            );
            if (prop && prop.units) {
              for (const floorObj of prop.units) {
                if (floorObj.units) {
                  const unit = floorObj.units.find(u => u.label === t.unitLabel || u.label === t.unitLabel || u.tenant === t._id);
                  if (unit) {
                    floor = floorObj.floor;
                    unitLabel = unit.label;
                    break;
                  }
                }
              }
            }
          }
          return {
            id: t._id,
            firstName: t.firstName,
            lastName: t.lastName,
            email: t.email,
            phone: t.phone,
            propertyName: t.propertyName || (t.property && t.property.name) || '',
            unitType: t.unitType || '',
            floor: floor || t.floor || '',
            unitLabel: unitLabel || t.unitLabel || '',
            deleted: t.deleted || false,
            status: t.status || (t.deleted ? 'Deleted' : 'Active'),
          };
        }));
      } catch (err) {
        setProperties([]);
        setTenants([]);
        console.error('Failed to fetch properties or tenants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshToken]);

  const refresh = () => setRefreshToken(t => t + 1);

  // Filters
  // (propertyOptions, unitTypeOptions, statusOptions removed as they are not used)

  // (filteredTenants and related filters removed as they are not used)

  // (fetchUnassignedTenants removed as it is not used)
  const handleBulkAssign = async (userIds, propertyId, unitType) => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/tenants/assign-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userIds, propertyId, unitType }),
    });
    refresh();
  };

  const sectionContent = {
    dashboard: (
      <>
        <PersonalizedWelcome />
        <QuickAccessLinks onQuickAccess={setSelectedSection} />
        <DashboardOverviewStats />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity Feed */}
          <RecentActivity />
          {/* Shortcuts to Reports */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <div className="font-bold text-lg mb-2 text-[#03A6A1]">Quick Reports</div>
            <button className="mb-2 w-full bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition">Download Financial Report</button>
            <button className="mb-2 w-full bg-[#FFA673] text-white font-bold py-2 px-4 rounded hover:bg-[#03A6A1] transition">View Arrears Report</button>
            <button className="w-full bg-[#23272F] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition">Occupancy Report</button>
          </div>
        </div>
        {/* Profile & Settings Quick Access */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#03A6A1]/10 flex items-center justify-center text-3xl text-[#03A6A1] font-bold">L</div>
            <div>
              <div className="font-bold text-lg">Landlord1</div>
              <div className="text-gray-500 text-sm">landlord1@email.com</div>
            </div>
          </div>
          <div className="flex-1 flex flex-col md:flex-row gap-2 md:justify-end">
            <button className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition" onClick={() => setSelectedSection('settings')}>Edit Profile</button>
            <button className="bg-[#FFA673] text-white font-bold py-2 px-4 rounded hover:bg-[#03A6A1] transition" onClick={() => setSelectedSection('settings')}>Settings</button>
          </div>
        </div>
              </>
    ),
    properties: <PropertySection />, 
    'financial-reports': <FinancialReport type="report" />, 
    'tenant-statements': <p>See tenant statements.</p>,
    'add-tenant': (
      <>
        <AddTenantSection properties={properties} refresh={refresh} />
        {/* Table of tenants already linked to properties */}
        <div className="mt-8">
          <h3 className="font-bold text-[#03A6A1] mb-2">Assigned Tenants</h3>
          {/* Search, filter, and pagination controls */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <input
              type="text"
              placeholder="Search tenants..."
              className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-[#FFA673]"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ outline: 'none', boxShadow: 'none' }}
            />
            <select
              className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-[#FFA673]"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Deleted">Deleted</option>
            </select>
            <select
              className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-[#FFA673]"
              value={filterProperty}
              onChange={e => setFilterProperty(e.target.value)}
            >
              <option value="">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <button
              className="ml-auto bg-[#FFA673] text-white font-bold px-4 py-2 rounded hover:bg-[#03A6A1] transition"
              onClick={exportToCSV}
              type="button"
            >
              Export CSV
            </button>
          </div>
          {/* RHS Drawer for tenant details */}
          {drawerTenant && (() => {
            // Use floor and unitLabel directly from tenant document
            const property = properties.find(p => p.name === drawerTenant.propertyName || p.id === drawerTenant.propertyId || (drawerTenant.property && p.id === drawerTenant.property._id));
            return (
            <div className="fixed inset-0 z-50 flex">
              <div className="flex-1" onClick={() => setDrawerTenant(null)} style={{ background: 'rgba(0,0,0,0.2)' }} />
              <div className="w-full sm:w-[400px] max-w-full h-full bg-[#FFF8F0] shadow-2xl p-6 overflow-y-auto animate-slideInRight relative border-l-4 border-[#03A6A1]">
                <button className="absolute top-4 right-4 text-[#FFA673] hover:text-[#03A6A1] text-2xl font-bold" onClick={() => setDrawerTenant(null)}>&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-[#03A6A1]">Tenant Details</h2>
                <div className="flex flex-col items-center mb-4">
                  <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#03A6A1]/10 text-[#03A6A1] font-bold text-3xl shadow mb-2">
                    {drawerTenant.firstName?.[0]}{drawerTenant.lastName?.[0]}
                  </span>
                  <div className="font-bold text-xl text-[#03A6A1] mb-1">{drawerTenant.firstName} {drawerTenant.lastName}</div>
                  <div className="flex flex-col items-center gap-1 w-full">
                    {drawerTenant.email && <div className="text-[#23272F] text-sm">Email: <span className="font-semibold">{drawerTenant.email}</span></div>}
                    {drawerTenant.phone && <div className="text-[#23272F] text-sm">Phone: <span className="font-semibold">{drawerTenant.phone}</span></div>}
                    <div className="text-sm">
                      Status: <span className={`font-semibold px-2 py-1 rounded-full text-xs ml-1 ${drawerTenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{drawerTenant.status || 'Active'}</span>
                    </div>
                  </div>
                </div>
                <hr className="my-4 border-[#FFA673]/40" />
                <div className="mb-4">
                  <div className="font-semibold text-[#FFA673] mb-2 text-lg">Property Assignment</div>
                  <div className="flex flex-col gap-2">
                    {property && <div className="text-[#23272F] text-sm flex items-center">Property: <span className="font-semibold ml-1" title={property.name}>{property.name}</span></div>}
                    <div className="text-[#23272F] text-sm flex items-center">Unit Type: <span className="font-semibold ml-1">{drawerTenant.unitType || '-'}</span></div>
                    <div className="text-[#23272F] text-sm flex items-center">Floor: <span className="font-semibold ml-1">{drawerTenant.floor || '-'}</span></div>
                    <div className="text-[#23272F] text-sm flex items-center">Room/Unit: <span className="font-semibold ml-1">{drawerTenant.unitLabel || '-'}</span></div>
                  </div>
                </div>
              </div>
            </div>
            );
          })()}
          {/* Modals for edit and deactivate */}
          {editTenant && (
            <EditTenantModal
              tenant={editTenant}
              onClose={() => setEditTenant(null)}
              onSave={handleEditTenantSave}
            />
          )}
          {deactivateTenant && (
            <DeactivateTenantModal
              tenant={deactivateTenant}
              onClose={() => setDeactivateTenant(null)}
              onConfirm={handleDeactivateTenantConfirm}
            />
          )}
          {/* Responsive: Table for desktop, cards for mobile */}
          <div className="hidden md:block rounded-lg shadow-lg bg-white/90">
            <table className="min-w-full">
              <thead className="bg-[#03A6A1]/90 text-white sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 text-left rounded-tl-lg">#</th>
                  <th className="py-3 px-4 text-left">Tenant</th>
                  <th className="py-3 px-4 text-left">Contact</th>
                  <th className="py-3 px-4 text-left">Property</th>
                  <th className="py-3 px-4 text-left">Unit Type</th>
                  <th className="py-3 px-4 text-left">Floor</th>
                  <th className="py-3 px-4 text-left">Room/Unit</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTenants.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={`transition-all duration-200 ${idx % 2 === 0 ? 'bg-[#FFF8F0]' : 'bg-white'} hover:shadow-lg hover:scale-[1.01] border-b border-[#FFA673]/20`}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-500">{(tenantPage - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#03A6A1]/20 text-[#03A6A1] font-bold text-base shadow-sm">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </span>
                      <button className="text-[#03A6A1] font-bold underline hover:text-[#FFA673]" onClick={() => setDrawerTenant(u)}>{u.firstName} {u.lastName}</button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <a href={`mailto:${u.email}`} className="flex items-center gap-2 text-[#03A6A1] hover:text-[#FFA673] font-medium" title={u.email}>
                          {/* Envelope icon */}
                          <svg className="w-4 h-4" fill="none" stroke="#03A6A1" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
                          {u.email}
                        </a>
                        <a href={`tel:${u.phone}`} className="flex items-center gap-2 text-[#FFA673] hover:text-[#03A6A1] font-medium" title={u.phone}>
                          {/* Phone icon */}
                          <svg className="w-4 h-4" fill="none" stroke="#FFA673" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V19a2 2 0 01-2 2A19.72 19.72 0 013 5a2 2 0 012-2h2.09a2 2 0 012 1.72c.13.81.36 1.6.7 2.34a2 2 0 01-.45 2.11l-.27.27a16 16 0 006.29 6.29l.27-.27a2 2 0 012.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0122 16.92z"/></svg>
                          {u.phone}
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="group relative cursor-pointer">
                        <span className="hover:underline" title={u.propertyName}>{u.propertyName}</span>
                        <span className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-[#03A6A1] text-white text-xs rounded px-2 py-1 shadow-lg z-20 whitespace-nowrap">{u.propertyName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">{u.unitType}</td>
                    <td className="py-3 px-4">{u.floor || <span className="text-gray-400">-</span>}</td>
                    <td className="py-3 px-4">{u.unitLabel || <span className="text-gray-400">-</span>}</td>
                    <td className="py-3 px-4">
                    <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                    title={u.status === 'Active' ? 'Tenant is active' : 'Tenant is inactive'}
                    >
                    {u.status === 'Active' ? (
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                    ) : (
                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                    )}
                    {u.status || 'Active'}
                    </span>
                    </td>
                    <td className="py-3 px-4">
                    <div className="flex gap-3 items-center">
                    <button
                    title="Deactivate Tenant"
                    className="text-[#FF4F0F] hover:text-[#FFA673] text-lg transition-colors duration-150"
                    onClick={() => setDeactivateTenant(u)}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <button
                    title="Edit Tenant"
                    className="text-[#03A6A1] hover:text-[#FFA673] text-lg transition-colors duration-150"
                    onClick={() => setEditTenant(u)}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" /></svg>
                    </button>
                    </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition disabled:opacity-50"
                onClick={() => setTenantPage(p => Math.max(1, p - 1))}
                disabled={tenantPage === 1}
              >
                Prev
              </button>
              <span className="px-3 py-1 font-semibold text-[#03A6A1]">Page {tenantPage} of {totalTenantPages}</span>
              <button
                className="px-3 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition disabled:opacity-50"
                onClick={() => setTenantPage(p => Math.min(totalTenantPages, p + 1))}
                disabled={tenantPage === totalTenantPages}
              >
                Next
              </button>
            </div>
          </div>
          {/* Mobile: Cards */}
          <div className="md:hidden flex flex-col gap-4">
            {paginatedTenants.map((u, idx) => (
              <div
                key={u.id}
                className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 border border-[#FFA673]/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#03A6A1]/20 text-[#03A6A1] font-bold text-lg shadow-sm">
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </span>
                  <div className="flex-1">
                    <button className="text-[#03A6A1] font-bold underline hover:text-[#FFA673] text-lg" onClick={() => setDrawerTenant(u)}>{u.firstName} {u.lastName}</button>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                    title={u.status === 'Active' ? 'Tenant is active' : 'Tenant is inactive'}
                  >
                    {u.status === 'Active' ? (
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                    ) : (
                      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                    )}
                    {u.status || 'Active'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <div><span className="font-semibold text-[#FFA673]">Phone:</span> {u.phone}</div>
                  <div><span className="font-semibold text-[#FFA673]">Property:</span> <span title={u.propertyName}>{u.propertyName}</span></div>
                  <div><span className="font-semibold text-[#FFA673]">Unit Type:</span> {u.unitType}</div>
                  <div><span className="font-semibold text-[#03A6A1]">Floor:</span> {u.floor || <span className="text-gray-400">-</span>}</div>
                  <div><span className="font-semibold text-[#FFA673]">Room/Unit:</span> {u.unitLabel || <span className="text-gray-400">-</span>}</div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    title="Edit Tenant"
                    className="text-[#03A6A1] hover:text-[#FFA673] text-lg transition-colors duration-150"
                    onClick={() => setEditTenant(u)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" /></svg>
                  </button>
                  <button
                    title="Deactivate Tenant"
                    className="text-[#FF4F0F] hover:text-[#FFA673] text-lg transition-colors duration-150"
                    onClick={() => setDeactivateTenant(u)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition disabled:opacity-50"
                onClick={() => setTenantPage(p => Math.max(1, p - 1))}
                disabled={tenantPage === 1}
              >
                Prev
              </button>
              <span className="px-3 py-1 font-semibold text-[#03A6A1]">Page {tenantPage} of {totalTenantPages}</span>
              <button
                className="px-3 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition disabled:opacity-50"
                onClick={() => setTenantPage(p => Math.min(totalTenantPages, p + 1))}
                disabled={tenantPage === totalTenantPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </>
    ),
    'assign-caretaker': <AssignCaretakerToPropertySection properties={properties} refresh={refresh} />,
    'caretaker-management': <CaretakerManagement />,
    'caretaker-actions': <CaretakerActions />,
    'legal-documents': <LegalDocuments />,
    'tenant-checkin': <CheckListManager />,
    'monthly-income': <FinancialReport type="monthly-income" />, 
    'occupancy-vacancy': <OccupancyVacancyStats />, 
    'rent-arrears': <FinancialReport type="arrears" />, 
    profile: <p>View and edit your profile information.</p>,
    settings: (
      <ProfileSettings />
    ),
  };

  return (
    <>
      <div className="block md:hidden">
        <MobileDashboardView
          menuItems={landlordMenu}
          sectionTitles={sectionTitles}
          sectionContent={sectionContent}
          dashboardLabel="Landlord Dashboard"
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />
      </div>
      <div className="hidden md:flex" style={{ minHeight: '100vh', background: '#FFE3BB' }}>
        <LandlordSidebar onSelect={setSelectedSection} selected={selectedSection} expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
        <main
          className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-16'}`}
          style={{
            padding: 32,
            background: '#FFF8F0',
            minHeight: '100vh',
          }}
        >
          {/* Sticky nav bar for desktop/tablet */}
          <StickyNavBar
            label={selectedSection === 'settings' ? 'Profile & Settings' : (landlordMenu.find(item => item.key === selectedSection)?.label) || (sectionTitles[selectedSection] || 'Landlord Dashboard')}
            icon={landlordMenu.find(item => item.key === selectedSection)?.icon}
          />
          <div style={{ marginTop: 16 }}>
            {sectionContent[selectedSection] || <div style={{ color: '#03A6A1', fontWeight: 600, fontSize: 22, background: '#FFF', padding: '24px', borderRadius: 8, border: '2px solid #03A6A1' }}>Coming soon: {sectionTitles[selectedSection] || 'This section'}</div>}
          </div>
        </main>
      </div>
    </>
  );
}

// Profile & Settings component
function ProfileSettings() {
  const [profile, setProfile] = React.useState(null);
  const [form, setForm] = React.useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env ? import.meta.env.VITE_API_URL : '';
        const res = await fetch(`${API_URL || ''}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data.user);
        setForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        });
      } catch (err) {
        setError('Could not load profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env ? import.meta.env.VITE_API_URL : '';
      const res = await fetch(`${API_URL || ''}/api/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      setSuccess(true);
    } catch (err) {
      setError('Could not save profile.');
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const [pwForm, setPwForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = React.useState(false);
  const [pwSuccess, setPwSuccess] = React.useState(false);
  const [pwError, setPwError] = React.useState('');
  const [showPw, setShowPw] = React.useState({ current: false, new: false, confirm: false });
  if (loading) return <div className="text-gray-500">Loading profile...</div>;

  const handlePwChange = e => {
    setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePwSubmit = async e => {
    e.preventDefault();
    setPwLoading(true);
    setPwError('');
    setPwSuccess(false);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      setPwLoading(false);
      return;
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      setPwError('New password cannot be the same as the current password.');
      setPwLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env ? import.meta.env.VITE_API_URL : '';
      const res = await fetch(`${API_URL || ''}/api/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      if (!res.ok) throw new Error('Failed to change password');
      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError('Could not change password.');
      console.error(err);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl mx-auto">
      <div className="text-2xl font-bold mb-6 text-[#03A6A1]">Profile & Settings</div>
      <form onSubmit={handleSave} className="flex flex-col gap-4 mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
        </div>
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-[#03A6A1] text-white font-bold py-2 px-6 rounded hover:bg-[#FFA673] transition" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          {success && <span className="text-green-600 font-semibold self-center">Profile updated!</span>}
          {error && <span className="text-red-600 font-semibold self-center">{error}</span>}
        </div>
      </form>
      <hr className="my-8" />
      <div className="text-xl font-bold mb-4 text-[#03A6A1]">Change Password</div>
      <form onSubmit={handlePwSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Current Password</label>
          <div className="relative">
            <input name="currentPassword" type={showPw.current ? 'text' : 'password'} value={pwForm.currentPassword} onChange={handlePwChange} className="border rounded px-3 py-2 w-full pr-10" required />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1} onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
              {showPw.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">New Password</label>
          <div className="relative">
            <input name="newPassword" type={showPw.new ? 'text' : 'password'} value={pwForm.newPassword} onChange={handlePwChange} className="border rounded px-3 py-2 w-full pr-10" required />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1} onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}>
              {showPw.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Confirm New Password</label>
          <div className="relative">
            <input name="confirmPassword" type={showPw.confirm ? 'text' : 'password'} value={pwForm.confirmPassword} onChange={handlePwChange} className="border rounded px-3 py-2 w-full pr-10" required />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1} onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
              {showPw.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-[#FFA673] text-white font-bold py-2 px-6 rounded hover:bg-[#03A6A1] transition" disabled={pwLoading}>{pwLoading ? 'Saving...' : 'Change Password'}</button>
          {pwSuccess && <span className="text-green-600 font-semibold self-center">Password updated!</span>}
          {pwError && <span className="text-red-600 font-semibold self-center">{pwError}</span>}
        </div>
      </form>
    </div>
  );
}

export default LandlordDashboard;
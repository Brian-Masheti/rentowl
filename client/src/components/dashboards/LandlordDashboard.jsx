
import React, { useState, useEffect, Suspense, lazy } from 'react';
import LandlordSidebar from '../sidebars/LandlordSidebar';

// --- AssignCaretakerToPropertySection component ---
function AssignCaretakerToPropertySection({ properties, refresh }) {
  const [search, setSearch] = useState('');
  const [caretakers, setCaretakers] = useState([]); // fetched from backend
  const [assigning, setAssigning] = useState(null); // propertyId being assigned
  const [selectedCaretaker, setSelectedCaretaker] = useState({}); // propertyId -> caretakerId
  const [showModal, setShowModal] = useState(false);
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
      <div className="overflow-x-auto">
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
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}>&times;</button>
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
                  <div className="text-gray-400 text-xs mt-1">(Static sample. Connect to backend for real log.)</div>
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
import ResponsiveTableOrCards from '../common/ResponsiveTableOrCards';
import CaretakerManagement from '../caretakers/CaretakerManagement';
import {
  FaHome,
  FaBuilding,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaBalanceScale
} from 'react-icons/fa';

const PropertyCreateForm = lazy(() => import('../properties/PropertyCreateForm'));
const PropertyList = lazy(() => import('../properties/PropertyList'));

const AddTenantSection = ({ properties, refresh }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Handle tenant add/assign
  const handleAddTenant = async (data) => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    console.log('Add Tenant payload:', data);
    const res = await fetch(`${API_URL}/api/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('Add Tenant error:', errData);
      throw new Error(errData.error || 'Failed to add tenant');
    }
    refresh();
  };

  return (
    <>
      <button
        className="fixed bottom-8 right-8 z-50 bg-[#03A6A1] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-[#FFA673] transition text-lg"
        style={{ minWidth: 160 }}
        onClick={() => setModalOpen(true)}
        disabled={properties.length === 0}
      >
        + Add Tenant
      </button>
      {properties.length === 0 && (
        <div className="text-red-500 mt-2">No properties available. Please add a property first.</div>
      )}
      <AssignUserToPropertyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTenant}
        mode="add"
        userType="tenant"
        properties={properties}
        themeColor="#03A6A1"
      />
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

function LandlordDashboard() {
  // On mount, try to load last selected section from localStorage
  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('landlordSelectedSection');
      if (saved) return saved;
    }
    return 'dashboard';
  };
  const [selectedSection, setSelectedSection] = useState(getInitialSection());
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [refreshToken, setRefreshToken] = useState(0);

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
    const fetchData = async () => {
      // setLoading(true); (removed, not used)
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('token');
        // Properties
        const propRes = await fetch(`${API_URL}/api/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        // Tenants
        const tenantRes = await fetch(`${API_URL}/api/tenants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tenantData = await tenantRes.json();
        setTenants((tenantData.tenants || []).map((t) => ({
          id: t._id,
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
          phone: t.phone,
          propertyName: t.propertyName || (t.property && t.property.name) || '',
          unitType: t.unitType || '',
          deleted: t.deleted || false,
          status: t.status || (t.deleted ? 'Deleted' : 'Active'),
        })));
      } catch (err) {
        setProperties([]);
        setTenants([]);
        console.error('Failed to fetch properties or tenants:', err);
      } finally {
        // setLoading(false); (removed, not used)
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
        <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
          Welcome, Landlord! Here you can manage your properties, view financials, and more.
        </p>
      </>
    ),
    properties: <PropertySection />, 
    'financial-reports': <FinancialReport type="report" />, 
    'tenant-statements': <p>See tenant statements.</p>,
    'add-tenant': (
      <>
        <AddTenantSection properties={properties} refresh={refresh} />
        {/* Main tenant table (all tenants) */}
        <UserAssignmentPanel
          userType="tenant"
          properties={properties}
          fetchUsers={async () => {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/tenants`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            return data.tenants || [];
          }}
          onAssign={handleBulkAssign}
        />
        {/* Table of tenants already linked to properties */}
        <div className="mt-8">
          <ResponsiveTableOrCards
            columns={[
              { key: 'firstName', label: 'First Name' },
              { key: 'lastName', label: 'Last Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'propertyName', label: 'Property' },
              { key: 'unitType', label: 'Unit Type' },
              { key: 'status', label: 'Status', render: (u) => u.status || 'Active' },
            ]}
            data={tenants.filter(t => t.propertyName)}
            keyField="id"
            cardTitle={u => `${u.firstName} ${u.lastName}`}
          />
        </div>
      </>
    ),
    'assign-caretaker': <AssignCaretakerToPropertySection properties={properties} refresh={refresh} />,
    'caretaker-management': <CaretakerManagement />,
    'caretaker-actions': <p>View caretaker actions here.</p>,
    'legal-documents': <p>View legal documents here.</p>,
    'tenant-checkin': <p>View tenant check-in documents here.</p>,
    'monthly-income': <FinancialReport type="monthly-income" />, 
    'occupancy-vacancy': <FinancialReport type="occupancy" />, 
    'rent-arrears': <FinancialReport type="arrears" />, 
    profile: <p>View and edit your profile information.</p>,
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
        <LandlordSidebar onSelect={setSelectedSection} selected={selectedSection} />
        <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
          {/* Sticky nav bar for desktop/tablet */}
          <StickyNavBar
            label={(landlordMenu.find(item => item.key === selectedSection)?.label) || (sectionTitles[selectedSection] || 'Landlord Dashboard')}
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

export default LandlordDashboard;

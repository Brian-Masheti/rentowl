import React, { useEffect, useState } from 'react';
import AddCaretakerModal from './AddCaretakerModal';
import EditCaretakerModal from './EditCaretakerModal';
import { FaEdit, FaUserSlash } from 'react-icons/fa';

function DeactivateCaretakerModal({ open, caretaker, onClose, onConfirm }) {
  if (!open || !caretaker) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-[#FF4F0F]">Deactivate Caretaker</h2>
        <p className="mb-4">Are you sure you want to deactivate <b>{caretaker.firstName} {caretaker.lastName}</b>?</p>
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 rounded border border-[#FFA673] text-[#FFA673] bg-white font-bold hover:bg-[#FFA673] hover:text-white transition" onClick={onClose}>Cancel</button>
          <button className="bg-[#FF4F0F] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition" onClick={() => onConfirm(caretaker)}>Deactivate</button>
        </div>
      </div>
    </div>
  );
}

const CaretakerManagement = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCaretaker, setEditCaretaker] = useState(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateCaretaker, setDeactivateCaretaker] = useState(null);

  const fetchCaretakers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/caretakers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCaretakers(data.caretakers || []);
    } catch (err) {
      console.log(err);
      setError('Failed to fetch caretakers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : data.properties || []);
    } catch (err) {
      setProperties([]);
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCaretakers();
    fetchProperties();
  }, []);

  // Helper: get property count for a caretaker
  const getPropertyCount = (caretakerId) => {
    return properties.filter(p => p.caretaker && (p.caretaker._id === caretakerId || p.caretaker === caretakerId)).length;
  };
  // Helper: get property names for a caretaker (optional, for tooltip)
  const getPropertyNames = (caretakerId) => {
    return properties.filter(p => p.caretaker && (p.caretaker._id === caretakerId || p.caretaker === caretakerId)).map(p => p.name).join(', ');
  };

  // Soft delete (deactivate) caretaker
  const handleDeactivate = async (caretaker) => {
    setDeactivateCaretaker(caretaker);
    setDeactivateModalOpen(true);
  };
  const handleDeactivateConfirm = async (caretaker) => {
    setDeactivateModalOpen(false);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${apiUrl}/api/caretakers/${caretaker._id}/deactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      fetchCaretakers();
    } catch (err) {
      alert('Failed to deactivate caretaker.');
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-full flex flex-col items-stretch">
      <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Caretaker Management</h2>
      <button
        className="fixed right-4 bottom-0 md:bottom-8 md:right-8 z-50 bg-[#03A6A1] text-white font-bold rounded-full shadow-lg hover:bg-[#FFA673] transition text-base md:text-lg px-5 py-2 md:px-6 md:py-4"
        style={{ minWidth: 120, minHeight: 44 }}
        onClick={() => setModalOpen(true)}
      >
        + Add Caretaker
      </button>
      <AddCaretakerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchCaretakers}
      />
      <EditCaretakerModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        caretaker={editCaretaker}
        onSuccess={fetchCaretakers}
      />
      <DeactivateCaretakerModal
        open={deactivateModalOpen}
        caretaker={deactivateCaretaker}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleDeactivateConfirm}
      />
      {loading && <div>Loading caretakers...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {/* Desktop Table */}
      {!loading && !error && (
        <div className="w-full">
          <table className="w-full max-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg md:block hidden text-base whitespace-nowrap">
            <thead>
              <tr className="bg-[#FFF8F0] text-[#03A6A1]">
                <th className="px-8 py-4 text-left">Name</th>
                <th className="px-8 py-4 text-left">Email</th>
                <th className="px-8 py-4 text-left">Phone</th>
                <th className="px-8 py-4 text-left">Property</th>
                <th className="px-8 py-4 text-left">Status</th>
                <th className="px-8 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {caretakers.map(c => (
                <tr key={c._id} className="hover:bg-[#FFE3BB]/60 transition-all duration-200">
                  <td className="px-8 py-4 flex items-center gap-4 truncate">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#03A6A1]/20 text-[#03A6A1] font-bold text-lg shadow-sm">
                      {c.firstName?.[0]}{c.lastName?.[0]}
                    </span>
                    <span className="font-semibold text-lg">{c.firstName} {c.lastName}</span>
                  </td>
                  <td className="px-8 py-4 text-base truncate">{c.email}</td>
                  <td className="px-8 py-4 text-base truncate">{c.phone}</td>
                  <td className="px-8 py-4 text-base truncate">
                    <span className="font-semibold text-[#03A6A1]" title={getPropertyNames(c._id)}>
                      {getPropertyCount(c._id)} propert{getPropertyCount(c._id) === 1 ? 'y' : 'ies'}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-8 py-4 flex gap-2 items-center">
                    <button
                      title="Edit Caretaker"
                      className="text-[#03A6A1] hover:text-[#FFA673] text-xl transition-colors duration-150"
                      onClick={() => {
                        setEditCaretaker(c);
                        setEditModalOpen(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      title="Deactivate Caretaker"
                      className="text-[#FF4F0F] hover:text-[#FFA673] text-xl transition-colors duration-150"
                      onClick={() => handleDeactivate(c)}
                    >
                      <FaUserSlash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-4 mt-4">
            {caretakers.map(c => (
              <div key={c._id} className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 border border-[#FFA673]/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#03A6A1]/20 text-[#03A6A1] font-bold text-lg shadow-sm">
                    {c.firstName?.[0]}{c.lastName?.[0]}
                  </span>
                  <div className="flex-1">
                    <div className="text-[#03A6A1] font-bold text-lg">{c.firstName} {c.lastName}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <div><span className="font-semibold text-[#FFA673]">Phone:</span> {c.phone}</div>
                  <div><span className="font-semibold text-[#03A6A1]">Properties:</span> <span title={getPropertyNames(c._id)}>{getPropertyCount(c._id)} propert{getPropertyCount(c._id) === 1 ? 'y' : 'ies'}</span></div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    title="Edit Caretaker"
                    className="text-[#03A6A1] hover:text-[#FFA673] text-lg transition-colors duration-150"
                    onClick={() => {
                      setEditCaretaker(c);
                      setEditModalOpen(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    title="Deactivate Caretaker"
                    className="text-[#FF4F0F] hover:text-[#FFA673] text-lg transition-colors duration-150"
                    onClick={() => handleDeactivate(c)}
                  >
                    <FaUserSlash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaretakerManagement;

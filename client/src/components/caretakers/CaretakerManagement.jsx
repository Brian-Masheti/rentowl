import React, { useEffect, useState } from 'react';
import AddCaretakerModal from './AddCaretakerModal';
import EditCaretakerModal from './EditCaretakerModal';
import DeactivateCaretakerModal from './DeactivateCaretakerModal';
import CaretakerProfileDrawer from './CaretakerProfileDrawer';

const CaretakerManagement = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCaretaker, setEditCaretaker] = useState(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateCaretaker, setDeactivateCaretaker] = useState(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [profileCaretaker, setProfileCaretaker] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [toast, setToast] = useState(null);

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
      
      setError('Failed to fetch caretakers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaretakers();
  }, []);

  // Filter, search, and sort caretakers
  let filtered = caretakers;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(c =>
      c.firstName.toLowerCase().includes(s) ||
      c.lastName.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s)
    );
  }
  if (statusFilter !== 'all') {
    filtered = filtered.filter(c => (statusFilter === 'active' ? c.isActive : !c.isActive));
  }
  if (sort === 'name') {
    filtered = [...filtered].sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
  } else if (sort === 'status') {
    filtered = [...filtered].sort((a, b) => (b.isActive - a.isActive));
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-[#FFA673]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/6 focus:ring-2 focus:ring-[#FFA673]"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="border border-[#03A6A1] focus:border-[#FFA673] rounded px-3 py-2 w-full md:w-1/6 focus:ring-2 focus:ring-[#FFA673]"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>
      <button
        className="fixed bottom-6 right-6 z-50 bg-[#03A6A1] text-white font-bold py-3 px-5 md:py-4 md:px-6 rounded-full shadow-lg hover:bg-[#FFA673] transition text-base md:text-lg"
        style={{ minWidth: 120, minHeight: 48 }}
        onClick={() => setModalOpen(true)}
      >
        + Add Caretaker
      </button>
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-6 py-3 rounded shadow-lg font-bold text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
      )}
      <AddCaretakerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setToast({ type: 'success', message: 'Caretaker added successfully.' });
          setTimeout(() => setToast(null), 3000);
          fetchCaretakers();
        }}
      />
      <EditCaretakerModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        caretaker={editCaretaker}
        onSuccess={() => {
          setToast({ type: 'success', message: 'Caretaker updated successfully.' });
          setTimeout(() => setToast(null), 3000);
          fetchCaretakers();
        }}
      />
      <DeactivateCaretakerModal
        open={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        caretaker={deactivateCaretaker}
        onConfirm={async () => {
          const token = localStorage.getItem('token');
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          try {
            await fetch(`${apiUrl}/api/caretakers/${deactivateCaretaker._id}/deactivate`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            setToast({ type: 'success', message: 'Caretaker deactivated.' });
          } catch (err) {
            setToast({ type: 'error', message: 'Failed to deactivate caretaker.' });
          }
          setTimeout(() => setToast(null), 3000);
          setDeactivateModalOpen(false);
          setDeactivateCaretaker(null);
          fetchCaretakers();
        }}
      />
      <CaretakerProfileDrawer
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        caretaker={profileCaretaker}
      />
      {loading && <div>Loading caretakers...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <>
          {statusFilter !== 'all' && (
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusFilter === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Showing {statusFilter === 'active' ? 'Active' : 'Inactive'} Caretakers</span>
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="text-gray-500 text-center my-8">No caretakers found for this filter.</div>
          ) : (
            <>
              {/* Table for desktop/tablet */}
              <table className="hidden md:table min-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg">
                <thead>
                  <tr className="bg-[#FFF8F0] text-[#03A6A1]">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c._id} className="hover:bg-[#FFE3BB]/60">
                      <td className="px-4 py-2">{c.firstName} {c.lastName}</td>
                      <td className="px-4 py-2">{c.email}</td>
                      <td className="px-4 py-2">{c.phone}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="px-2 py-1 rounded bg-[#FFA673] text-white font-bold hover:bg-[#03A6A1] transition"
                          onClick={() => {
                            setEditCaretaker(c);
                            setEditModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition"
                          onClick={() => {
                            setProfileCaretaker(c);
                            setProfileDrawerOpen(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          className={`px-2 py-1 rounded font-bold transition ${c.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          onClick={async () => {
                            if (c.isActive) {
                              setDeactivateCaretaker(c);
                              setDeactivateModalOpen(true);
                              return;
                            } else {
                              const token = localStorage.getItem('token');
                              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                              await fetch(`${apiUrl}/api/caretakers/${c._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ isActive: true }),
                              });
                              fetchCaretakers();
                            }
                          }}
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Cards for mobile */}
              <div className="md:hidden flex flex-col gap-4">
                {filtered.map((c, idx) => (
                  <div
                    key={c._id}
                    className={`rounded-xl border border-[#FFA673]/30 bg-white shadow p-4 flex flex-col gap-2${idx === filtered.length - 1 ? ' mb-24' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="w-10 h-10 rounded-full bg-[#FFA673]/30 text-[#FFA673] font-bold flex items-center justify-center text-lg">
                        {c.firstName[0]}{c.lastName[0]}
                      </span>
                      <div>
                        <div className="font-bold text-[#03A6A1]">{c.firstName} {c.lastName}</div>
                        <div className="text-gray-700 text-sm">{c.email}</div>
                        <div className="text-gray-700 text-sm">{c.phone}</div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-2 py-1 rounded bg-[#FFA673] text-white font-bold hover:bg-[#03A6A1] transition flex-1"
                        onClick={() => {
                          setEditCaretaker(c);
                          setEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition flex-1"
                        onClick={() => {
                          setProfileCaretaker(c);
                          setProfileDrawerOpen(true);
                        }}
                      >
                        View
                      </button>
                      <button
                        className={`px-2 py-1 rounded font-bold transition flex-1 ${c.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        onClick={async () => {
                          if (c.isActive) {
                            setDeactivateCaretaker(c);
                            setDeactivateModalOpen(true);
                            return;
                          } else {
                            const token = localStorage.getItem('token');
                            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                            await fetch(`${apiUrl}/api/caretakers/${c._id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ isActive: true }),
                            });
                            fetchCaretakers();
                          }
                        }}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CaretakerManagement;

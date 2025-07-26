import React, { useEffect, useState } from 'react';
import AddCaretakerModal from './AddCaretakerModal';
import EditCaretakerModal from './EditCaretakerModal';

const CaretakerManagement = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCaretaker, setEditCaretaker] = useState(null);

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

  useEffect(() => {
    fetchCaretakers();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Caretaker Management</h2>
      <button
        className="fixed bottom-8 right-8 z-50 bg-[#03A6A1] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-[#FFA673] transition text-lg"
        style={{ minWidth: 160 }}
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
      {loading && <div>Loading caretakers...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <table className="min-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg">
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
            {caretakers.map(c => (
              <tr key={c._id} className="hover:bg-[#FFE3BB]/60">
                <td className="px-4 py-2">{c.firstName} {c.lastName}</td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2">{c.phone}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-2">
                  <button
                    className="px-2 py-1 rounded bg-[#FFA673] text-white font-bold hover:bg-[#03A6A1] transition"
                    onClick={() => {
                      setEditCaretaker(c);
                      setEditModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CaretakerManagement;

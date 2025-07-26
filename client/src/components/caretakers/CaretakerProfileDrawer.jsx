import React, { useEffect, useState } from 'react';

const CaretakerProfileDrawer = ({ open, onClose, caretaker }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && caretaker) {
      setLoading(true);
      const fetchAssignments = async () => {
        try {
          const token = localStorage.getItem('token');
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${apiUrl}/api/caretakers/${caretaker._id}/assignments`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setAssignments(data.properties || []);
        } catch (err) {
          setAssignments([]);
        } finally {
          setLoading(false);
        }
      };
      fetchAssignments();
    }
  }, [open, caretaker]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !caretaker) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={onClose}></div>
      {/* Drawer */}
      <div className="w-full max-w-md h-full bg-white shadow-lg p-6 flex flex-col relative animate-slide-in-right">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-[#03A6A1]">Caretaker Profile</h2>
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-12 h-12 rounded-full bg-[#FFA673]/30 text-[#FFA673] font-bold flex items-center justify-center text-xl">
              {caretaker.firstName[0]}{caretaker.lastName[0]}
            </span>
            <div>
              <div className="font-bold text-lg text-[#03A6A1]">{caretaker.firstName} {caretaker.lastName}</div>
              <div className="text-gray-700 text-sm">{caretaker.email}</div>
              <div className="text-gray-700 text-sm">{caretaker.phone}</div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${caretaker.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{caretaker.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-[#FFA673]">Assigned Properties:</span>
          {loading ? (
            <div className="text-gray-500 mt-2">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="text-gray-400 mt-2">No properties assigned.</div>
          ) : (
            <ul className="mt-2 list-disc pl-5 text-gray-700 text-sm">
              {assignments.map(p => (
                <li key={p._id}>
                  <span className="font-bold text-[#03A6A1]">{p.name}</span> <span className="text-gray-500">({p.address})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default CaretakerProfileDrawer;

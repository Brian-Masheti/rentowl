import React, { useEffect, useState } from 'react';
import ChecklistList from './ChecklistList';
import ChecklistSection from './ChecklistSection';

const API_URL = import.meta.env.VITE_API_URL || '';

const LandlordChecklistMenu = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  useEffect(() => {
    const fetchChecklists = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/checklists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setChecklists(data.checklists || []);
      } catch (err) {
        setError('Failed to fetch checklists.');
      } finally {
        setLoading(false);
      }
    };
    fetchChecklists();
  }, []);

  if (selectedChecklist) {
    // Show the detailed checklist section for the selected checklist
    try {
      console.log('LandlordChecklistMenu selectedChecklist:', selectedChecklist);
      return (
        <div>
          <button className="mb-4 bg-[#03A6A1] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673]" onClick={() => setSelectedChecklist(null)}>
            Back to All Checklists
          </button>
          <ChecklistSection
            role="landlord"
            checklist={selectedChecklist}
            canEdit={false}
          />
        </div>
      );
    } catch (err) {
      return <div className="text-red-500">Error rendering checklist: {err.message}</div>;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Move-In/Move-Out Checklists</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ChecklistList checklists={checklists} role="landlord" onView={setSelectedChecklist} />
      )}
    </div>
  );
};

export default LandlordChecklistMenu;

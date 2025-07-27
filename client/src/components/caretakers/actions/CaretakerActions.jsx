import React, { useEffect, useState, useRef } from 'react';
import CaretakerActionsTable from './CaretakerActionsTable';
import CaretakerActionFilters from './CaretakerActionFilters';
import CaretakerActionDetailsModal from './CaretakerActionDetailsModal';
import CaretakerActionsStats from './CaretakerActionsStats';
import { io } from 'socket.io-client';

const CaretakerActions = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [selectedAction, setSelectedAction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({});
  const [exporting, setExporting] = useState(false);
  const socketRef = useRef(null);

  // Fetch actions from backend
  const fetchActions = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters).toString();
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/caretaker-actions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActions(data.actions || []);
      // Calculate stats (optional)
      setStats({
        total: data.actions?.length || 0,
        mostActiveCaretaker: null, // To be calculated
        mostCommonAction: null, // To be calculated
      });
    } catch (err) {
      console.log(err);
      setError('Failed to fetch caretaker actions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions(filters);
    // Enable real-time updates
    socketRef.current = io(
      import.meta.env.VITE_API_URL_NETWORK ||
      import.meta.env.VITE_API_URL ||
      'http://localhost:5000'
    );
    socketRef.current.on('caretakerAction:new', (action) => {
      setActions(prev => [action, ...prev]);
    });
    return () => socketRef.current && socketRef.current.disconnect();
  }, [filters]);

  // Export as CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/caretaker-actions/export/csv?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'caretaker_actions.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
      alert('Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <button
          className="px-4 py-2 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition-colors duration-200"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>
      <CaretakerActionsStats stats={stats} actions={actions} />
      <CaretakerActionFilters filters={filters} setFilters={setFilters} />
      <CaretakerActionsTable
        actions={actions}
        loading={loading}
        error={error}
        onActionClick={action => {
          setSelectedAction(action);
          setShowDetails(true);
        }}
      />
      <CaretakerActionDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        action={selectedAction}
      />
    </div>
  );
};

export default CaretakerActions;

import React, { useEffect, useState } from 'react';

const ACTION_TYPES = [
  { value: '', label: 'All Actions' },
  { value: 'maintenance_update', label: 'Maintenance Update' },
  { value: 'maintenance_resolved', label: 'Maintenance Resolved' },
  { value: 'announcement_sent', label: 'Announcement Sent' },
  { value: 'task_assigned', label: 'Task Assigned' },
  { value: 'task_updated', label: 'Task Updated' },
  { value: 'other', label: 'Other' },
];
const STATUS_TYPES = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
];

const CaretakerActionFilters = ({ filters, setFilters }) => {
  const [caretakers, setCaretakers] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // Fetch caretakers
    const fetchCaretakers = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/caretakers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCaretakers(data.caretakers || []);
      } catch (err) {
        setCaretakers([]);
      }
    };
    // Fetch properties
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        let propertyArray = Array.isArray(data) ? data : data.properties || [];
        setProperties(propertyArray);
      } catch (err) {
        setProperties([]);
      }
    };
    fetchCaretakers();
    fetchProperties();
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-4 items-end">
      <input
        type="text"
        placeholder="Search description..."
        className="border border-[#03A6A1] rounded px-3 py-2 w-full md:w-1/4"
        value={filters.search || ''}
        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
      />
      <select
        className="border border-[#03A6A1] rounded px-3 py-2 w-full md:w-1/6"
        value={filters.caretaker || ''}
        onChange={e => setFilters(f => ({ ...f, caretaker: e.target.value }))}
      >
        <option value="">All Caretakers</option>
        {caretakers.map(c => (
          <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
        ))}
      </select>
      <select
        className="border border-[#03A6A1] rounded px-3 py-2 w-full md:w-1/6"
        value={filters.property || ''}
        onChange={e => setFilters(f => ({ ...f, property: e.target.value }))}
      >
        <option value="">All Properties</option>
        {properties.map(p => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>
      <select
        className="border border-[#03A6A1] rounded px-3 py-2 w-full md:w-1/6"
        value={filters.actionType || ''}
        onChange={e => setFilters(f => ({ ...f, actionType: e.target.value }))}
      >
        {ACTION_TYPES.map(a => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>
      <select
        className="border border-[#03A6A1] rounded px-3 py-2 w-full md:w-1/6"
        value={filters.status || ''}
        onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
      >
        {STATUS_TYPES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Start Date</label>
        <input
          type="date"
          className="border border-[#03A6A1] rounded px-3 py-2"
          value={filters.startDate || ''}
          onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">End Date</label>
        <input
          type="date"
          className="border border-[#03A6A1] rounded px-3 py-2"
          value={filters.endDate || ''}
          onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
        />
      </div>
    </div>
  );
};

export default CaretakerActionFilters;

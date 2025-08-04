import React, { useEffect, useState } from 'react';
import ResponsiveTableOrCards from '../common/ResponsiveTableOrCards';
import FilterBar from '../common/FilterBar';
import ChartCard from '../common/ChartCard';
import EnhancedLineChart from '../common/EnhancedLineChart';
import EnhancedBarChart from '../common/EnhancedBarChart';
import FinancialMobileFilters from './FinancialMobileFilters';
import { FaMoneyBillWave, FaCoins, FaWallet } from 'react-icons/fa';

const TITLES = {
  report: 'Financial Reports',
  'monthly-income': 'Monthly Income',
  arrears: 'Rent Arrears',
  occupancy: 'Occupancy vs. Vacancy',
};

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return 'Kshs 0';
  return `Kshs ${Number(amount).toLocaleString()}`;
};

const FinancialReport = ({ type }) => {
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedProperty, setSelectedProperty] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || '';
        const [propRes, payRes] = await Promise.all([
          fetch(`${API_URL}/api/properties`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/payments`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (!propRes.ok) throw new Error('Failed to fetch properties');
        if (!payRes.ok) throw new Error('Failed to fetch payments');
        const propData = await propRes.json();
        const payData = await payRes.json();
        setProperties(Array.isArray(propData) ? propData : propData.properties || propData || []);
        setPayments(Array.isArray(payData) ? payData : payData.payments || payData || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (type === 'arrears') {
    return (
      <div className="bg-white rounded-lg shadow p-6 min-h-[200px] flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-[#FF4F0F] mb-4">Rent Arrears</div>
        <div className="text-gray-500 text-lg">No arrears data yet. This section is ready for real arrears info.</div>
      </div>
    );
  }

  // Compute per-property financials
  const perProperty = properties.map(property => {
    // Flatten all units from all floors
    const allUnits = (property.units || []).flatMap(floorObj => floorObj.units || []);

    // Expected rent: sum of all unit rents
    const expectedRent = allUnits.reduce((sum, unit) => sum + (unit.rent || 0), 0);

    // Payments for this property
    const propertyPayments = payments.filter(p => p.property === property._id || (p.property && p.property._id === property._id));
    const receivedRent = propertyPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstandingRent = expectedRent - receivedRent;

    // Group units by type for summary
    const unitSummary = [];
    const grouped = {};
    allUnits.forEach(unit => {
      if (!grouped[unit.type]) grouped[unit.type] = { type: unit.type, count: 0, rent: unit.rent };
      grouped[unit.type].count += 1;
    });
    for (const key in grouped) unitSummary.push(grouped[key]);
    return {
      propertyId: property._id,
      propertyName: property.name,
      expectedRent,
      receivedRent,
      outstandingRent,
      unitSummary,
    };
  });

  // Compute summary totals
  const totalExpected = perProperty.reduce((sum, r) => sum + r.expectedRent, 0);
  const totalReceived = perProperty.reduce((sum, r) => sum + r.receivedRent, 0);
  const totalOutstanding = perProperty.reduce((sum, r) => sum + r.outstandingRent, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 min-h-[200px]">
      {/* Mobile Filters */}
      <FinancialMobileFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        propertyOptions={perProperty.map((p) => ({ value: p.propertyId, label: p.propertyName }))}
        selectedProperty={selectedProperty}
        onPropertyChange={setSelectedProperty}
      />
      {/* Desktop Filters */}
      <div className="hidden md:block">
        <FilterBar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          propertyOptions={perProperty.map((p) => ({ value: p.propertyId, label: p.propertyName }))}
          selectedProperty={selectedProperty}
          onPropertyChange={setSelectedProperty}
        />
      </div>
      <div className="flex flex-col gap-4 mb-6 sm:grid sm:grid-cols-2 md:grid-cols-3">
        <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl p-6 flex flex-col items-center w-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <span className="text-[#03A6A1] font-bold text-lg">Total Expected</span>
          <span className="text-2xl font-extrabold text-[#03A6A1]">{formatCurrency(totalExpected)}</span>
        </div>
        <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl p-6 flex flex-col items-center w-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <span className="text-[#FFA673] font-bold text-lg">Total Received</span>
          <span className="text-2xl font-extrabold text-[#FFA673]">{formatCurrency(totalReceived)}</span>
        </div>
        <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl p-6 flex flex-col items-center w-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <span className="text-[#FF4F0F] font-bold text-lg">Total Outstanding</span>
          <span className="text-2xl font-extrabold text-[#FF4F0F]">{formatCurrency(totalOutstanding)}</span>
        </div>
      </div>
      
      {/* Line chart: Monthly Rent Collection Trend */}
      <EnhancedLineChart payments={payments} title="Monthly Rent Collection Trend" />
      {/* Bar plot: Expected vs Received Rent by Property */}
      <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 mb-8">
        <div className="text-center font-bold text-xl mb-4">Expected Receivable Rent</div>
        <div className="w-full h-[20rem] flex items-center justify-center">
          <ChartCard
            title=""
            type="bar"
            data={{
              labels: perProperty.map((p) => p.propertyName),
              datasets: [
                {
                  label: 'Expected',
                  data: perProperty.map((p) => p.expectedRent),
                  backgroundColor: '#03A6A1',
                  barThickness: 40,
                  maxBarThickness: 60,
                },
                {
                  label: 'Received',
                  data: perProperty.map((p) => p.receivedRent),
                  backgroundColor: '#FFA673',
                  barThickness: 40,
                  maxBarThickness: 60,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                title: { display: false }
              },
              layout: { padding: 0 },
              animation: { duration: 300 },
              hover: { mode: 'nearest', intersect: true },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Properties',
                    color: '#23272F',
                    font: { size: 16, weight: 'bold' }
                  },
                  grid: { display: false },
                  ticks: {
                    color: '#23272F',
                    font: { size: 14, weight: 'bold' },
                    align: 'center',
                    maxRotation: 0,
                    minRotation: 0
                  }
                },
                y: {
                  title: {
                  display: true,
                  text: 'Rent',
                  color: '#23272F',
                  font: { size: 16, weight: 'bold' }
                  },
                  grid: { display: false },
                  ticks: {
                    color: '#23272F',
                    font: { size: 14, weight: 'bold' },
                    callback: function(tickValue) {
                      if (typeof tickValue === 'number') {
                        if (tickValue >= 1000000) return (tickValue / 1000000) + 'M';
                        if (tickValue >= 1000) return (tickValue / 1000) + 'k';
                        return tickValue;
                      }
                      return tickValue;
                    }
                  }
                }
              }
            }}
            className="h-full w-full"
          />
        </div>
      </div>
      <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 mt-8">
        <ResponsiveTableOrCards
          columns={[
            { key: 'propertyName', label: '🏢 Property', sortable: true },
            { key: 'expectedRent', label: <span className="flex items-center gap-1"><FaMoneyBillWave className="text-[#03A6A1]" /> Expected</span>, sortable: true, render: (p) => <span className="inline-flex items-center gap-1 font-bold text-[#03A6A1] bg-[#E6F7F7] px-2 py-1 rounded-full"><FaMoneyBillWave />{formatCurrency(p.expectedRent)}</span> },
            { key: 'receivedRent', label: <span className="flex items-center gap-1"><FaCoins className="text-[#FFA673]" /> Received</span>, sortable: true, render: (p) => <span className="inline-flex items-center gap-1 font-bold text-[#FFA673] bg-[#FFF8F0] px-2 py-1 rounded-full"><FaCoins />{formatCurrency(p.receivedRent)}</span> },
            { key: 'outstandingRent', label: <span className="flex items-center gap-1"><FaWallet className="text-[#FF4F0F]" /> Outstanding</span>, sortable: true, render: (p) => <span className="inline-flex items-center gap-1 font-bold text-[#FF4F0F] bg-[#FFF0F0] px-2 py-1 rounded-full"><FaWallet />{formatCurrency(p.outstandingRent)}</span> },
            {
              key: 'unitSummary',
              label: 'Units',
              render: (p) => (
                <ul className="text-xs text-gray-700">
                  {p.unitSummary.map((u, idx) => (
                    <li key={idx} className="mb-1 even:bg-[#FFF8F0] hover:bg-[#FFE3BB]/60 rounded-lg px-2 py-1 transition-colors duration-200">
                      <span className="font-semibold text-[#03A6A1]">{u.type}:</span> {u.count} × <span className="font-semibold text-[#FFA673]">{formatCurrency(u.rent)}</span>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
          data={perProperty}
          keyField="propertyId"
          cardTitle={(p) => (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: p.outstandingRent > 0 ? '#FF4F0F' : '#16a34a' }}></span>
              <span className="font-bold text-[#03A6A1] text-base">{p.propertyName}</span>
            </div>
          )}
          cardContent={(p) => {
            const [showUnits, setShowUnits] = React.useState(false);
            return (
              <div className="flex flex-col gap-2 text-xs md:text-base">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected Rent</span>
                  <span className="text-lg font-extrabold text-[#03A6A1]">{formatCurrency(p.expectedRent)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Received</span>
                  <span className="text-lg font-extrabold text-[#FFA673]">{formatCurrency(p.receivedRent)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outstanding</span>
                  <span className="text-lg font-extrabold text-[#FF4F0F]">{formatCurrency(p.outstandingRent)}</span>
                </div>
                <div className="mt-2">
                  <button
                    className="text-[#03A6A1] underline text-xs font-semibold mb-1"
                    onClick={() => setShowUnits((v) => !v)}
                    aria-expanded={showUnits}
                  >
                    {showUnits ? 'Hide Unit Breakdown' : 'Show Unit Breakdown'}
                  </button>
                  {showUnits && (
                    <ul className="text-sm text-gray-700 ml-2 mt-1">
                      {p.unitSummary.map((u, idx) => (
                        <li key={idx} className="mb-1 even:bg-[#FFF8F0] hover:bg-[#FFE3BB]/60 rounded-lg px-2 py-1 transition-colors duration-200">
                          <span className="font-semibold text-[#03A6A1]">{u.type}:</span> {u.count} × <span className="font-semibold text-[#FFA673]">{formatCurrency(u.rent)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          }}
          stickyHeader={true}
          rowHoverEffect={true}
          accentBar={true}
          responsiveFont={true}
          sortable={true}
        />
      </div>
    </div>
  );
};

export default FinancialReport;

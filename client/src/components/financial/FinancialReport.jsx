import React, { useEffect, useState } from 'react';
import {
  fetchFinancialReports,
  fetchMonthlyIncome,
  fetchRentArrears,
  fetchOccupancyStats,
} from '../../api/financial';
import ResponsiveTableOrCards from '../common/ResponsiveTableOrCards';
import FilterBar from '../common/FilterBar';
import ChartCard from '../common/ChartCard';
import FinancialMobileFilters from './FinancialMobileFilters';

const TITLES = {
  report: 'Financial Reports',
  'monthly-income': 'Monthly Income',
  arrears: 'Rent Arrears',
  occupancy: 'Occupancy vs. Vacancy',
};

const formatCurrency = (amount) => `Kshs ${amount.toLocaleString()}`;

const FinancialReport = ({ type }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedProperty, setSelectedProperty] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    setLoading(true);
    setError(null);
    let fetchFn;
    switch (type) {
      case 'report':
        fetchFn = () => fetchFinancialReports(token);
        break;
      case 'monthly-income':
        fetchFn = () => fetchMonthlyIncome(token);
        break;
      case 'arrears':
        fetchFn = () => fetchRentArrears(token);
        break;
      case 'occupancy':
        fetchFn = () => fetchOccupancyStats(token);
        break;
      default:
        fetchFn = () => Promise.resolve(null);
    }
    fetchFn()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to fetch data'))
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (type === 'report' && data && data.summary && data.perProperty) {
    return (
      <div className="bg-white rounded-lg shadow p-6 min-h-[200px]">
        {/* Mobile Filters */}
        <FinancialMobileFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          propertyOptions={data.perProperty?.map((p) => ({ value: p.propertyId, label: p.propertyName })) || []}
          selectedProperty={selectedProperty}
          onPropertyChange={setSelectedProperty}
        />
        {/* Desktop Filters */}
        <div className="hidden md:block">
          <FilterBar
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            propertyOptions={data.perProperty?.map((p) => ({ value: p.propertyId, label: p.propertyName }))}
            selectedProperty={selectedProperty}
            onPropertyChange={setSelectedProperty}
          />
        </div>
        <div className="flex flex-col gap-4 mb-6 sm:grid sm:grid-cols-2 md:grid-cols-3">
          <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl p-6 flex flex-col items-center w-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <span className="text-[#03A6A1] font-bold text-lg">Total Expected</span>
            <span className="text-2xl font-extrabold text-[#03A6A1]">{formatCurrency(data.summary.totalExpected)}</span>
          </div>
          <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl p-6 flex flex-col items-center w-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <span className="text-[#FFA673] font-bold text-lg">Total Received</span>
            <span className="text-2xl font-extrabold text-[#FFA673]">{formatCurrency(data.summary.totalReceived)}</span>
          </div>
          <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl p-6 flex flex-col items-center w-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <span className="text-[#FF4F0F] font-bold text-lg">Total Outstanding</span>
            <span className="text-2xl font-extrabold text-[#FF4F0F]">{formatCurrency(data.summary.totalOutstanding)}</span>
          </div>
        </div>
        {/* Trends Analytics Card */}
        <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 mb-8">
          <div className="text-center font-bold text-xl mb-4">Monthly Income Trend</div>
          <div className="w-full h-[20rem] flex items-center justify-center">
            <ChartCard
              title=""
              type="line"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                  {
                    label: 'Income',
                    data: [120000, 150000, 130000, 170000, 160000, 180000, 200000, 210000, 190000, 220000, 230000, 250000],
                    borderColor: '#03A6A1',
                    backgroundColor: 'rgba(3,166,161,0.1)',
                    tension: 0.4,
                    pointBackgroundColor: '#03A6A1',
                    pointBorderColor: '#FFF',
                    pointRadius: 5,
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
                animation: { duration: 300 },
                hover: { mode: 'nearest', intersect: true },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Month',
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
                      text: 'Income',
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
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 mb-12">
          <div className="w-full">
            <div className="bg-gradient-to-br from-[#FFF8F0] via-[#FFE3BB]/80 to-[#FFF8F0] border border-[#FFA673]/30 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex flex-col items-center justify-center h-[44rem] w-full min-w-[400px] p-6 overflow-hidden">
              <div className="text-center font-bold text-xl mb-4">Expected vs Received Rent by Property</div>
              <div className="flex-1 flex items-center justify-center w-full h-full">
                <ChartCard
                  title=""
                  type="bar"
                  data={{
                    labels: data.perProperty.map((p) => p.propertyName),
                    datasets: [
                      {
                        label: 'Expected',
                        data: data.perProperty.map((p) => p.expectedRent),
                        backgroundColor: '#03A6A1',
                        barThickness: 60,
                        maxBarThickness: 80,
                      },
                      {
                        label: 'Received',
                        data: data.perProperty.map((p) => p.receivedRent),
                        backgroundColor: '#FFA673',
                        barThickness: 60,
                        maxBarThickness: 80,
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
                  className="h-[32rem] w-full max-w-[90vw] md:max-w-[44rem]"
                />
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="bg-gradient-to-br from-[#FFF8F0] via-[#FFE3BB]/80 to-[#FFF8F0] border border-[#FFA673]/30 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex flex-col items-center justify-center h-[44rem] w-full min-w-[400px] p-6 overflow-hidden">
              <div className="text-center font-bold text-xl mb-4">Expected Rent Distribution by Property</div>
              <div className="flex-1 flex items-center justify-center w-full h-full">
                <ChartCard
                  title=""
                  type="doughnut"
                  data={{
                    labels: data.perProperty.map((p) => p.propertyName),
                    datasets: [
                      {
                        label: 'Expected Rent',
                        data: data.perProperty.map((p) => p.expectedRent),
                        backgroundColor: [
                          '#03A6A1', '#FFA673', '#FF4F0F', '#FFD700', '#8A2BE2', '#20B2AA', '#FF69B4', '#A0522D', '#4682B4', '#32CD32'
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } },
                    maintainAspectRatio: false,
                    animation: { duration: 300 },
                    hover: { mode: 'nearest', intersect: true }
                  }}
                  className="h-[36rem] w-full max-w-[90vw] md:max-w-[44rem]"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <button
            className="bg-[#03A6A1] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#FFA673] focus:outline-none focus:ring-2 focus:ring-[#03A6A1] transition-all duration-300"
            onClick={() => {
              if (!data) return;
              const csv = [
                ['Property', 'Expected Rent', 'Received', 'Outstanding'],
                ...data.perProperty.map((p) => [p.propertyName, p.expectedRent, p.receivedRent, p.outstandingRent])
              ].map(row => row.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'financial_report.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            aria-label="Export CSV"
          >
            Export CSV
          </button>
          <button
            className="bg-[#FFA673] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#03A6A1] focus:outline-none focus:ring-2 focus:ring-[#FFA673] transition-all duration-300"
            onClick={() => window.print()}
            aria-label="Print Report"
          >
            Print
          </button>
        </div>
        <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 mt-8">
          <ResponsiveTableOrCards
            columns={[
              { key: 'propertyName', label: 'Property' },
              { key: 'expectedRent', label: 'Expected Rent', render: (p) => formatCurrency(p.expectedRent) },
              { key: 'receivedRent', label: 'Received', render: (p) => formatCurrency(p.receivedRent) },
              { key: 'outstandingRent', label: 'Outstanding', render: (p) => formatCurrency(p.outstandingRent) },
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
            data={data.perProperty}
            keyField="propertyId"
            cardTitle={(p) => p.propertyName}
            cardContent={(p) => (
              <div className="flex flex-col gap-2">
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
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Units</span>
                  <ul className="text-sm text-gray-700 ml-2 mt-1">
                    {p.unitSummary.map((u, idx) => (
                      <li key={idx} className="mb-1 even:bg-[#FFF8F0] hover:bg-[#FFE3BB]/60 rounded-lg px-2 py-1 transition-colors duration-200">
                        <span className="font-semibold text-[#03A6A1]">{u.type}:</span> {u.count} × <span className="font-semibold text-[#FFA673]">{formatCurrency(u.rent)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 min-h-[200px]">
      {!loading && !error && data && (
        <pre className="text-xs text-gray-700 bg-gray-50 rounded p-2 overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
      )}
      {!loading && !error && !data && <div>No data available.</div>}
    </div>
  );
};

export default FinancialReport;

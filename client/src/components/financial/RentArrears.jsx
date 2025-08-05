import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const RentArrears = () => {
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const tenantsRes = await fetch('/api/tenants', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const paymentsRes = await fetch('/api/payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const propertiesRes = await fetch('/api/properties', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!tenantsRes.ok) throw new Error('Failed to fetch tenants: ' + tenantsRes.status);
        if (!paymentsRes.ok) throw new Error('Failed to fetch payments: ' + paymentsRes.status);
        if (!propertiesRes.ok) throw new Error('Failed to fetch properties: ' + propertiesRes.status);
        const tenantsData = await tenantsRes.json();
        const paymentsData = await paymentsRes.json();
        const propertiesData = await propertiesRes.json();
        setTenants(Array.isArray(tenantsData) ? tenantsData : tenantsData.tenants || []);
        setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData.payments || []);
        setProperties(Array.isArray(propertiesData) ? propertiesData : propertiesData.properties || []);
      } catch (err) {
        setTenants([]);
        setPayments([]);
        setProperties([]);
        // Optionally, set an error state here
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate arrears data from real data
  const arrearsData = payments
    .filter(p => p.status === 'unpaid')
    .map(p => {
      const tenant = tenants.find(t => t._id === p.tenant);
      // Map property name from properties array if needed
      let propertyName = '';
      if (tenant) {
        if (tenant.property && typeof tenant.property === 'object' && tenant.property.name) {
          propertyName = tenant.property.name;
        } else if (tenant.property) {
          const propObj = properties.find(p => String(p._id) === String(tenant.property));
          if (propObj) propertyName = propObj.name;
        } else if (tenant.propertyName) {
          propertyName = tenant.propertyName;
        }
      }
      return {
        tenant: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown',
        contact: tenant ? tenant.phone : '',
        property: propertyName,
        unitType: tenant && tenant.unitType ? tenant.unitType : '',
        floor: tenant && tenant.floor ? tenant.floor : '',
        unitLabel: tenant && tenant.unitLabel ? tenant.unitLabel : '',
        due: p.amount,
        paid: p.amountPaid || 0,
        balance: (p.amount || 0) - (p.amountPaid || 0),
        status: p.status,
        dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '',
      };
    });

  const totalTenants = tenants.length;
  const totalDue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const totalArrears = payments.filter(p => p.status === 'unpaid').reduce((sum, p) => sum + ((p.amount || 0) - (p.amountPaid || 0)), 0);
  const tenantsInArrearsSet = new Set(payments.filter(p => p.status === 'unpaid').map(p => p.tenant));
  const tenantsInArrears = tenantsInArrearsSet.size;
  const tenantsPaidUp = totalTenants - tenantsInArrears;

  // Calculate percentage paid
  const percentPaid = totalDue === 0 ? 0 : (totalPaid / totalDue) * 100;
  const percentTenantsPaid = totalTenants === 0 ? 0 : (tenantsPaidUp / totalTenants) * 100;

  // Dynamic color logic for arrears doughnut
  let doughnutColor = '#ef4444'; // red-500
  if (percentPaid > 80) {
    doughnutColor = '#22c55e'; // green-500
  } else if (percentPaid > 40) {
    doughnutColor = '#f59e42'; // orange-400
  }

  const doughnutData = {
    labels: ['Paid', 'Arrears'],
    datasets: [
      {
        data: [totalPaid, totalArrears],
        backgroundColor: [doughnutColor, '#e5e7eb'], // gray-200 for arrears
        borderWidth: 0,
      },
    ],
  };

  // Dynamic color logic for tenants doughnut
  let tenantsDoughnutColor = '#ef4444'; // red-500
  if (percentTenantsPaid > 70) {
    tenantsDoughnutColor = '#22c55e'; // green-500
  } else if (percentTenantsPaid > 40) {
    tenantsDoughnutColor = '#f59e42'; // orange-400
  }

  const tenantsDoughnutData = {
    labels: ['Paid Up', 'In Arrears'],
    datasets: [
      {
        data: [tenantsPaidUp, tenantsInArrears],
        backgroundColor: [tenantsDoughnutColor, '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Helper for status badge/icon
  const statusBadge = (status) => {
    if (status === 'unpaid') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
          Unpaid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        Paid
      </span>
    );
  };

  if (loading) {
    return <div className="w-full max-w-6xl mx-auto p-4 text-center text-gray-500">Loading...</div>;
  }
  if (!tenants.length || !payments.length) {
    return <div className="w-full max-w-6xl mx-auto p-4 text-center text-red-500">You are not authorized or there is no data. Please log in.</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Summary Cards */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 bg-gradient-to-br from-red-50 to-white rounded-xl shadow p-6 flex flex-col items-center border border-red-100">
          <div className="flex flex-col items-center w-full">
            <div className="w-24 h-24 mb-2 relative">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-red-600">{percentPaid.toFixed(0)}%</span>
                <span className="text-xs text-gray-500">Paid</span>
              </div>
            </div>
            <div className="text-gray-500 text-sm font-medium mb-1 mt-2">Total Arrears</div>
            <div className="text-3xl font-extrabold text-red-600 tracking-tight">KES {totalArrears.toLocaleString()}</div>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <div className="flex flex-col items-center w-full">
            <div className="w-24 h-24 mb-2 relative">
              <Doughnut data={tenantsDoughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-blue-600">{percentTenantsPaid.toFixed(0)}%</span>
                <span className="text-xs text-gray-500">Paid Up</span>
              </div>
            </div>
            <div className="text-gray-500 text-sm font-medium mb-1 mt-2">Tenants in Arrears</div>
            <div className="text-3xl font-extrabold text-blue-600 tracking-tight">{tenantsInArrears}</div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tenant</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Property</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Unit Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Floor</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Unit Label</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Due</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Paid</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {arrearsData.map((a, i) => (
              <tr key={i} className={
                `border-b last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`
              }>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{a.tenant}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{a.contact}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{a.property}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{a.unitType}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{a.floor}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{a.unitLabel}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">KES {a.due.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">KES {a.paid.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap font-bold text-red-600">KES {a.balance.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap">{statusBadge(a.status)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{a.dueDate}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded shadow font-semibold transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                    Send Reminder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {arrearsData.map((a, i) => (
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-4 border border-blue-100" key={i}>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Tenant:</span> <span>{a.tenant}</span></div>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Contact:</span> <span>{a.contact}</span></div>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Property/Unit:</span> <span>{a.property}</span></div>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Due:</span> <span>KES {a.due.toLocaleString()}</span></div>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Paid:</span> <span>KES {a.paid.toLocaleString()}</span></div>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Balance:</span> <span className="font-bold text-red-600">KES {a.balance.toLocaleString()}</span></div>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Status:</span> <span>{statusBadge(a.status)}</span></div>
            <div className="flex justify-between mb-2"><span className="font-medium text-gray-700">Due Date:</span> <span>{a.dueDate}</span></div>
            <button className="w-full inline-flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded shadow font-semibold transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              Send Reminder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RentArrears;

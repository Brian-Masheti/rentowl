 import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import GaugeChart from 'react-gauge-chart';
import { FaChevronDown, FaChevronRight, FaUndo, FaPlus } from 'react-icons/fa';
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
  const [expandedTenant, setExpandedTenant] = useState(null);
  const [propertyFilter, setPropertyFilter] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState('');
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);

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
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Group payments by tenant and type (rent/deposit), and ensure all tenants are included
  const tenantMap = {};
  tenants.forEach(tenantObj => {
    const tenantId = tenantObj._id;
    let propertyName = '';
    let unitType = tenantObj.unitType || '';
    let floor = tenantObj.floor || '';
    let unitLabel = tenantObj.unitLabel || '';
    if (tenantObj.property && typeof tenantObj.property === 'object' && tenantObj.property.name) {
      propertyName = tenantObj.property.name;
    } else if (tenantObj.property) {
      const propObj = properties.find(prop => String(prop._id) === String(tenantObj.property));
      if (propObj) propertyName = propObj.name;
    } else if (tenantObj.propertyName) {
      propertyName = tenantObj.propertyName;
    }
    tenantMap[tenantId] = {
      tenantId,
      tenantName: `${tenantObj.firstName} ${tenantObj.lastName}`,
      contact: tenantObj.phone,
      property: propertyName,
      unitType,
      floor,
      unitLabel,
      rent: null,
      deposit: null,
      rentPayments: [],
      depositPayments: [],
    };
  });
  payments.forEach(p => {
    if (!p.tenant) return;
    const tenantId = typeof p.tenant === 'object' ? p.tenant._id : p.tenant;
    if (!tenantMap[tenantId]) return; // Only add to tenants in the list
    if (p.type === 'rent') {
      tenantMap[tenantId].rent = p;
      tenantMap[tenantId].rentPayments.push(p);
    } else if (p.type === 'deposit') {
      tenantMap[tenantId].deposit = p;
      tenantMap[tenantId].depositPayments.push(p);
    }
  });
  let tenantList = Object.values(tenantMap);

  // Apply filters
  if (propertyFilter) {
    tenantList = tenantList.filter(t => t.property === propertyFilter);
  }
  if (unitTypeFilter) {
    tenantList = tenantList.filter(t => t.unitType === unitTypeFilter);
  }

  // Helper for status badge/icon
  const statusBadge = (status) => {
    if (status === 'unpaid' || status === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
          Unpaid
        </span>
      );
    }
    if (status === 'partial') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
          Partial
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
        Paid
      </span>
    );
  };

  // --- SUMMARY CARDS LOGIC ---
  // Only consider rent payments for the rent summary
  const rentPayments = payments.filter(p => p.type === 'rent');
  const totalRentDue = rentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRentPaid = rentPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const percentRentPaid = totalRentDue === 0 ? 0 : (totalRentPaid / totalRentDue) * 100;
  // Dynamic color logic for rent doughnut
  let rentDoughnutColor = '#ef4444'; // red-500
  if (percentRentPaid > 80) {
    rentDoughnutColor = '#22c55e'; // green-500
  } else if (percentRentPaid > 40) {
    rentDoughnutColor = '#f59e42'; // orange-400
  }
  const rentDoughnutData = {
    labels: ['Paid', 'Arrears'],
    datasets: [
      {
        data: totalRentPaid === 0 ? [totalRentDue, 0] : [totalRentPaid, totalRentDue - totalRentPaid],
        backgroundColor: totalRentPaid === 0 ? [rentDoughnutColor, rentDoughnutColor] : [rentDoughnutColor, '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };
  const rentDoughnutOptions = {
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
  // Tenants paid up vs in arrears
  const totalTenants = tenants.length;
  const tenantsInArrearsSet = new Set(rentPayments.filter(p => p.status === 'unpaid' || p.status === 'overdue').map(p => p.tenant && (typeof p.tenant === 'object' ? p.tenant._id : p.tenant)));
  const tenantsInArrears = tenantsInArrearsSet.size;
  const tenantsPaidUp = totalTenants - tenantsInArrears;
  const percentTenantsPaid = totalTenants === 0 ? 0 : (tenantsPaidUp / totalTenants) * 100;
  let tenantsDoughnutColor = '#ef4444';
  if (percentTenantsPaid > 70) {
    tenantsDoughnutColor = '#22c55e';
  } else if (percentTenantsPaid > 40) {
    tenantsDoughnutColor = '#f59e42';
  }
  const tenantsDoughnutData = {
    labels: ['Paid Up', 'In Arrears'],
    datasets: [
      {
        data: tenantsPaidUp === 0 ? [tenantsInArrears, 0] : [tenantsPaidUp, tenantsInArrears],
        backgroundColor: tenantsPaidUp === 0 ? [tenantsDoughnutColor, tenantsDoughnutColor] : [tenantsDoughnutColor, '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };
  const tenantsDoughnutOptions = {
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

  // --- DEPOSIT REFUND GAUGE LOGIC ---
  const depositPayments = payments.filter(p => p.type === 'deposit');
  const totalDepositDue = depositPayments.length;
  const totalDepositRefunded = depositPayments.filter(p => p.status === 'paid').length;
  const percentDepositRefunded = totalDepositDue === 0 ? 0 : totalDepositRefunded / totalDepositDue;
  // Gauge color stops: red (0), orange (0.5), green (1)
  const gaugeColors = ['#ef4444', '#f59e42', '#22c55e'];

  // Get unique property names and unit types for filter dropdowns
  const propertyOptions = Array.from(new Set(properties.map(p => p.name))).filter(Boolean);
  const unitTypeOptions = Array.from(new Set(tenants.map(t => t.unitType))).filter(Boolean);

  if (loading) {
    return <div className="w-full p-4 text-center text-gray-500">Loading...</div>;
  }
  if (!tenants.length || !payments.length) {
    return <div className="w-full p-4 text-center text-red-500">You are not authorized or there is no data. Please log in.</div>;
  }

  return (
    <div className="w-full p-4">
      {/* Floating Add Manual Payment Button */}
      <button
        className="fixed z-50 bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-full font-bold shadow-lg text-base transition-all"
        style={{ background: '#03A6A1', color: 'white', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)' }}
        onClick={() => setShowManualPaymentModal(true)}
      >
        <FaPlus className="text-lg" />
        Add Manual Payment
      </button>
      {/* Manual Payment Modal (theme colors, no black bg) */}
      {showManualPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(3,166,161,0.10)' }}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-2 relative border-2 border-[#03A6A1]">
            <button
              className="absolute top-2 right-2 text-[#03A6A1] hover:text-red-600 text-xl font-bold"
              onClick={() => setShowManualPaymentModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#03A6A1' }}>Add Manual Payment</h2>
            <div className="text-gray-500 text-sm">(Modal content to be implemented...)</div>
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Property</label>
          <select
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={propertyFilter}
            onChange={e => setPropertyFilter(e.target.value)}
          >
            <option value="">All Properties</option>
            {propertyOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Unit Type</label>
          <select
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={unitTypeFilter}
            onChange={e => setUnitTypeFilter(e.target.value)}
          >
            <option value="">All Unit Types</option>
            {unitTypeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 bg-gradient-to-br from-red-50 to-white rounded-xl shadow p-6 flex flex-col items-center border border-red-100">
          <div className="flex flex-col items-center w-full">
            <div className="w-36 h-36 mb-2 relative">
              <Doughnut data={rentDoughnutData} options={rentDoughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold" style={{ color: rentDoughnutColor }}>{percentRentPaid.toFixed(0)}%</span>
                <span className="text-base font-semibold" style={{ color: rentDoughnutColor, opacity: 0.85 }}>Rent Paid</span>
              </div>
            </div>
            <div className="text-gray-500 text-sm font-medium mb-1 mt-2">Total Rent Arrears</div>
            <div className="text-3xl font-extrabold" style={{ color: rentDoughnutColor }}>KES {(totalRentDue - totalRentPaid).toLocaleString()}</div>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <div className="flex flex-col items-center w-full">
            <div className="w-36 h-36 mb-2 relative">
              <Doughnut data={tenantsDoughnutData} options={tenantsDoughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold" style={{ color: tenantsDoughnutColor }}>{percentTenantsPaid.toFixed(0)}%</span>
                <span className="text-base font-semibold" style={{ color: tenantsDoughnutColor, opacity: 0.85 }}>Paid Up</span>
              </div>
            </div>
            <div className="text-gray-500 text-sm font-medium mb-1 mt-2">Tenants in Arrears</div>
            <div className="text-3xl font-extrabold" style={{ color: tenantsDoughnutColor }}>{tenantsInArrears}</div>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow p-6 flex flex-col items-center border border-yellow-200">
          <div className="flex flex-col items-center w-full">
            <div className="w-36 h-36 mb-2 flex items-center justify-center">
              <GaugeChart
                id="deposit-gauge"
                nrOfLevels={30}
                percent={percentDepositRefunded}
                colors={gaugeColors}
                arcWidth={0.25}
                textColor="#b45309"
                needleColor="#b45309"
                animate={false}
                style={{ width: '100%', maxWidth: 180 }}
                formatTextValue={value => `${Math.round(value)}%`}
              />
            </div>
            <div className="text-yellow-800 text-base font-semibold mb-1 mt-2">Deposit Refund Progress</div>
            <div className="text-yellow-700 text-sm font-medium mb-1">{totalDepositRefunded} of {totalDepositDue} refunded</div>
          </div>
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tenant</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Property</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Floor</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Unit Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Unit/Room</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rent</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Deposit</th>
            </tr>
          </thead>
          <tbody>
            {tenantList.map((tenant, i) => (
              <React.Fragment key={tenant.tenantId}>
                <tr
                  className={`border-b last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150 cursor-pointer`}
                  onClick={() => setExpandedTenant(expandedTenant === tenant.tenantId ? null : tenant.tenantId)}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                    {expandedTenant === tenant.tenantId ? <FaChevronDown /> : <FaChevronRight />}
                    {tenant.tenantName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{tenant.property}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{tenant.floor || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{tenant.unitType || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{tenant.unitLabel || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {tenant.rent ? (
                      <>
                        <span>KES {tenant.rent.amount?.toLocaleString()}</span>
                        <span className="ml-2">{statusBadge(tenant.rent.status)}</span>
                      </>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {tenant.deposit ? (
                      <>
                        <span>KES {tenant.deposit.amount?.toLocaleString()}</span>
                        <span className="ml-2 flex items-center gap-1">
                          {statusBadge(tenant.deposit.status)}
                          <span className="ml-1 inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-semibold"><FaUndo className="inline-block" /> Refundable</span>
                        </span>
                      </>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                </tr>
                {expandedTenant === tenant.tenantId && (
                  <tr className="bg-blue-50">
                    <td colSpan={3} className="px-4 py-2">
                      <div className="flex flex-col gap-4">
                        {/* Rent Details */}
                        {tenant.rentPayments.length > 0 && (
                          <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                            <div className="font-semibold text-blue-800 mb-2">Rent Details</div>
                            {tenant.rentPayments.map((p, j) => (
                              <div key={j} className="flex flex-wrap gap-4 items-center border-b last:border-b-0 pb-2">
                                <span className="font-semibold text-gray-700">Due:</span> KES {p.amount?.toLocaleString()}
                                <span className="font-semibold text-gray-700">Paid:</span> KES {p.amountPaid?.toLocaleString()}
                                <span className="font-semibold text-gray-700">Balance:</span> <span className="font-bold text-red-600">KES {(p.amount - (p.amountPaid || 0)).toLocaleString()}</span>
                                <span className="font-semibold text-gray-700">Status:</span> {statusBadge(p.status)}
                                <span className="font-semibold text-gray-700">Due Date:</span> {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : ''}
                                <span className="font-semibold text-gray-700">Paid On:</span> {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : (p.updatedAt ? new Date(p.updatedAt).toLocaleString() : (p.createdAt ? new Date(p.createdAt).toLocaleString() : ''))}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Deposit Details */}
                        {tenant.depositPayments.length > 0 && (
                          <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                            <div className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">Deposit Details <FaUndo className="inline-block text-blue-700" title="Refundable" /></div>
                            {tenant.depositPayments.map((p, j) => (
                              <div key={j} className="flex flex-wrap gap-4 items-center border-b last:border-b-0 pb-2">
                                <span className="font-semibold text-gray-700">Due:</span> KES {p.amount?.toLocaleString()}
                                <span className="font-semibold text-gray-700">Paid:</span> KES {p.amountPaid?.toLocaleString()}
                                <span className="font-semibold text-gray-700">Balance:</span> <span className="font-bold text-red-600">KES {(p.amount - (p.amountPaid || 0)).toLocaleString()}</span>
                                <span className="font-semibold text-gray-700">Status:</span> {statusBadge(p.status)}
                                <span className="font-semibold text-gray-700">Due Date:</span> {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : ''}
                                <span className="font-semibold text-gray-700">Paid On:</span> {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : (p.updatedAt ? new Date(p.updatedAt).toLocaleString() : (p.createdAt ? new Date(p.createdAt).toLocaleString() : ''))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {tenantList.map((tenant, i) => (
          <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-100" key={tenant.tenantId}>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Tenant:</span> <span>{tenant.tenantName}</span></div>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Contact:</span> <span>{tenant.contact}</span></div>
            <div className="flex justify-between mb-1"><span className="font-medium text-gray-700">Property/Unit:</span> <span>{tenant.property}</span></div>
            {/* Rent Section */}
            {tenant.rentPayments.length > 0 && (
              <div className="mt-3 mb-2 p-3 rounded-lg border border-blue-200 bg-blue-50">
                <div className="font-semibold text-blue-800 mb-2">Rent Details</div>
                {tenant.rentPayments.map((p, j) => (
                  <div key={j} className="mb-2 flex flex-col gap-1">
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Due:</span> <span>KES {p.amount?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Paid:</span> <span>KES {p.amountPaid?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Balance:</span> <span className="font-bold text-red-600">KES {(p.amount - (p.amountPaid || 0)).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Status:</span> <span>{statusBadge(p.status)}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Due Date:</span> <span>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : ''}</span></div>
                  </div>
                ))}
              </div>
            )}
            {/* Deposit Section */}
            {tenant.depositPayments.length > 0 && (
              <div className="mb-2 p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                <div className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">Deposit Details <FaUndo className="inline-block text-blue-700" title="Refundable" /></div>
                {tenant.depositPayments.map((p, j) => (
                  <div key={j} className="mb-2 flex flex-col gap-1">
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Due:</span> <span>KES {p.amount?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Paid:</span> <span>KES {p.amountPaid?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Balance:</span> <span className="font-bold text-red-600">KES {(p.amount - (p.amountPaid || 0)).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Status:</span> <span>{statusBadge(p.status)}</span></div>
                    <div className="flex justify-between"><span className="font-medium text-gray-700">Due Date:</span> <span>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : ''}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Manual Payment Modal (theme colors, no black bg) */}
      {showManualPaymentModal && (
        <ModalManualPayment
          onClose={() => setShowManualPaymentModal(false)}
          properties={properties}
          tenants={tenants}
          payments={payments}
          onPaymentSuccess={async () => {
            // Re-fetch data after a successful manual payment
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
              console.error('Error fetching data:', err);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}

function ModalManualPayment({ onClose, properties, tenants, payments = [], onPaymentSuccess }) {
  const [modalProperty, setModalProperty] = React.useState('');
  const [modalFloor, setModalFloor] = React.useState('');
  const [modalTenant, setModalTenant] = React.useState('');
  // Outstanding deposit/rent for selected tenant
  const [applyDeposit, setApplyDeposit] = React.useState(false);
  const [splitSummary, setSplitSummary] = React.useState(null);
  const [paymentAmount, setPaymentAmount] = React.useState('');
  // Remove paymentCategory radio, use a checkbox for "Apply to deposit (if due)"
  // Outstanding deposit/rent for selected tenant
  // const [applyDeposit, setApplyDeposit] = React.useState(false);
  // Find selected tenant FIRST so it can be used below
  const selectedTenant = tenants.find(t => t._id === modalTenant);
  // Calculate outstanding deposit and rent for selected tenant
  const depositPayment = selectedTenant
    ? payments.find(p => (p.tenant === selectedTenant._id || (typeof p.tenant === 'object' && p.tenant?._id === selectedTenant._id)) && p.type === 'deposit' && (p.status === 'unpaid' || p.status === 'partial'))
    : null;
  const outstandingDeposit = depositPayment
    ? (depositPayment.amount || 0) - (depositPayment.amountPaid || 0)
    : 0;
  const rentPayment = selectedTenant
    ? payments.find(p => (p.tenant === selectedTenant._id || (typeof p.tenant === 'object' && p.tenant?._id === selectedTenant._id)) && p.type === 'rent' && (p.status === 'unpaid' || p.status === 'partial'))
    : null;
  const outstandingRent = rentPayment
    ? (rentPayment.amount || 0) - (rentPayment.amountPaid || 0)
    : 0;
  // Payment split preview
  // const [splitSummary, setSplitSummary] = React.useState(null);
  // Calculate split summary on amount/applyDeposit change
  React.useEffect(() => {
    if (!selectedTenant || !paymentAmount) {
      setSplitSummary(null);
      return;
    }
    let remaining = Number(paymentAmount);
    let depositPaid = 0, rentPaid = 0;
    let depositDue = applyDeposit ? outstandingDeposit : 0;
    let rentDue = outstandingRent;
    if (applyDeposit && depositDue > 0 && remaining > 0) {
      const payDeposit = Math.min(remaining, depositDue);
      depositPaid = payDeposit;
      remaining -= payDeposit;
    }
    if (rentDue > 0 && remaining > 0) {
      const payRent = Math.min(remaining, rentDue);
      rentPaid = payRent;
      remaining -= payRent;
    }
    setSplitSummary({
      depositPaid,
      rentPaid,
      depositRemaining: depositDue - depositPaid,
      rentRemaining: rentDue - rentPaid
    });
  }, [selectedTenant, paymentAmount, applyDeposit, outstandingDeposit, outstandingRent]);

  // Filter logic
  const modalPropertyObj = properties.find(p => p._id === modalProperty);
  const modalFloors = modalPropertyObj && Array.isArray(modalPropertyObj.units)
    ? Array.from(new Set(modalPropertyObj.units.map(u => u.floor).filter(Boolean)))
    : [];
  // Only show tenants with outstanding rent or deposit
  const modalTenants = tenants.filter(t => {
    const propId = typeof t.property === 'object' && t.property ? t.property._id : t.property;
    if (propId !== modalProperty) return false;
    if (modalFloor && t.floor !== modalFloor) return false;
    // Find any unpaid/partial rent or deposit payment
    const tid = t._id;
    const hasOutstanding = payments.some(
      p => (p.tenant === tid || (typeof p.tenant === 'object' && p.tenant?._id === tid)) &&
        (p.status === 'unpaid' || p.status === 'partial') &&
        (p.type === 'rent' || p.type === 'deposit')
    );
    return hasOutstanding;
  });
  // DEBUG: Log selectedTenant to diagnose rent field issue
  if (selectedTenant) {
  // eslint-disable-next-line no-console
  console.log('DEBUG selectedTenant:', selectedTenant);
  }
  // Always fetch rental amount directly from selectedTenant.rent
  // Accept both numbers and numeric strings
  const rentalAmount = selectedTenant && !isNaN(Number(selectedTenant.rent)) ? Number(selectedTenant.rent) : '';
  // Payment type and amount state
  const [paymentType, setPaymentType] = React.useState('full');
  const [amount, setAmount] = React.useState('');
  // Autofill amount for full payment
  React.useEffect(() => {
    if (paymentType === 'full' && rentalAmount) {
      setAmount(rentalAmount);
    }
  }, [paymentType, rentalAmount]);

  // Close on Esc
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && modalProperty && modalFloor && modalTenant) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, modalProperty, modalFloor, modalTenant]);

  // Close on click outside
  const overlayRef = React.useRef();
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add debug log for manual payment submission
      console.log('Submitting manual payment:', {
        modalProperty, modalFloor, modalTenant, paymentType, paymentAmount, applyDeposit
      });
      // Send the total payment amount and applyDeposit flag to the backend
      const token = localStorage.getItem('token');
      await fetch(`/api/payments/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tenantId: modalTenant,
          propertyId: modalProperty,
          amount: paymentAmount,
          applyDeposit
        }),
      });
      // If you have an onPaymentSuccess prop, call it
      if (typeof onPaymentSuccess === 'function') {
        await onPaymentSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Manual payment error:', err);
      alert('Failed to record manual payment. See console for details.');
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(3,166,161,0.10)' }}
      onClick={handleOverlayClick}
    >
      <form
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-2 relative border-2 border-[#03A6A1]"
        onSubmit={handleSubmit}
      >
        <button
          className="absolute top-2 right-2 text-[#03A6A1] hover:text-red-600 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#03A6A1' }}>Add Manual Payment</h2>
        <div className="flex flex-col gap-4">
          {/* Property Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Property</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={modalProperty}
              onChange={e => {
                setModalProperty(e.target.value);
                setModalFloor('');
                setModalTenant('');
              }}
              required
            >
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          {/* Floor Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Floor</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={modalFloor}
              onChange={e => {
                setModalFloor(e.target.value);
                setModalTenant('');
              }}
              disabled={!modalProperty}
              required
            >
              <option value="">{modalProperty ? 'All Floors' : 'Select Property First'}</option>
              {modalFloors.map(floor => (
                <option key={floor} value={floor}>{floor}</option>
              ))}
            </select>
          </div>
          {/* Tenant Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tenant</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={modalTenant}
              onChange={e => setModalTenant(e.target.value)}
              disabled={!modalProperty}
              required
            >
              <option value="">{modalProperty ? 'Select Tenant' : 'Select Property First'}</option>
              {modalTenants.map(t => (
                <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
          </div>
          {/* Unit/Room, Unit Type, and Rental Amount Display */}
          {selectedTenant && (
            <>
              <div className="mt-2 p-2 rounded bg-[#03A6A1]/10 border border-[#03A6A1] text-[#03A6A1] font-semibold flex flex-col gap-1">
                <div>Floor: {selectedTenant.floor || 'N/A'}</div>
                <div>Unit/Room: {selectedTenant.unitLabel || 'N/A'}</div>
                <div>Unit Type: {selectedTenant.unitType || 'N/A'}</div>
                <div>Rental Amount: {rentalAmount ? `KES ${rentalAmount.toLocaleString()}` : 'N/A'}</div>
              </div>
              {/* Apply to deposit/rent (if due) Checkboxes */}
              <div className="flex flex-col gap-2 mt-4 mb-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyDeposit}
                      onChange={e => setApplyDeposit(e.target.checked)}
                      className="accent-[#03A6A1]"
                      disabled={outstandingDeposit <= 0}
                    />
                    <span className="text-sm font-semibold text-[#03A6A1]">Apply to deposit (if due)</span>
                  </label>
                  {outstandingDeposit > 0 && (
                    <span className="text-xs text-yellow-700">Outstanding deposit: KES {outstandingDeposit.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outstandingRent > 0}
                      readOnly
                      className="accent-[#03A6A1]"
                      disabled={outstandingRent <= 0}
                    />
                    <span className="text-sm font-semibold text-[#03A6A1]">Apply to rent (if due)</span>
                  </label>
                  {outstandingRent > 0 && (
                    <span className="text-xs text-blue-700">Outstanding rent: KES {outstandingRent.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </>
          )}
          {/* Payment Type Radio Buttons removed: now handled by split logic and checkbox for deposit */}
          {/* Amount Input and Split Summary */}
          {selectedTenant && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Amount Received (KES)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  min={1}
                  required
                  placeholder={rentalAmount ? undefined : 'Enter amount'}
                />
              </div>
              {splitSummary && (
                <div className="mt-2 p-2 rounded bg-blue-50 border border-blue-200 text-blue-900 text-sm">
                  <div className="font-semibold mb-1">Payment Split Summary:</div>
                  {applyDeposit && (
                    <div>Deposit paid: <span className="font-bold">KES {splitSummary.depositPaid.toLocaleString()}</span> (Remaining: <span className="font-bold">KES {splitSummary.depositRemaining.toLocaleString()}</span>)</div>
                  )}
                  <div>Rent paid: <span className="font-bold">KES {splitSummary.rentPaid.toLocaleString()}</span> (Remaining: <span className="font-bold">KES {splitSummary.rentRemaining.toLocaleString()}</span>)</div>
                  {splitSummary.overpayment > 0 && (
                    <div className="mt-2 p-2 rounded bg-green-50 border border-green-200 text-green-900 text-sm">
                      <span className="font-semibold">Overpayment:</span> <span className="font-bold">KES {splitSummary.overpayment.toLocaleString()}</span> (will be credited to tenant's account)
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <button
          type="submit"
          className="mt-6 w-full py-2 rounded bg-[#03A6A1] text-white font-bold text-base hover:bg-[#028b8a] transition"
          disabled={!(modalProperty && modalFloor && modalTenant && amount)}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default RentArrears;

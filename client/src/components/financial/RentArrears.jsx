import React, { useEffect, useState } from 'react';

const RentArrears = () => {
  const [arrears, setArrears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArrears = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token. Please log in again.');
        const res = await fetch('/api/financial/rent-arrears', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          let errorMsg = `HTTP ${res.status}`;
          try {
            const errData = await res.json();
            errorMsg = errData.error || errorMsg;
          } catch (jsonErr) {
            // Ignore JSON parse error
          }
          throw new Error(errorMsg);
        }
        const data = await res.json();
        setArrears(data.data || []);
      } catch (err) {
        setError(`Failed to fetch arrears: ${err.message}`);
        // Log full error for debugging
        console.error('RentArrears fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArrears();
  }, []);

  // Responsive: Table for desktop, cards for mobile
  const isMobile = window.innerWidth < 768;

  // Summary stats
  const totalArrears = arrears.reduce((sum, a) => sum + (a.amount - a.amountPaid), 0);
  const numTenants = arrears.length;

  if (loading) return <div>Loading rent arrears...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="rent-arrears-container">
      <div className="arrears-summary">
        <h2>Rent Arrears</h2>
        <div>Total Arrears: <b>KES {totalArrears.toLocaleString()}</b></div>
        <div>Tenants in Arrears: <b>{numTenants}</b></div>
      </div>
      {arrears.length === 0 ? (
        <div className="empty-state">No tenants in arrears. 🎉</div>
      ) : isMobile ? (
        <div className="arrears-cards">
          {arrears.map(a => (
            <div className="arrear-card" key={a.paymentId}>
              <div><b>{a.tenantName}</b> ({a.tenantPhone || a.tenantEmail})</div>
              <div>{a.propertyName} - {a.unitType} {a.unitLabel} ({a.floor})</div>
              <div>Due: <b>KES {a.amount.toLocaleString()}</b></div>
              <div>Paid: <b>KES {a.amountPaid.toLocaleString()}</b></div>
              <div>Balance: <b>KES {(a.amount - a.amountPaid).toLocaleString()}</b></div>
              <div>Status: <span className={`status-badge ${a.status}`}>{a.status}</span></div>
              <div className="progress-bar-wrapper">
                <div className="progress-bar" style={{width: `${Math.min(100, (a.amountPaid / a.amount) * 100)}%`}}></div>
              </div>
              <div>Due Date: {new Date(a.dueDate).toLocaleDateString()}</div>
              <button className="reminder-btn">Send Reminder</button>
            </div>
          ))}
        </div>
      ) : (
        <table className="arrears-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Contact</th>
              <th>Property/Unit</th>
              <th>Due</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {arrears.map(a => (
              <tr key={a.paymentId}>
                <td>{a.tenantName}</td>
                <td>{a.tenantPhone || a.tenantEmail}</td>
                <td>{a.propertyName} - {a.unitType} {a.unitLabel} ({a.floor})</td>
                <td>KES {a.amount.toLocaleString()}</td>
                <td>KES {a.amountPaid.toLocaleString()}</td>
                <td><b>KES {(a.amount - a.amountPaid).toLocaleString()}</b></td>
                <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                <td>{new Date(a.dueDate).toLocaleDateString()}</td>
                <td><button className="reminder-btn">Send Reminder</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RentArrears;

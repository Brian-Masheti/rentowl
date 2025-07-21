import React from 'react';
import TenantSidebar from '../sidebars/TenantSidebar';

const PRIMARY = '#03A6A1';

const TenantDashboard: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFE3BB' }}>
      <TenantSidebar />
      <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
        <h1 style={{ color: PRIMARY, fontWeight: 700, fontSize: 32, marginBottom: 16, background: '#FFF', padding: '12px 24px', borderRadius: 8, border: '2px solid #03A6A1' }}>Tenant Dashboard</h1>
        <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
          Welcome, Tenant! Here you can pay rent, submit maintenance requests, and access your documents.
        </p>
        {/* Add tenant-specific KPIs and quick links here */}
      </main>
    </div>
  );
};

export default TenantDashboard;

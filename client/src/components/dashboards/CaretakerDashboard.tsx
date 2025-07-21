import React, { useState } from 'react';
import CaretakerSidebar from '../sidebars/CaretakerSidebar';

const sectionLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'maintenance-needs': 'Maintenance Needs',
  'maintenance-tasks': 'Maintenance Tasks',
  'resolved-issues': 'Resolved Issues',
  'tenant-communication': 'Tenant Communication',
  'announcements-reports': 'Announcements & Reports',
  'action-updates': 'Action Updates',
  'rent-status': 'Rent Status',
  'service-history': 'Service History',
  'active-requests': 'Active Requests',
  profile: 'My Profile',
};

const CaretakerDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('dashboard');
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {}

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFE3BB' }}>
      <CaretakerSidebar onSelect={setSelectedSection} selected={selectedSection} />
      <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
        {selectedSection === 'dashboard' ? (
          <>
            <h1 style={{ color: '#03A6A1', fontWeight: 700, fontSize: 32 }}>Caretaker Dashboard</h1>
            <p style={{ color: '#23272F', fontSize: 18, marginTop: 16 }}>
              {user && user.firstName
                ? `Welcome, ${user.firstName} ${user.lastName}! Here you can manage maintenance, interact with tenants, and more.`
                : 'Welcome, Caretaker! Here you can manage maintenance, interact with tenants, and more.'}
            </p>
          </>
        ) : (
          <div style={{ color: '#03A6A1', fontWeight: 600, fontSize: 22, background: '#FFF', padding: '24px', borderRadius: 8, border: '2px solid #03A6A1' }}>
            Coming soon: {sectionLabels[selectedSection] || 'This section'}
          </div>
        )}
      </main>
    </div>
  );
};

export default CaretakerDashboard;

import React, { useState } from 'react';
import SuperAdminSidebar from '../sidebars/SuperAdminSidebar';

const sectionLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'user-management': 'User Management',
  landlords: 'Landlords',
  tenants: 'Tenants',
  caretakers: 'Caretakers',
  admins: 'Admins',
  properties: 'Properties',
  'financial-reports': 'Financial Reports',
  maintenance: 'Maintenance',
  announcements: 'Announcements',
  subscriptions: 'Subscriptions',
  'system-settings': 'System Settings',
  'audit-logs': 'Audit Logs',
  profile: 'My Profile',
};

const SuperAdminDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('dashboard');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFE3BB' }}>
      <SuperAdminSidebar onSelect={setSelectedSection} selected={selectedSection} />
      <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
        <h1 style={{ color: '#23272F', fontWeight: 700, fontSize: 32 }}>
          {sectionLabels[selectedSection] || 'Section'}
        </h1>
        <p style={{ color: '#03A6A1', fontSize: 18, marginTop: 16 }}>
          Coming soon: {sectionLabels[selectedSection] || 'This section'}
        </p>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

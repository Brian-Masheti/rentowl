import React, { useState } from 'react';
import LandlordSidebar from '../sidebars/LandlordSidebar';

const sectionLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  properties: 'Properties',
  'financial-reports': 'Financial Reports',
  'tenant-statements': 'Tenant Statements',
  'caretaker-management': 'Caretaker Management',
  'caretaker-actions': 'Caretaker Actions',
  'legal-documents': 'Legal Documents',
  'tenant-checkin': 'Tenant Check-in Docs',
  'monthly-income': 'Monthly Income',
  'occupancy-vacancy': 'Occupancy vs. Vacancy',
  'rent-arrears': 'Rent Arrears',
  profile: 'My Profile',
};

const LandlordDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('dashboard');
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    console.error('Failed to parse user data from localStorage');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFE3BB' }}>
      <LandlordSidebar onSelect={setSelectedSection} selected={selectedSection} />
      <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
        {selectedSection === 'dashboard' ? (
          <>
            <h1 style={{ color: '#03A6A1', fontWeight: 700, fontSize: 32 }}>Landlord Dashboard</h1>
            <p style={{ color: '#23272F', fontSize: 18, marginTop: 16 }}>
              {user && user.firstName
                ? `Welcome, ${user.firstName} ${user.lastName}! Here you can manage your properties, view financials, and more.`
                : 'Welcome, Landlord! Here you can manage your properties, view financials, and more.'}
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

export default LandlordDashboard;

import React, { useState } from 'react';
import CaretakerSidebar from '../sidebars/CaretakerSidebar';
import MobileDashboardView from './MobileDashboardView';
import { caretakerMenu } from './dashboardConfig.jsx';

const sectionTitles = {
  dashboard: 'Caretaker Dashboard',
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

const sectionContent = {
  dashboard: (
    <>
      <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
        Welcome, Caretaker! Here you can manage maintenance, interact with tenants, and more.
      </p>
    </>
  ),
  'maintenance-needs': <p>View and manage maintenance needs here.</p>,
  'maintenance-tasks': <p>Track and assign maintenance tasks.</p>,
  'resolved-issues': <p>See resolved maintenance issues.</p>,
  'tenant-communication': <p>Communicate with tenants.</p>,
  'announcements-reports': <p>View announcements and reports.</p>,
  'action-updates': <p>See recent action updates.</p>,
  'rent-status': <p>Check rent status for tenants.</p>,
  'service-history': <p>View service history records.</p>,
  'active-requests': <p>Manage active maintenance requests.</p>,
  profile: <p>View and edit your profile information.</p>,
};

const CaretakerDashboard = () => {
  const [selectedSection, setSelectedSection] = useState('dashboard');

  try {
    return (
      <>
        <div className="block md:hidden">
          <MobileDashboardView
            menuItems={menuItems}
            sectionTitles={sectionTitles}
            sectionContent={sectionContent}
            dashboardLabel="Caretaker Dashboard"
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
          />
        </div>
        <div className="hidden md:flex" style={{ minHeight: '100vh', background: '#FFE3BB' }}>
          <CaretakerSidebar onSelect={setSelectedSection} selected={selectedSection} />
          <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
            <h1 style={{ color: '#03A6A1', fontWeight: 700, fontSize: 32 }}>{sectionTitles[selectedSection] || 'Caretaker Dashboard'}</h1>
            <div style={{ marginTop: 16 }}>
              {sectionContent[selectedSection] || <div style={{ color: '#03A6A1', fontWeight: 600, fontSize: 22, background: '#FFF', padding: '24px', borderRadius: 8, border: '2px solid #03A6A1' }}>Coming soon: {sectionTitles[selectedSection] || 'This section'}</div>}
            </div>
          </main>
        </div>
      </>
    );
  } catch (error) {
    return <div style={{ color: 'red', padding: 20 }}>An error occurred: {error.message}</div>;
  }
};

export default CaretakerDashboard;

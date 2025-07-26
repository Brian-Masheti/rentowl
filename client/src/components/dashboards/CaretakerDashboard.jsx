import React, { useState, useEffect } from 'react';
import CaretakerSidebar from '../sidebars/CaretakerSidebar';
import MobileDashboardView from './MobileDashboardView';
import { caretakerMenu } from './dashboardConfig.jsx';
import StickyNavBar from '../shared/StickyNavBar.jsx';

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
  // On mount, try to load last selected section from localStorage
  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('caretakerSelectedSection');
      if (saved) return saved;
    }
    return 'dashboard';
  };
  const [selectedSection, setSelectedSection] = useState(getInitialSection());

  // Save selected section to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('caretakerSelectedSection', selectedSection);
    }
    // Scroll to top on section change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSection]);

  // Redirect to landing page if not authenticated (check both token and user)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (!token || !user) {
        window.location.href = '/';
      }
    }
  }, []);

  // Find the selected menu item for sticky nav
  const selectedMenuItem = caretakerMenu.find(item => item.key === selectedSection) || { label: sectionTitles[selectedSection] || 'Caretaker Dashboard' };

  try {
    return (
      <>
        {/* Mobile View */}
        <div className="block md:hidden">
          <MobileDashboardView
            menuItems={caretakerMenu}
            sectionTitles={sectionTitles}
            sectionContent={sectionContent}
            dashboardLabel="Caretaker Dashboard"
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
          />
        </div>
        {/* Desktop/Tablet View */}
        <div className="hidden md:flex" style={{ minHeight: '100vh', background: '#FFE3BB' }}>
          <CaretakerSidebar onSelect={setSelectedSection} selected={selectedSection} />
          <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
            <StickyNavBar label={selectedMenuItem.label} icon={selectedMenuItem.icon} />
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

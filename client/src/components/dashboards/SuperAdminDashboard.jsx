import React, { useState } from 'react';
import SuperAdminSidebar from '../sidebars/SuperAdminSidebar';
import MobileDashboardView from './MobileDashboardView';
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaMoneyBillWave,
  FaTools,
  FaBullhorn,
  FaClipboardList,
  FaCogs,
  FaBook
} from 'react-icons/fa';

import { superAdminMenu } from './dashboardConfig';
import StickyNavBar from '../shared/StickyNavBar.jsx';
import AdminManagement from '../admin/AdminManagement';

const sectionTitles = {
  dashboard: 'Super Admin Dashboard',
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

const sectionContent = {
  dashboard: (
    <>
      <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
        Welcome, Super Admin! Here you can manage users, properties, finances, and more.
      </p>
    </>
  ),
  'user-management': <p>Manage all users here.</p>,
  landlords: <p>View and manage landlords.</p>,
  tenants: <p>View and manage tenants.</p>,
  caretakers: <p>View and manage caretakers.</p>,
  admins: <AdminManagement />, // Admin management UI
  properties: <p>Manage all properties here.</p>,
  'financial-reports': <p>View financial reports.</p>,
  maintenance: <p>Manage maintenance tasks and issues.</p>,
  announcements: <p>View and send announcements.</p>,
  subscriptions: <p>Manage subscriptions and billing.</p>,
  'system-settings': <p>Configure system settings.</p>,
  'audit-logs': <p>View system audit logs.</p>,
  profile: <p>View and edit your profile information.</p>,
};

const SuperAdminDashboard = () => {
  // On mount, try to load last selected section from localStorage
  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('superAdminSelectedSection');
      if (saved) return saved;
    }
    return 'dashboard';
  };
  const [selectedSection, setSelectedSection] = useState(getInitialSection());

  // Save selected section to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('superAdminSelectedSection', selectedSection);
    }
    // Scroll to top on section change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSection]);

  // Redirect to landing page if not authenticated
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
      }
    }
  }, []);

  try {
    return (
      <>
        <div className="block md:hidden">
          <MobileDashboardView
          menuItems={superAdminMenu}
          sectionTitles={sectionTitles}
          sectionContent={sectionContent}
          dashboardLabel="Super Admin Dashboard"
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          sidebarBgColor="#23272F"
          />
        </div>
        <div className="hidden md:flex" style={{ minHeight: '100vh', background: '#FFE3BB' }}>
          <SuperAdminSidebar onSelect={setSelectedSection} selected={selectedSection} />
          <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
            <StickyNavBar
              label={(superAdminMenu.find(item => item.key === selectedSection)?.label) || (sectionTitles[selectedSection] || 'Super Admin Dashboard')}
              icon={superAdminMenu.find(item => item.key === selectedSection)?.icon}
            />
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

export default SuperAdminDashboard;

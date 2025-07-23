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

const menuItems = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'User Management', icon: <FaUsers />, key: 'user-management' },
  { label: 'Properties', icon: <FaBuilding />, key: 'properties' },
  { label: 'Financial Reports', icon: <FaMoneyBillWave />, key: 'financial-reports' },
  { label: 'Maintenance', icon: <FaTools />, key: 'maintenance' },
  { label: 'Announcements', icon: <FaBullhorn />, key: 'announcements' },
  { label: 'Subscriptions', icon: <FaClipboardList />, key: 'subscriptions' },
  { label: 'System Settings', icon: <FaCogs />, key: 'system-settings' },
  { label: 'Audit Logs', icon: <FaBook />, key: 'audit-logs' },
];

const sectionTitles: Record<string, string> = {
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

const sectionContent: Record<string, React.ReactNode> = {
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
  admins: <p>View and manage admins.</p>,
  properties: <p>Manage all properties here.</p>,
  'financial-reports': <p>View financial reports.</p>,
  maintenance: <p>Manage maintenance tasks and issues.</p>,
  announcements: <p>View and send announcements.</p>,
  subscriptions: <p>Manage subscriptions and billing.</p>,
  'system-settings': <p>Configure system settings.</p>,
  'audit-logs': <p>View system audit logs.</p>,
  profile: <p>View and edit your profile information.</p>,
};

const SuperAdminDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('dashboard');

  return (
    <>
      <div className="block md:hidden">
        <MobileDashboardView
          menuItems={menuItems}
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
          <h1 style={{ color: '#03A6A1', fontWeight: 700, fontSize: 32 }}>{sectionTitles[selectedSection] || 'Super Admin Dashboard'}</h1>
          <div style={{ marginTop: 16 }}>
            {sectionContent[selectedSection] || <div style={{ color: '#03A6A1', fontWeight: 600, fontSize: 22, background: '#FFF', padding: '24px', borderRadius: 8, border: '2px solid #03A6A1' }}>Coming soon: {sectionTitles[selectedSection] || 'This section'}</div>}
          </div>
        </main>
      </div>
    </>
  );
};

export default SuperAdminDashboard;

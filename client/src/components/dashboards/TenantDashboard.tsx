import React, { useState } from 'react';
import TenantSidebar from '../sidebars/TenantSidebar';
import MobileDashboardView from './MobileDashboardView';
import {
  FaHome,
  FaFileAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaReceipt,
  FaTools,
  FaComments,
  FaBell,
  FaExclamationTriangle
} from 'react-icons/fa';

const menuItems = [
  { label: 'Dashboard', icon: <FaHome /> },
  { label: 'Housing Agreement', icon: <FaFileAlt /> },
  { label: 'Rent Payment History', icon: <FaMoneyBillWave /> },
  { label: 'Make Payment', icon: <FaCreditCard /> },
  { label: 'Receipts', icon: <FaReceipt /> },
  { label: 'Maintenance Requests', icon: <FaTools /> },
  { label: 'Announcements', icon: <FaComments /> },
  { label: 'Reminders', icon: <FaBell /> },
  { label: 'Late Penalties', icon: <FaExclamationTriangle /> },
];

const sectionTitles: Record<string, string> = {
  'dashboard': 'Tenant Dashboard',
  'housing-agreement': 'Housing Agreement',
  'rent-payment-history': 'Rent Payment History',
  'make-payment': 'Make Payment',
  'receipts': 'Receipts',
  'maintenance-requests': 'Maintenance Requests',
  'announcements': 'Announcements',
  'reminders': 'Reminders',
  'late-penalties': 'Late Penalties',
};

const sectionContent: Record<string, React.ReactNode> = {
  'dashboard': (
    <>
      <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
        Welcome, Tenant! Here you can pay rent, submit maintenance requests, and access your documents.
      </p>
    </>
  ),
  'housing-agreement': <p>View and download your housing agreement here.</p>,
  'rent-payment-history': <p>See your rent payment history and receipts.</p>,
  'make-payment': <p>Make a new rent payment securely.</p>,
  'receipts': <p>Download your rent payment receipts.</p>,
  'maintenance-requests': <p>Submit and track maintenance requests.</p>,
  'announcements': <p>Read the latest announcements from your landlord or caretaker.</p>,
  'reminders': <p>View your rent and maintenance reminders.</p>,
  'late-penalties': <p>See any late penalties applied to your account.</p>,
};

const TenantDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('dashboard');

  return (
    <>
      <MobileDashboardView
        menuItems={menuItems}
        sectionTitles={sectionTitles}
        sectionContent={sectionContent}
        dashboardLabel="Tenant Dashboard"
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
      />
      <div style={{ display: 'flex', minHeight: '100vh', background: '#FFE3BB' }}>
        <TenantSidebar onSelect={setSelectedSection} selected={selectedSection} />
        <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
          <h1 style={{ color: '#03A6A1', fontWeight: 700, fontSize: 32 }}>{sectionTitles[selectedSection] || 'Tenant Dashboard'}</h1>
          <div style={{ marginTop: 16 }}>
            {sectionContent[selectedSection] || <div style={{ color: '#03A6A1', fontWeight: 600, fontSize: 22, background: '#FFF', padding: '24px', borderRadius: 8, border: '2px solid #03A6A1' }}>Coming soon: {sectionTitles[selectedSection] || 'This section'}</div>}
          </div>
        </main>
      </div>
    </>
  );
};

export default TenantDashboard;

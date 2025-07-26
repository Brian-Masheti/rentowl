import React, { useState, useEffect } from 'react';
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

import { tenantMenu } from './dashboardConfig';
import StickyNavBar from '../shared/StickyNavBar.jsx';

const sectionTitles = {
  'dashboard': 'Tenant Dashboard',
  'housing-agreement': 'Housing Agreement',
  'rent-payment-history': 'Rent Payment History',
  'payment-status': 'Payment Status',
  'make-payment': 'Make Payment',
  'receipts': 'Receipts',
  'maintenance-requests': 'Maintenance Requests',
  'announcements': 'Announcements',
  'reminders': 'Reminders',
  'late-penalties': 'Late Penalties',
};

const sectionContent = {
  'dashboard': (
    <>
      <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
        Welcome, Tenant! Here you can pay rent, submit maintenance requests, and access your documents.
      </p>
    </>
  ),
  'housing-agreement': <p>View and download your housing agreement here.</p>,
  'rent-payment-history': <p>See your rent payment history and receipts.</p>,
  'payment-status': <p>See your payment status here.</p>,
  'make-payment': <p>Make a new rent payment securely.</p>,
  'receipts': <p>Download your rent payment receipts.</p>,
  'maintenance-requests': <p>Submit and track maintenance requests.</p>,
  'announcements': <p>Read the latest announcements from your landlord or caretaker.</p>,
  'reminders': <p>View your rent and maintenance reminders.</p>,
  'late-penalties': <p>See any late penalties applied to your account.</p>,
};

const TenantDashboard = () => {
  // On mount, try to load last selected section from localStorage
  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tenantSelectedSection');
      if (saved) return saved;
    }
    return 'dashboard';
  };
  const [selectedSection, setSelectedSection] = useState(getInitialSection());

  // Save selected section to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tenantSelectedSection', selectedSection);
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

  try {
    return (
      <>
        <div className="block md:hidden">
          <MobileDashboardView
            menuItems={tenantMenu}
            sectionTitles={sectionTitles}
            sectionContent={sectionContent}
            dashboardLabel="Tenant Dashboard"
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
          />
        </div>
        <div className="hidden md:flex" style={{ minHeight: '100vh', background: '#FFE3BB' }}>
          <TenantSidebar onSelect={setSelectedSection} selected={selectedSection} />
          <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
            <StickyNavBar
              label={(tenantMenu.find(item => item.key === selectedSection)?.label) || (sectionTitles[selectedSection] || 'Tenant Dashboard')}
              icon={tenantMenu.find(item => item.key === selectedSection)?.icon}
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

export default TenantDashboard;

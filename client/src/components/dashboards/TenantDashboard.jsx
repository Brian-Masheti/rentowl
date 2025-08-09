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

import TenantChecklistMenu from '../checklists/TenantChecklistMenu';

import PersonalizedWelcome from '../shared/PersonalizedWelcome';
import TenantMakePaymentModal from '../tenants/TenantMakePaymentModal';

const sectionContent = {
  'dashboard': (
    <>
      <PersonalizedWelcome />
      <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
        Here you can pay rent, submit maintenance requests, and access your documents.
      </p>
    </>
  ),
  'housing-agreement': <p>View and download your housing agreement here.</p>,
  'tenant-checkin': <TenantChecklistMenu />, 
  'rent-payment-history': <p>See your rent payment history and receipts.</p>,
  'payment-status': <p>See your payment status here.</p>,
  'make-payment': null, // Will be handled in component for modal
  'receipts': <p>Download your rent payment receipts.</p>,
  'maintenance-requests': <p>Submit and track maintenance requests.</p>,
  'announcements': <p>Read the latest announcements from your landlord or caretaker.</p>,
  'reminders': <p>View your rent and maintenance reminders.</p>,
  'late-penalties': <p>See any late penalties applied to your account.</p>,
};

const TenantDashboard = () => {
  // Properties state for payment options
  const [properties, setProperties] = useState([]);
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

  // Fetch property for tenant (for payment options)
  const [tenantProperty, setTenantProperty] = useState(null);
  useEffect(() => {
    async function fetchTenantProperty() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/tenants/me/property', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTenantProperty(data.property || null);
      } catch (err) {
        setTenantProperty(null);
        console.error('Error fetching tenant property:', err);
      }
    }
    fetchTenantProperty();
  }, []);

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

  // Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Get paymentOptions from the tenant's property
  const paymentOptions = tenantProperty?.paymentOptions || [];
  // Debug: log paymentOptions being passed to the modal
  if (showPaymentModal) {
    // eslint-disable-next-line no-console
    // console.log('DEBUG paymentOptions for tenant modal:', paymentOptions);
  }

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
          <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh', position: 'relative' }}>
            <StickyNavBar
              label={(tenantMenu.find(item => item.key === selectedSection)?.label) || (sectionTitles[selectedSection] || 'Tenant Dashboard')}
              icon={tenantMenu.find(item => item.key === selectedSection)?.icon}
            />
            <div style={{ marginTop: 16 }}>
              {selectedSection === 'make-payment' ? (
                <>
                  <button
                    className="fixed z-50 bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-full font-bold shadow-lg text-base transition-all"
                    style={{ background: '#03A6A1', color: 'white', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)' }}
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <FaMoneyBillWave className="text-lg" />
                    Make Payment
                  </button>
                  <TenantMakePaymentModal
                    open={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    paymentOptions={paymentOptions}
                  />
                </>
              ) : (
                sectionContent[selectedSection] || <div style={{ color: '#03A6A1', fontWeight: 600, fontSize: 22, background: '#FFF', padding: '24px', borderRadius: 8, border: '2px solid #03A6A1' }}>Coming soon: {sectionTitles[selectedSection] || 'This section'}</div>
              )}
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

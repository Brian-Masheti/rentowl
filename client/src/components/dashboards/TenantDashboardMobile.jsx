import React, { useState } from 'react';
import TenantSidebar from '../sidebars/TenantSidebar';

const sectionTitles = {
  'dashboard': 'Tenant Dashboard',
  'housing-agreement': 'Housing Agreement',
  'rent-history': 'Rent Payment History',
  'make-payment': 'Make Payment',
  'payment-status': 'Payment Status',
  'receipts': 'Receipts',
  'maintenance-requests': 'Maintenance Requests',
  'announcements': 'Announcements',
  'reminders': 'Reminders',
  'late-penalties': 'Late Penalties',
  'profile': 'My Profile',
};

const sectionContent = {
  'dashboard': (
    <>
      <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
        Welcome, Tenant! Here you can pay rent, submit maintenance requests, and access your documents.
      </p>
      {/* Add tenant-specific KPIs and quick links here */}
    </>
  ),
  'housing-agreement': <p>View and download your housing agreement here.</p>,
  'rent-history': <p>See your rent payment history and receipts.</p>,
  'make-payment': <p>Make a new rent payment securely.</p>,
  'payment-status': <p>Check the status of your recent payments.</p>,
  'receipts': <p>Download your rent payment receipts.</p>,
  'maintenance-requests': <p>Submit and track maintenance requests.</p>,
  'announcements': <p>Read the latest announcements from your landlord or caretaker.</p>,
  'reminders': <p>View your rent and maintenance reminders.</p>,
  'late-penalties': <p>See any late penalties applied to your account.</p>,
  'profile': <p>View and edit your profile information.</p>,
};

const TenantDashboardMobile = () => {
  const [selectedSection, setSelectedSection] = useState('dashboard');

  try {
    // Only render on mobile
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return null;
    }

    return (
      <div style={{ minHeight: '100vh', background: '#FFE3BB' }}>
        <TenantSidebar onSelect={setSelectedSection} selected={selectedSection} />
        <main style={{ padding: 16, background: '#FFF8F0', minHeight: '100vh', width: '100%' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h1
              style={{
                color: '#03A6A1',
                fontWeight: 700,
                fontSize: 28,
                marginBottom: 16,
                background: '#FFF',
                padding: '12px 24px',
                borderRadius: 8,
                border: '2px solid #03A6A1',
                textAlign: 'center',
                marginTop: 'clamp(56px, 7vw, 72px)',
              }}
            >
              {sectionTitles[selectedSection] || 'Tenant Dashboard'}
            </h1>
            <div style={{ color: '#23272F', fontSize: 16, background: '#FFF', padding: '12px 24px', borderRadius: 8, border: '2px solid #FFA673', minHeight: 120 }}>
              {sectionContent[selectedSection] || <p>Section coming soon.</p>}
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    return <div style={{ color: 'red', padding: 20 }}>An error occurred: {error.message}</div>;
  }
};

export default TenantDashboardMobile;

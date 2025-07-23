import React, { useState, Suspense, lazy } from 'react';
import LandlordSidebar from '../sidebars/LandlordSidebar';
import MobileDashboardView from './MobileDashboardView';

const PropertyCreateForm = lazy(() => import('../properties/PropertyCreateForm'));
const PropertyList = lazy(() => import('../properties/PropertyList'));
import {
  FaHome,
  FaBuilding,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaUserTie,
  FaClipboardCheck,
  FaFileAlt,
  FaUsers,
  FaChartBar,
  FaBalanceScale
} from 'react-icons/fa';

const menuItems = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'Properties', icon: <FaBuilding />, key: 'properties' },
  { label: 'Financial Reports', icon: <FaMoneyBillWave />, key: 'financial-reports' },
  { label: 'Tenant Statements', icon: <FaFileInvoiceDollar />, key: 'tenant-statements' },
  { label: 'Caretaker Management', icon: <FaUserTie />, key: 'caretaker-management' },
  { label: 'Caretaker Actions', icon: <FaClipboardCheck />, key: 'caretaker-actions' },
  { label: 'Legal Documents', icon: <FaFileAlt />, key: 'legal-documents' },
  { label: 'Tenant Check-in Docs', icon: <FaUsers />, key: 'tenant-checkin' },
  { label: 'Monthly Income', icon: <FaChartBar />, key: 'monthly-income' },
  { label: 'Occupancy vs. Vacancy', icon: <FaBalanceScale />, key: 'occupancy-vacancy' },
  { label: 'Rent Arrears', icon: <FaFileInvoiceDollar />, key: 'rent-arrears' },
];

const sectionTitles: Record<string, string> = {
  dashboard: 'Landlord Dashboard',
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

// --- PropertySection component for add button and form toggle ---
// PropertyList is now lazy loaded above

const PropertySection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshToken, setRefreshToken] = useState(Date.now());
  const handleSuccess = () => {
    setShowForm(false);
    setRefreshToken(Date.now()); // trigger PropertyList refresh
  };
  return (
    <div>
      <button
        className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition mb-4 fixed bottom-8 right-8 z-50 shadow-lg"
        onClick={() => setShowForm(true)}
        style={{ minWidth: 160 }}
      >
        + Add Property
      </button>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <Suspense fallback={<div className="text-center p-8">Loading form...</div>}>
              <PropertyCreateForm onSuccess={handleSuccess} onClose={() => setShowForm(false)} />
            </Suspense>
          </div>
        </div>
      )}
      <Suspense fallback={<div className="text-center p-8">Loading properties...</div>}>
        <PropertyList refreshToken={refreshToken} />
      </Suspense>
    </div>
  );
};

const sectionContent: Record<string, React.ReactNode> = {
  dashboard: (
    <>
      <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
        Welcome, Landlord! Here you can manage your properties, view financials, and more.
      </p>
    </>
  ),
  properties: (
    <PropertySection />
  ),
  'financial-reports': <p>View financial reports.</p>,
  'tenant-statements': <p>See tenant statements.</p>,
  'caretaker-management': <p>Manage caretakers here.</p>,
  'caretaker-actions': <p>View caretaker actions.</p>,
  'legal-documents': <p>Access legal documents.</p>,
  'tenant-checkin': <p>View tenant check-in documents.</p>,
  'monthly-income': <p>See your monthly income.</p>,
  'occupancy-vacancy': <p>Check occupancy vs. vacancy rates.</p>,
  'rent-arrears': <p>View rent arrears information.</p>,
  profile: <p>View and edit your profile information.</p>,
};

const LandlordDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('dashboard');

  return (
    <>
      <div className="block md:hidden">
        <MobileDashboardView
          menuItems={menuItems}
          sectionTitles={sectionTitles}
          sectionContent={sectionContent}
          dashboardLabel="Landlord Dashboard"
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />
      </div>
      <div className="hidden md:flex" style={{ minHeight: '100vh', background: '#FFE3BB' }}>
        <LandlordSidebar onSelect={setSelectedSection} selected={selectedSection} />
        <main style={{ flex: 1, padding: 32, background: '#FFF8F0', minHeight: '100vh' }}>
          <h1 style={{ color: '#03A6A1', fontWeight: 700, fontSize: 32 }}>{sectionTitles[selectedSection] || 'Landlord Dashboard'}</h1>
          <div style={{ marginTop: 16 }}>
            {sectionContent[selectedSection] || <div style={{ color: '#03A6A1', fontWeight: 600, fontSize: 22, background: '#FFF', padding: '24px', borderRadius: 8, border: '2px solid #03A6A1' }}>Coming soon: {sectionTitles[selectedSection] || 'This section'}</div>}
          </div>
        </main>
      </div>
    </>
  );
};

export default LandlordDashboard;

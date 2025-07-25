import React, { useState, useEffect, Suspense, lazy } from 'react';
import LandlordSidebar from '../sidebars/LandlordSidebar';
import MobileDashboardView from './MobileDashboardView';
import TenantTable from '../tenants/TenantTable';
import UserAssignmentPanel from '../shared/UserAssignmentPanel';
import UnassignedTenantSelector from './UnassignedTenantSelector';
import AssignUserToPropertyModal from '../common/AssignUserToPropertyModal';
import FinancialReport from '../financial/FinancialReport';
import FilterBar from '../common/FilterBar';
import ResponsiveTableOrCards from '../common/ResponsiveTableOrCards';
import {
  FaHome,
  FaBuilding,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaBalanceScale
} from 'react-icons/fa';

const PropertyCreateForm = lazy(() => import('../properties/PropertyCreateForm'));
const PropertyList = lazy(() => import('../properties/PropertyList'));

type TenantTableRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyName: string;
  unitType?: string;
  deleted?: boolean;
  status?: string;
};

type PropertyType = {
  id: string;
  name: string;
  units: any[];
  tenants: any[];
};

const AddTenantSection: React.FC<{ properties: PropertyType[]; refresh: () => void }> = ({ properties, refresh }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Handle tenant add/assign
  const handleAddTenant = async (data: any) => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    console.log('Add Tenant payload:', data);
    const res = await fetch(`${API_URL}/api/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data.tenant, propertyId: data.propertyId }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('Add Tenant error:', errData);
      throw new Error(errData.error || 'Failed to add tenant');
    }
    refresh();
  };

  return (
    <>
      <button
        className="fixed bottom-8 right-8 z-50 bg-[#03A6A1] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-[#FFA673] transition text-lg"
        style={{ minWidth: 160 }}
        onClick={() => setModalOpen(true)}
        disabled={properties.length === 0}
      >
        + Add Tenant
      </button>
      {properties.length === 0 && (
        <div className="text-red-500 mt-2">No properties available. Please add a property first.</div>
      )}
      <AssignUserToPropertyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTenant}
        mode="add"
        userType="tenant"
        properties={properties}
        themeColor="#03A6A1"
      />
    </>
  );
};

const menuItems = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'Properties', icon: <FaBuilding />, key: 'properties' },
  { label: 'Financial Reports', icon: <FaMoneyBillWave />, key: 'financial-reports' },
  { label: 'Tenant Statements', icon: <FaFileInvoiceDollar />, key: 'tenant-statements' },
  { label: 'Add Tenant to Property', icon: <FaUsers />, key: 'add-tenant' },
  { label: 'Monthly Income', icon: <FaChartBar />, key: 'monthly-income' },
  { label: 'Occupancy vs. Vacancy', icon: <FaBalanceScale />, key: 'occupancy-vacancy' },
  { label: 'Rent Arrears', icon: <FaFileInvoiceDollar />, key: 'rent-arrears' },
];

const sectionTitles: Record<string, string> = {
  dashboard: 'Landlord Dashboard',
  properties: 'Properties',
  'financial-reports': 'Financial Reports',
  'tenant-statements': 'Tenant Statements',
  'add-tenant': 'Add Tenant to Property',
  'monthly-income': 'Monthly Income',
  'occupancy-vacancy': 'Occupancy vs. Vacancy',
  'rent-arrears': 'Rent Arrears',
  profile: 'My Profile',
};

// PropertySection at top level
const PropertySection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshTokenLocal, setRefreshTokenLocal] = useState(Date.now());
  const handleSuccess = () => {
    setShowForm(false);
    setRefreshTokenLocal(Date.now());
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
        <PropertyList refreshToken={refreshTokenLocal} />
      </Suspense>
    </div>
  );
};

const LandlordDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [tenants, setTenants] = useState<TenantTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('token');
        // Properties
        const propRes = await fetch(`${API_URL}/api/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let propData = await propRes.json();
        let propertyArray = Array.isArray(propData) ? propData : propData.properties || [];
        setProperties(
          propertyArray.map((p: any) => ({
            id: p._id,
            name: p.name,
            units: p.units || [],
            tenants: p.tenants || [],
            profilePic: p.profilePic,
            profilePicThumb: p.profilePicThumb,
            gallery: p.gallery,
            galleryThumbs: p.galleryThumbs,
          }))
        );
        // Tenants
        const tenantRes = await fetch(`${API_URL}/api/tenants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tenantData = await tenantRes.json();
        setTenants((tenantData.tenants || []).map((t: any) => ({
          id: t._id,
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
          phone: t.phone,
          propertyName: t.propertyName || (t.property && t.property.name) || '',
          unitType: t.unitType || '',
          deleted: t.deleted || false,
          status: t.status || (t.deleted ? 'Deleted' : 'Active'),
        })));
      } catch (err) {
        setProperties([]);
        setTenants([]);
        console.error('Failed to fetch properties or tenants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshToken]);

  const refresh = () => setRefreshToken(t => t + 1);

  // Filters
  const propertyOptions = Array.from(new Set(properties.map(p => p.name)));
  const unitTypeOptions = Array.from(new Set(properties.flatMap(p => p.units?.map((u: any) => u.type) || [])));
  const statusOptions = ['All', 'Active', 'Deleted', 'Pending', 'Invited'];

  let filteredTenants = tenants;
  if (search) {
    filteredTenants = filteredTenants.filter(t =>
      (t.firstName + ' ' + t.lastName).toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.toLowerCase().includes(search.toLowerCase()) ||
      t.propertyName.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (statusFilter && statusFilter !== 'All') {
    filteredTenants = filteredTenants.filter(t => t.status === statusFilter);
  }
  if (propertyFilter) {
    filteredTenants = filteredTenants.filter(t => t.propertyName === propertyFilter);
  }
  if (unitTypeFilter) {
    filteredTenants = filteredTenants.filter(t => t.unitType === unitTypeFilter);
  }

  // Bulk assign handler (fetches unassigned tenants)
  const fetchUnassignedTenants = async () => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/tenants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return (data.tenants || []).filter((t: any) => !t.property && !t.propertyId);
  };
  const handleBulkAssign = async (userIds: string[], propertyId: string, unitType: string) => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/tenants/assign-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userIds, propertyId, unitType }),
    });
    refresh();
  };

  const sectionContent: Record<string, React.ReactNode> = {
    dashboard: (
      <>
        <p style={{ color: '#23272F', fontSize: 18, background: '#FFF', padding: '12px 24px', borderRadius: 8, marginBottom: 32, border: '2px solid #FFA673' }}>
          Welcome, Landlord! Here you can manage your properties, view financials, and more.
        </p>
      </>
    ),
    properties: <PropertySection />, 
    'financial-reports': <FinancialReport type="report" />, 
    'tenant-statements': <p>See tenant statements.</p>,
    'add-tenant': (
      <>
        <AddTenantSection properties={properties} refresh={refresh} />
        {/* Main tenant table (all tenants) */}
        <UserAssignmentPanel
          userType="tenant"
          properties={properties}
          fetchUsers={async () => {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/tenants`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            return data.tenants || [];
          }}
          onAssign={handleBulkAssign}
        />
        {/* Table of tenants already linked to properties */}
        <div className="mt-8">
          <ResponsiveTableOrCards
            columns={[
              { key: 'firstName', label: 'First Name' },
              { key: 'lastName', label: 'Last Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'propertyName', label: 'Property' },
              { key: 'unitType', label: 'Unit Type' },
              { key: 'status', label: 'Status', render: (u) => u.status || 'Active' },
            ]}
            data={tenants.filter(t => t.propertyName)}
            keyField="id"
            cardTitle={u => `${u.firstName} ${u.lastName}`}
          />
        </div>
      </>
    ),
    'monthly-income': <FinancialReport type="monthly-income" />, 
    'occupancy-vacancy': <FinancialReport type="occupancy" />, 
    'rent-arrears': <FinancialReport type="arrears" />, 
    profile: <p>View and edit your profile information.</p>,
  };

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

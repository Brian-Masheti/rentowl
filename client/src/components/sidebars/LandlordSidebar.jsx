import React, { useState } from 'react';
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
  FaBalanceScale,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';

const items = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'Properties', icon: <FaBuilding />, key: 'properties' },
  { label: 'Financial Reports', icon: <FaMoneyBillWave />, key: 'financial-reports' },
  { label: 'Tenant Statements', icon: <FaFileInvoiceDollar />, key: 'tenant-statements' },
  { label: 'Add Tenant to Property', icon: <FaUsers />, key: 'add-tenant' },
  { label: 'Assign Caretaker to Property', icon: <FaUserTie />, key: 'assign-caretaker' },
  { label: 'Caretaker Management', icon: <FaUserTie />, key: 'caretaker-management' },
  { label: 'Caretaker Actions', icon: <FaClipboardCheck />, key: 'caretaker-actions' },
  { label: 'Legal Documents', icon: <FaFileAlt />, key: 'legal-documents' },
  { label: 'Tenant Check-in Docs', icon: <FaUsers />, key: 'tenant-checkin' },
  { label: 'Monthly Income', icon: <FaChartBar />, key: 'monthly-income' },
  { label: 'Occupancy vs. Vacancy', icon: <FaBalanceScale />, key: 'occupancy-vacancy' },
  { label: 'Rent Arrears', icon: <FaFileInvoiceDollar />, key: 'rent-arrears' },
];

const LandlordSidebar = ({ onSelect, selected }) => {
  const [expanded, setExpanded] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleSidebarItemClick = (item) => {
    if (onSelect) onSelect(item.key);
  };

  const sidebarClasses = `flex flex-col justify-start bg-[#03A6A1] text-white transition-all duration-300 ease-in-out ${expanded && !isMobile ? 'w-56' : 'w-16'} min-h-screen overflow-hidden`;

  return (
    <nav
      className={sidebarClasses}
      onMouseEnter={() => { if (!isMobile) setExpanded(true); }}
      onMouseLeave={() => { if (!isMobile) setExpanded(false); }}
    >
      <div className={`font-bold text-2xl mb-8 px-4 py-2 transition-all duration-300 ${expanded ? 'text-left' : 'text-center'}`}>{expanded ? 'Landlord' : '🏠'}</div>
      <div className="flex-1 flex flex-col gap-1">
        {items.map(item => (
          <button
            key={item.label}
            onClick={() => handleSidebarItemClick(item)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium text-base ${selected === item.key ? 'bg-[#FFA673] text-white' : 'hover:bg-[#FFA673]/80'} ${expanded ? 'justify-start' : 'justify-center'}`}
            style={{ minWidth: 0 }}
          >
            <span className="text-xl flex-shrink-0 leading-none m-0 p-0">{item.icon}</span>
            {expanded && <span className="whitespace-nowrap leading-none m-0 p-0">{item.label}</span>}
          </button>
        ))}
      </div>
      {/* My Profile and Logout at the bottom */}
      <div className="flex flex-col gap-1 mb-4 mt-auto">
        <button
          onClick={() => handleSidebarItemClick({ label: 'My Profile', icon: <FaUserCircle />, key: 'profile' })}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium text-base hover:bg-[#FFA673]/80 ${expanded ? 'justify-start' : 'justify-center'}`}
        >
          <span className="text-xl flex-shrink-0 leading-none m-0 p-0"><FaUserCircle /></span>
          {expanded && <span className="whitespace-nowrap leading-none m-0 p-0">My Profile</span>}
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium text-base hover:bg-[#FFA673]/80 ${expanded ? 'justify-start' : 'justify-center'}`}
        >
          <span className="text-xl text-[#FF4F0F] flex-shrink-0 leading-none m-0 p-0"><FaSignOutAlt /></span>
          {expanded && <span className="whitespace-nowrap leading-none m-0 p-0">Logout</span>}
        </button>
      </div>
    </nav>
  );
};

export default LandlordSidebar;

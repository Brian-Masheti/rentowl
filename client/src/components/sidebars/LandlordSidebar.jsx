import React, { useState, useEffect } from 'react';
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
  FaUserCircle,
  FaBell,
  FaEnvelope,
  FaCog
} from 'react-icons/fa';

const mainItems = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'Notifications', icon: <FaBell />, key: 'notifications', badge: 3 }, // Mock badge
  { label: 'Messages', icon: <FaEnvelope />, key: 'messages', badge: 2 }, // Mock badge
  { label: 'Properties', icon: <FaBuilding />, key: 'properties', statKey: 'properties' },
  { label: 'Financial Reports', icon: <FaMoneyBillWave />, key: 'financial-reports' },
  { label: 'Tenant Statements', icon: <FaFileInvoiceDollar />, key: 'tenant-statements' },
  { label: 'Add Tenant to Property', icon: <FaUsers />, key: 'add-tenant' },
  { label: 'Assign Caretaker to Property', icon: <FaUserTie />, key: 'assign-caretaker' },
  { label: 'Caretaker Management', icon: <FaUserTie />, key: 'caretaker-management', statKey: 'caretakers' },
  { label: 'Caretaker Actions', icon: <FaClipboardCheck />, key: 'caretaker-actions' },
  { label: 'Legal Documents', icon: <FaFileAlt />, key: 'legal-documents' },
  { label: 'Tenant Check-in Docs', icon: <FaUsers />, key: 'tenant-checkin' },
  { label: 'Monthly Income', icon: <FaChartBar />, key: 'monthly-income' },
  { label: 'Occupancy vs. Vacancy', icon: <FaBalanceScale />, key: 'occupancy-vacancy' },
  { label: 'Rent Arrears', icon: <FaFileInvoiceDollar />, key: 'rent-arrears', statKey: 'arrears' },
  { label: 'Maintenance', icon: <FaClipboardCheck />, key: 'maintenance', statKey: 'openMaintenance' },
];
const settingsItem = { label: 'Profile & Settings', icon: <FaCog />, key: 'settings' };

const LandlordSidebar = ({ onSelect, selected, expanded, setExpanded }) => {
  const [stats, setStats] = useState({});
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    // Fetch landlord overview stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env ? import.meta.env.VITE_API_URL : '';
        const res = await fetch(`${API_URL || ''}/api/landlord/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        // Fail silently for now
        console.log(err);
      }
    };
    fetchStats();
  }, []);

  const handleSidebarItemClick = (item) => {
    if (onSelect) onSelect(item.key);
  };

  const sidebarClasses = `fixed top-0 left-0 h-screen z-30 flex flex-col justify-start bg-[#03A6A1] text-white transition-all duration-300 ease-in-out ${expanded && !isMobile ? 'w-72' : 'w-16'} overflow-hidden`;

  return (
    <nav
      className={sidebarClasses}
      onMouseEnter={() => { if (!isMobile) setExpanded(true); }}
      onMouseLeave={() => { if (!isMobile) setExpanded(false); }}
    >
      <div className={`font-bold text-2xl mb-8 px-4 py-2 transition-all duration-300 ${expanded ? 'text-left' : 'text-center'}`}>{expanded ? 'Landlord' : '🏠'}</div>
      <div className="flex-1 flex flex-col gap-1">
        {mainItems.map(item => (
          <button
            key={item.label}
            onClick={() => handleSidebarItemClick(item)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium text-base ${selected === item.key ? 'bg-[#FFA673] text-white' : 'hover:bg-[#FFA673]/80'} ${expanded ? 'justify-start' : 'justify-center'}`}
            style={{ minWidth: 0 }}
          >
            <span className="text-xl flex-shrink-0 leading-none m-0 p-0">{item.icon}</span>
            {expanded && <span className="whitespace-nowrap leading-none m-0 p-0">{item.label}</span>}
            {/* Badge for stats or notifications/messages */}
            {expanded && item.statKey && stats[item.statKey] !== undefined && (
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${item.statKey === 'arrears' ? 'bg-red-200 text-red-700' : 'bg-white text-[#03A6A1]'}`}
                style={{ minWidth: 28, textAlign: 'center' }}>
                {item.statKey === 'arrears' ? `Ksh ${stats[item.statKey]}` : stats[item.statKey]}
              </span>
            )}
            {expanded && item.badge && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white" style={{ minWidth: 22, textAlign: 'center' }}>{item.badge}</span>
            )}
          </button>
        ))}
      </div>
      {/* Profile & Settings and Logout at the bottom */}
      <div className="flex flex-col gap-1 mb-4 mt-auto">
        <button
          onClick={() => handleSidebarItemClick(settingsItem)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium text-base hover:bg-[#FFA673]/80 ${expanded ? 'justify-start' : 'justify-center'}`}
        >
          <span className="text-xl flex-shrink-0 leading-none m-0 p-0">{settingsItem.icon}</span>
          {expanded && <span className="whitespace-nowrap leading-none m-0 p-0">{settingsItem.label}</span>}
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

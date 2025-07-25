import React, { useState } from 'react';
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaMoneyBillWave,
  FaTools,
  FaBullhorn,
  FaClipboardList,
  FaCogs,
  FaBook,
    FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';

const items = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'User Management', icon: <FaUsers />, key: 'user-management', subItems: [
    { label: 'Landlords', key: 'landlords' },
    { label: 'Tenants', key: 'tenants' },
    { label: 'Caretakers', key: 'caretakers' },
    { label: 'Admins', key: 'admins' },
  ]},
  { label: 'Properties', icon: <FaBuilding />, key: 'properties' },
  { label: 'Financial Reports', icon: <FaMoneyBillWave />, key: 'financial-reports' },
  { label: 'Maintenance', icon: <FaTools />, key: 'maintenance' },
  { label: 'Announcements', icon: <FaBullhorn />, key: 'announcements' },
  { label: 'Subscriptions', icon: <FaClipboardList />, key: 'subscriptions' },
  { label: 'System Settings', icon: <FaCogs />, key: 'system-settings' },
  { label: 'Audit Logs', icon: <FaBook />, key: 'audit-logs' },
];

interface SuperAdminSidebarProps {
  onSelect?: (section: string) => void;
  selected?: string;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ onSelect, selected }) => {
  const [expanded, setExpanded] = useState(false);
  // const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleSidebarItemClick = (item: typeof items[0]) => {
    setActiveTab(item.label);
    if (item.subItems) {
      setOpenSubMenu(openSubMenu === item.key ? null : item.key);
    } else {
      setOpenSubMenu(null);
      if (onSelect) onSelect(item.key);
    }
  };

  const handleSubItemClick = (subItem: any) => {
    setActiveTab(subItem.label);
    if (onSelect) onSelect(subItem.key);
  };

  const sidebarClasses = `flex flex-col justify-start bg-[#23272F] text-white transition-all duration-300 ease-in-out ${expanded && !isMobile ? 'w-56' : 'w-16'} min-h-screen overflow-hidden`;

  return (
    <nav
      className={sidebarClasses}
      onMouseEnter={() => { if (!isMobile) setExpanded(true); }}
      onMouseLeave={() => { if (!isMobile) setExpanded(false); }}
    >
      <div className={`font-bold text-2xl mb-8 px-4 py-2 transition-all duration-300 ${expanded ? 'text-left' : 'text-center'}`}>{expanded ? 'Super Admin' : '🦉'}</div>
      <div className="flex-1 flex flex-col gap-1">
        {items.map(item => (
          <div key={item.label}>
            <button
              onClick={() => handleSidebarItemClick(item)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium text-base ${selected === item.key ? 'bg-[#FFA673] text-white' : 'hover:bg-[#FFA673]/80'} ${expanded ? 'justify-start' : 'justify-center'}`}
              style={{ minWidth: 0, width: '100%' }}
            >
              <span className="text-xl flex-shrink-0 leading-none m-0 p-0">{item.icon}</span>
              {expanded && <span className="whitespace-nowrap leading-none m-0 p-0">{item.label}</span>}
              {item.subItems && expanded && (
                <span style={{ marginLeft: 'auto', fontSize: 12 }}>{openSubMenu === item.key ? '▲' : '▼'}</span>
              )}
            </button>
            {/* Submenu */}
            {item.subItems && expanded && openSubMenu === item.key && (
              <div className="ml-8 flex flex-col gap-1">
                {item.subItems.map((subItem: any) => (
                  <button
                    key={subItem.key}
                    onClick={() => handleSubItemClick(subItem)}
                    className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-300 font-medium text-sm ${selected === subItem.key ? 'bg-[#FFA673] text-white' : 'hover:bg-[#FFA673]/80'} justify-start`}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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

export default SuperAdminSidebar;

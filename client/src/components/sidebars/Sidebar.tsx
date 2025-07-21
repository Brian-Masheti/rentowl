import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

export type SidebarItem = {
  label: string;
  icon: React.ReactNode;
  key: string;
};

interface SidebarProps {
  items: SidebarItem[];
  roleLabel: string;
  selected?: string;
  onSelect?: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, roleLabel, selected, onSelect }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(true); // always expanded on desktop

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  // On mobile, sidebar is open if sidebarOpen is true
  // On desktop, sidebar is always expanded
  const open = isMobile ? sidebarOpen : expanded;

  const handleSidebarItemClick = (item: SidebarItem) => {
    if (onSelect) onSelect(item.key);
    if (isMobile) setSidebarOpen(false); // auto-collapse on mobile
  };

  // Responsive font and icon sizes
  const fontSize = isMobile ? 'text-xs' : 'text-base';
  const iconSize = isMobile ? 16 : 22;
  const labelSize = isMobile ? 13 : 16;

  // Overlay for mobile (theme color)
  const overlay = isMobile && open ? (
    <div
      className="fixed inset-0 z-40"
      style={{ background: 'rgba(255, 227, 187, 0.85)' }}
      onClick={() => setSidebarOpen(false)}
      aria-label="Close sidebar overlay"
    />
  ) : null;

  // Sidebar classes with animation
  const sidebarClasses = `
    fixed ${isMobile ? 'z-50 top-0 left-0 h-full' : ''}
    flex flex-col justify-start bg-[#03A6A1] text-white
    w-56
    min-h-screen overflow-hidden
    shadow-lg
    transition-transform duration-300 ease-in-out
    ${isMobile ? (open ? 'translate-x-0' : '-translate-x-full') : ''}
  `;

  return (
    <>
      {/* Hamburger only on mobile, in a fixed top-left position */}
      {isMobile && !open && (
        <button
          className="fixed top-4 left-4 z-50 bg-[#03A6A1] p-2 rounded-full text-white shadow-lg focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaBars size={22} />
        </button>
      )}
      {overlay}
      <nav
        className={sidebarClasses}
        style={isMobile ? { position: 'fixed', width: 240 } : { width: 224 }}
        onMouseEnter={() => { if (!isMobile) setExpanded(true); }}
        onMouseLeave={() => { if (!isMobile) setExpanded(true); }}
        aria-label="Sidebar navigation"
      >
        {/* Top bar: role label and close button on mobile */}
        <div className="flex items-center justify-between px-4 py-3 mb-4">
          <span className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} transition-all duration-300`}>{roleLabel}</span>
          {isMobile && open && (
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white focus:outline-none" aria-label="Close sidebar">
              <FaTimes size={22} />
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => handleSidebarItemClick(item)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${fontSize} ${selected === item.key ? 'bg-[#FFA673] text-white' : 'hover:bg-[#FFA673]/80'} justify-start`}
              style={{ minWidth: 0 }}
            >
              <span className="flex-shrink-0 leading-none m-0 p-0" style={{ fontSize: iconSize }}>{item.icon}</span>
              <span className="whitespace-nowrap leading-none m-0 p-0" style={{ fontSize: labelSize }}>{item.label}</span>
            </button>
          ))}
        </div>
        {/* My Profile and Logout at the bottom */}
        <div className="flex flex-col gap-1 mb-4 mt-auto">
          <button
            onClick={() => handleSidebarItemClick({ label: 'My Profile', icon: <FaUserCircle />, key: 'profile' })}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${fontSize} hover:bg-[#FFA673]/80 justify-start`}
          >
            <span className="flex-shrink-0 leading-none m-0 p-0" style={{ fontSize: iconSize }}><FaUserCircle /></span>
            <span className="whitespace-nowrap leading-none m-0 p-0" style={{ fontSize: labelSize }}>My Profile</span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${fontSize} hover:bg-[#FFA673]/80 justify-start`}
          >
            <span className="text-[#FF4F0F] flex-shrink-0 leading-none m-0 p-0" style={{ fontSize: iconSize }}><FaSignOutAlt /></span>
            <span className="whitespace-nowrap leading-none m-0 p-0" style={{ fontSize: labelSize }}>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;

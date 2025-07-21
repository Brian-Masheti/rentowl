import React from 'react';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const MobileDashboardView = ({
  menuItems = [],
  sectionTitles = {},
  sectionContent = {},
  dashboardLabel = 'Dashboard',
  selectedSection = 'dashboard',
  setSelectedSection = () => {},
  sidebarBgColor = '#03A6A1',
}: {
  menuItems?: { label: string; icon: React.ReactNode; key?: string; action?: () => void }[];
  sectionTitles?: Record<string, string>;
  sectionContent?: Record<string, React.ReactNode>;
  dashboardLabel?: string;
  selectedSection?: string;
  setSelectedSection?: (section: string) => void;
  sidebarBgColor?: string;
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Only render on mobile
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  // Add Profile and Logout to the menu
  const fullMenu = [
    ...menuItems,
    { label: 'Profile', icon: <FaUserCircle />, action: () => { setSelectedSection('profile'); setSidebarOpen(false); } },
    { label: 'Logout', icon: <FaSignOutAlt />, action: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; } },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FFE3BB', position: 'relative' }}>
      {/* Hamburger menu */}
      <button
        className="fixed top-4 left-4 z-50 bg-[#03A6A1] p-2 rounded-full text-white shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 50 }}
      >
        <FaBars size={22} />
      </button>

      {/* Sidebar drawer */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(255, 227, 187, 0.85)' }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
          {/* Sidebar */}
          <nav
            className="fixed top-0 left-0 h-full z-50 text-white shadow-lg transition-transform duration-300 ease-in-out"
            style={{ width: 240, minHeight: '100vh', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', background: sidebarBgColor }}
          >
            <div className="flex items-center justify-between px-4 py-3 mb-4">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white focus:outline-none" aria-label="Close sidebar">
                <FaTimes size={22} />
              </button>
            </div>
            {/* Sidebar menu with animation */}
            <div className="flex-1 flex flex-col gap-1 px-4">
              {fullMenu.map((item, idx) => (
                <div
                  key={item.label}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.key) {
                      setSelectedSection(item.key);
                      setSidebarOpen(false);
                    } else {
                      setSelectedSection(item.label.toLowerCase().replace(/ /g, '-'));
                      setSidebarOpen(false);
                    }
                  }}
                  style={{
                    opacity: 0,
                    transform: 'translateX(-32px)',
                    animation: `sidebarWaveIn 0.4s cubic-bezier(.4,1.7,.7,1) forwards`,
                    animationDelay: `${0.08 * idx + 0.08}s`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </nav>
          {/* Animation keyframes */}
          <style>{`
            @keyframes sidebarWaveIn {
              from { opacity: 0; transform: translateX(-32px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>
        </>
      )}
      {/* Main content synced with desktop */}
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
            {sectionTitles[selectedSection] || dashboardLabel}
          </h1>
          <div style={{ color: '#23272F', fontSize: 16, background: '#FFF', padding: '12px 24px', borderRadius: 8, border: '2px solid #FFA673', minHeight: 120 }}>
            {sectionContent[selectedSection] || <p>Section coming soon.</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MobileDashboardView;

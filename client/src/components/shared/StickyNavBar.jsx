import React from 'react';

// Expects: label (string), icon (React element, optional)
const StickyNavBar = ({ label, icon }) => (
  <nav
    className="sticky top-0 z-30 w-full bg-white border-b border-orange-200 flex items-center px-4 py-2 shadow-sm"
    style={{ minHeight: 56 }}
  >
    {icon && <span className="mr-2 text-xl">{icon}</span>}
    <span className="font-semibold text-lg text-orange-600 truncate">{label}</span>
  </nav>
);

export default StickyNavBar;

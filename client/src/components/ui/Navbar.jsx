import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../../constants/colors';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white/90 border-b border-gray-200 fixed top-0 left-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo2.png" alt="RentOwl Logo" className="h-10 w-10" />
          <span className="font-extrabold text-xl" style={{ color: COLORS.primary }}>RentOwl</span>
        </Link>
        <div className="hidden md:flex gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="font-semibold text-base hover:text-[#FFA673] transition-colors"
              style={{ color: COLORS.primary }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-[#03A6A1] mb-1 transition-transform duration-300 ${open ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[#03A6A1] mb-1 transition-opacity duration-300 ${open ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[#03A6A1] transition-transform duration-300 ${open ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </div>
      {/* Mobile menu */}
      <div
        className={`md:hidden fixed top-16 left-0 w-full bg-white/95 shadow-lg transition-transform duration-300 z-40 ${open ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <div className="flex flex-col items-center gap-6 py-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="font-semibold text-lg hover:text-[#FFA673] transition-colors"
              style={{ color: COLORS.primary }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

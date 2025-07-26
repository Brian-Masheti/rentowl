import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white font-bold transition-all
        ${type === 'success' ? 'bg-[#03A6A1]' : 'bg-[#FF4F0F]'}`}
      style={{ minWidth: 200 }}
    >
      {message}
      <button
        className="ml-4 text-lg font-bold text-white/80 hover:text-white focus:outline-none"
        onClick={onClose}
        aria-label="Close toast"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;

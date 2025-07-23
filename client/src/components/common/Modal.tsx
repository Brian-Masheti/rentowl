import React, { useEffect, useRef, useCallback } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string; // e.g. 'max-w-lg', 'max-w-2xl'
  backdropClass?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, widthClass = 'max-w-lg', backdropClass = 'bg-black/60' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    // Use capture phase and non-passive for instant response
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${backdropClass}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`relative bg-white rounded-2xl shadow-lg p-6 w-full ${widthClass}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-2xl text-[#03A6A1] hover:text-[#FFA673] font-bold focus:outline-none z-10"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

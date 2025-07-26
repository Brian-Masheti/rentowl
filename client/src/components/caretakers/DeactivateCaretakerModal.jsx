import React from 'react';

const DeactivateCaretakerModal = ({ open, onClose, onConfirm, caretaker }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full relative text-center">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-[#FFA673]">Deactivate Caretaker</h2>
        <p className="mb-4 text-[#23272F]">
          Are you sure you want to deactivate <span className="font-bold text-[#03A6A1]">{caretaker?.firstName} {caretaker?.lastName}</span>?<br/>
          They will not be able to log in or be assigned until reactivated.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <button
            className="px-4 py-2 rounded border border-[#FFA673] text-[#FFA673] bg-white font-bold hover:bg-[#FFA673] hover:text-white transition-colors duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition-colors duration-200"
            onClick={onConfirm}
          >
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateCaretakerModal;

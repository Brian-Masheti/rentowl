import React from 'react';

const DeactivatePropertyModal = ({ open, onClose, property, onSuccess }) => {
  if (!open || !property) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-[#FF4F0F]">Deactivate Property</h2>
        <p className="mb-4">Are you sure you want to deactivate <b>{property.name}</b>?</p>
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 rounded border border-[#FFA673] text-[#FFA673] bg-white font-bold hover:bg-[#FFA673] hover:text-white transition" onClick={onClose}>Cancel</button>
          <button className="bg-[#FF4F0F] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition" onClick={onClose}>Deactivate</button>
        </div>
      </div>
    </div>
  );
};

export default DeactivatePropertyModal;

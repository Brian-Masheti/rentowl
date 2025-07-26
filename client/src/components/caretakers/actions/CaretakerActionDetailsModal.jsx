import React from 'react';

const CaretakerActionDetailsModal = ({ open, onClose, action }) => {
  if (!open || !action) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Caretaker Action Details</h2>
        <div className="mb-2">
          <span className="font-semibold">Caretaker:</span> {action.caretaker?.firstName} {action.caretaker?.lastName}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Action Type:</span> {action.actionType.replace(/_/g, ' ')}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Property:</span> {action.property?.name || '-'}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Status:</span> {action.status.replace('_', ' ')}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Date:</span> {new Date(action.createdAt).toLocaleString()}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Description:</span>
          <div className="bg-gray-100 rounded p-2 mt-1 text-gray-700 text-sm">{action.description}</div>
        </div>
        <button
          className="mt-4 px-4 py-2 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition-colors duration-200"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CaretakerActionDetailsModal;

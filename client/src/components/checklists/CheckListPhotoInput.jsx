import React from 'react';
const CheckListPhotoInput = ({ photo, onChange, onRemove, canEdit = true }) => {
  // If not editable, just show the photo preview if available
  if (!canEdit) {
    return photo ? (
      <img src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)} alt="Preview" className="w-16 h-16 object-cover rounded border" />
    ) : null;
  }
  return (
    <div className="flex flex-col items-start gap-2">
      {photo ? (
        <div className="flex items-center gap-2">
          <img src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)} alt="Preview" className="w-16 h-16 object-cover rounded border" />
          <button type="button" className="text-red-600 text-xs font-bold px-2 py-1 rounded bg-red-100 hover:bg-red-200" onClick={onRemove}>Remove</button>
        </div>
      ) : (
        <button
          type="button"
          className="bg-[#03A6A1] text-white px-3 py-1 rounded font-semibold hover:bg-[#FFA673] text-xs"
          onClick={() => document.getElementById('photo-input-temp').click()}
        >
          Choose Photo
        </button>
      )}
      <input
        id="photo-input-temp"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => onChange(e.target.files[0])}
      />
    </div>
  );
};

export default CheckListPhotoInput;

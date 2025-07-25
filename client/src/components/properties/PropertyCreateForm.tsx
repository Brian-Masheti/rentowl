import React, { useState } from 'react';

interface PropertyCreateFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const DEFAULT_UNIT_TYPES = [
  'Bedsitter',
  'Studio',
  'Single Room',
  'Double Room',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  'Condominium',
  'Loft',
  'Other',
];

const PropertyCreateForm: React.FC<PropertyCreateFormProps> = ({ onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // New state for units
  const [isUniform, setIsUniform] = useState<'yes' | 'no' | ''>('');
  const [units, setUnits] = useState([
    { type: '', count: '', rent: '' }
  ]);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Profile picture must be a PNG or JPEG image.');
      return;
    }
    setProfilePic(file || null);
    setProfilePicPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => ['image/png', 'image/jpeg', 'image/jpg'].includes(f.type));
    if (validFiles.length !== files.length) {
      setError('All gallery images must be PNG or JPEG.');
      return;
    }
    setGallery(validFiles);
    setGalleryPreviews(validFiles.map(f => URL.createObjectURL(f)));
  };

  const handleUnitChange = (idx: number, field: 'type' | 'count' | 'rent', value: string) => {
    setUnits(prev => prev.map((u, i) => i === idx ? { ...u, [field]: value } : u));
  };

  const handleAddUnit = () => {
    setUnits(prev => [...prev, { type: '', count: '', rent: '' }]);
  };

  const handleRemoveUnit = (idx: number) => {
    setUnits(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Validate required fields
    if (!name.trim() || !address.trim()) {
      setError('Property name and address are required.');
      setLoading(false);
      return;
    }

    // Validate units
    const filteredUnits = units.filter(u => u.type && u.count && u.rent);
    if (filteredUnits.length === 0) {
      setError('Please specify at least one unit type with count and rent.');
      setLoading(false);
      return;
    }
    // Ensure all units have valid numbers
    const unitsPayload = filteredUnits.map(u => ({
      type: u.type,
      count: Number(u.count),
      rent: Number(u.rent),
    }));
    if (unitsPayload.some(u => !u.type || isNaN(u.count) || isNaN(u.rent) || u.count <= 0 || u.rent < 0)) {
      setError('Each unit must have a type, a positive count, and a non-negative rent.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name); // <-- FIXED: use 'name' to match backend
      formData.append('address', address);
      formData.append('description', description);
      formData.append('units', JSON.stringify(unitsPayload));
      if (profilePic) formData.append('profilePic', profilePic);
      gallery.forEach(file => formData.append('gallery', file));
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/properties`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create property');
      }
      setSuccess(true);
      setName('');
      setAddress('');
      setDescription('');
      setProfilePic(null);
      setGallery([]);
      setProfilePicPreview(null);
      setGalleryPreviews([]);
      setUnits([{ type: '', count: '', rent: '' }]);
      setIsUniform('');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create property');
      } else {
        setError('Failed to create property');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl w-full mx-auto flex flex-col gap-4 relative">
      {onClose && (
        <button
          type="button"
          className="absolute top-2 right-2 text-2xl text-[#03A6A1] hover:text-[#FFA673] font-bold focus:outline-none z-10"
          onClick={onClose}
          aria-label="Close property form"
        >
          &times;
        </button>
      )}
      <h2 className="text-xl font-bold mb-2 text-[#03A6A1]">Add New Property</h2>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">Property created successfully!</div>}
      <div>
        <label className="block font-semibold mb-1">Property Name</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Address</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Does this property have only one type of unit?</label>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="isUniform"
              value="yes"
              checked={isUniform === 'yes'}
              onChange={() => {
                setIsUniform('yes');
                setUnits([{ type: '', count: '', rent: '' }]);
              }}
              required
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="isUniform"
              value="no"
              checked={isUniform === 'no'}
              onChange={() => {
                setIsUniform('no');
                setUnits([{ type: '', count: '', rent: '' }]);
              }}
              required
            />
            No (Mixed units)
          </label>
        </div>
      </div>
      {isUniform && (
        <div className="flex flex-col gap-2 border p-3 rounded bg-[#F8F8F8]">
          {units.map((unit, index) => (
            <div key={index} className="flex flex-wrap gap-2 items-end border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
              <div>
                <label className="block text-sm font-semibold mb-1">Unit Type</label>
                <select
                  className="border rounded px-2 py-1"
                  value={unit.type}
                  onChange={e => handleUnitChange(index, 'type', e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  {DEFAULT_UNIT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Number of Units</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1"
                  value={unit.count}
                  onChange={e => handleUnitChange(index, 'count', e.target.value)}
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Rent per Unit</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1"
                  value={unit.rent}
                  onChange={e => handleUnitChange(index, 'rent', e.target.value)}
                  min={0}
                  required
                />
              </div>
              {/* Only show remove/add buttons for mixed units */}
              {isUniform === 'no' && units.length > 1 && (
                <button
                  type="button"
                  className="ml-2 text-[#FF4F0F] font-bold text-lg"
                  onClick={() => handleRemoveUnit(index)}
                  aria-label="Remove unit type"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          {/* Only show add button for mixed units */}
          {isUniform === 'no' && (
            <button
              type="button"
              className="bg-[#03A6A1] text-white px-3 py-1 rounded hover:bg-[#FFA673] transition font-semibold mt-2"
              onClick={handleAddUnit}
            >
              + Add Another Unit Type
            </button>
          )}
        </div>
      )}
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Profile Picture (PNG/JPEG, optional)</label>
        <div className="flex items-center gap-2">
          <input
            id="profilePicInput"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleProfilePicChange}
            className="hidden"
          />
          <button
            type="button"
            className="bg-[#03A6A1] text-white px-4 py-2 rounded hover:bg-[#FFA673] transition font-semibold"
            onClick={() => document.getElementById('profilePicInput')?.click()}
          >
            {profilePic ? 'Change' : 'Upload'} Profile Picture
          </button>
          <span className="text-xs text-gray-600">
            {profilePic ? profilePic.name : 'No file chosen'}
          </span>
        </div>
        {profilePicPreview && (
          <div className="relative inline-block mt-2">
            <img src={profilePicPreview} alt="Profile Preview" className="h-24 w-24 object-cover rounded shadow" />
            <button
              type="button"
              className="absolute top-1 right-1 bg-white/80 text-[#FF4F0F] rounded-full w-6 h-6 flex items-center justify-center font-bold shadow hover:bg-[#FFA673]"
              onClick={() => { setProfilePic(null); setProfilePicPreview(null); }}
              aria-label="Remove profile pic"
            >
              &times;
            </button>
          </div>
        )}
      </div>
      <div>
        <label className="block font-semibold mb-1">Gallery Images (PNG/JPEG, optional, up to 10)</label>
        <div className="flex items-center gap-2">
          <input
            id="galleryInput"
            type="file"
            accept="image/png, image/jpeg"
            multiple
            onChange={handleGalleryChange}
            className="hidden"
          />
          <button
            type="button"
            className="bg-[#03A6A1] text-white px-4 py-2 rounded hover:bg-[#FFA673] transition font-semibold"
            onClick={() => document.getElementById('galleryInput')?.click()}
          >
            Upload Gallery Images
          </button>
          <span className="text-xs text-gray-600">
            {gallery.length > 0 ? `${gallery.length} file(s) selected` : 'No files chosen'}
          </span>
        </div>
        {galleryPreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {galleryPreviews.map((src) => (
            <div key={src} className="relative inline-block">
            <img src={src} alt="Gallery Preview" className="h-16 w-16 object-cover rounded shadow" />
            <button
            type="button"
            className="absolute top-1 right-1 bg-white/80 text-[#FF4F0F] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow hover:bg-[#FFA673]"
            onClick={() => {
            setGallery(gallery.filter((_, i) => galleryPreviews[i] !== src));
            setGalleryPreviews(galleryPreviews.filter((s) => s !== src));
            }}
            aria-label="Remove gallery image"
            >
            &times;
            </button>
            </div>
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Property'}
      </button>
    </form>
  );
};

export default PropertyCreateForm;

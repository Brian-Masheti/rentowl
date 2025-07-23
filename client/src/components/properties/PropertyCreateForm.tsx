import React, { useState } from 'react';

interface PropertyCreateFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const PropertyCreateForm: React.FC<PropertyCreateFormProps> = ({ onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [description, setDescription] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '';
  console.log('API_URL for property creation:', API_URL);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('address', address);
      formData.append('rentAmount', rentAmount);
      formData.append('description', description);
      if (profilePic) formData.append('profilePic', profilePic);
      gallery.forEach((file, idx) => formData.append('gallery', file));
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
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create property');
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
        <label className="block font-semibold mb-1">Rent Amount</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
          value={rentAmount}
          onChange={e => setRentAmount(e.target.value)}
          required
          min={0}
        />
      </div>
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
            {galleryPreviews.map((src, idx) => (
              <div key={idx} className="relative inline-block">
                <img src={src} alt={`Gallery Preview ${idx + 1}`} className="h-16 w-16 object-cover rounded shadow" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white/80 text-[#FF4F0F] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow hover:bg-[#FFA673]"
                  onClick={() => {
                    setGallery(gallery.filter((_, i) => i !== idx));
                    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== idx));
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

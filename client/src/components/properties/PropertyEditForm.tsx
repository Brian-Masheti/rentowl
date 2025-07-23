import React, { useState } from 'react';

interface PropertyEditFormProps {
  property: any;
  onSuccess: () => void;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';
const getImageUrl = (img: string) => {
  let url = img.replace(/\\/g, '/');
  if (url.startsWith('uploads/') || url.startsWith('server/uploads/')) {
    url = `${API_URL}/${url.replace('server/', '')}`;
  }
  return url;
};

const PropertyEditForm: React.FC<PropertyEditFormProps> = ({ property, onSuccess, onClose }) => {
  const [name, setName] = useState(property.name || '');
  const [address, setAddress] = useState(property.address || '');
  const [rentAmount, setRentAmount] = useState(property.rentAmount || '');
  const [description, setDescription] = useState(property.description || '');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(property.profilePic ? property.profilePic : null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]); // Only for new uploads
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      const res = await fetch(`${API_URL}/api/properties/${property._id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update property');
      }
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl w-full mx-auto flex flex-col gap-4 relative">
      <button
        type="button"
        className="absolute top-2 right-2 text-2xl text-[#03A6A1] hover:text-[#FFA673] font-bold focus:outline-none z-10"
        onClick={onClose}
        aria-label="Close edit form"
      >
        &times;
      </button>
      <h2 className="text-xl font-bold mb-2 text-[#03A6A1]">Edit Property</h2>
      {/* Show and edit current images */}
      <div className="flex flex-col gap-4 mb-4">
        {/* Profile Pic */}
        <div className="flex items-center gap-4">
          {property.profilePic && !profilePicPreview && (
            <div className="relative inline-block">
              <img src={getImageUrl(property.profilePic)} alt="Current Profile" className="h-24 w-24 object-cover rounded shadow" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-white/80 text-[#FF4F0F] rounded-full w-6 h-6 flex items-center justify-center font-bold shadow hover:bg-[#FFA673]"
                onClick={() => { property.profilePic = null; setProfilePicPreview(null); setProfilePic(null); }}
                aria-label="Remove profile pic"
              >
                &times;
              </button>
              <button
                type="button"
                className="absolute bottom-1 right-1 bg-[#03A6A1] text-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow hover:bg-[#FFA673]"
                onClick={() => document.getElementById('editProfilePicInput')?.click()}
                aria-label="Edit profile pic"
              >
                ✎
              </button>
            </div>
          )}
          {/* New profile pic preview (only if user selects a new one) */}
          {profilePicPreview && profilePic && (
            <div className="relative inline-block">
              <img src={profilePicPreview} alt="New Profile Pic" className="h-24 w-24 object-cover rounded shadow" />
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
          <input
            id="editProfilePicInput"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleProfilePicChange}
            className="hidden"
          />
          <button
            type="button"
            className="bg-[#03A6A1] text-white px-4 py-2 rounded hover:bg-[#FFA673] transition font-semibold"
            onClick={() => document.getElementById('editProfilePicInput')?.click()}
          >
            {profilePic ? 'Change' : property.profilePic ? 'Replace' : 'Upload'} Profile Picture
          </button>
        </div>
        {/* Gallery Images */}
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {property.gallery && property.gallery.length > 0 && property.gallery.map((img: string, idx: number) => (
              <div key={idx} className="relative inline-block">
                <img src={getImageUrl(img)} alt={`Gallery ${idx + 1}`} className="h-16 w-16 object-cover rounded shadow" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white/80 text-[#FF4F0F] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow hover:bg-[#FFA673]"
                  onClick={() => { property.gallery.splice(idx, 1); setGalleryPreviews([...galleryPreviews]); }}
                  aria-label="Remove gallery image"
                >
                  &times;
                </button>
              </div>
            ))}
            {galleryPreviews.length > 0 && galleryPreviews.map((src, idx) => (
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
          <input
            id="editGalleryInput"
            type="file"
            accept="image/png, image/jpeg"
            multiple
            onChange={handleGalleryChange}
            className="hidden"
          />
          <button
            type="button"
            className="bg-[#03A6A1] text-white px-4 py-2 rounded hover:bg-[#FFA673] transition font-semibold"
            onClick={() => document.getElementById('editGalleryInput')?.click()}
          >
            + Add Gallery Images
          </button>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">Property updated successfully!</div>}
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
      <button
        type="submit"
        className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition"
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Property'}
      </button>
    </form>
  );
};

export default PropertyEditForm;

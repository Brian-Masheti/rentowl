import React, { useState } from 'react';

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

const PropertyCreateForm = ({ onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isUniform, setIsUniform] = useState('');
  // Uniform
  const [uniformType, setUniformType] = useState('');
  const [uniformRent, setUniformRent] = useState('');
  const [uniformFloors, setUniformFloors] = useState(1);
  // Per-floor unit counts for uniform properties
  const [uniformUnitsPerFloor, setUniformUnitsPerFloor] = useState([{ floor: 'Ground', count: '' }]);
  // Fix: Add numFloors state for setNumFloors
  const [numFloors, setNumFloors] = useState(1);
  // Mixed
  const [floors, setFloors] = useState([
    { name: 'Ground', units: [{ type: '', count: '', rent: '' }] }
  ]);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file && !['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Profile picture must be a PNG or JPEG image.');
      return;
    }
    setProfilePic(file || null);
    setProfilePicPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => ['image/png', 'image/jpeg', 'image/jpg'].includes(f.type));
    if (validFiles.length !== files.length) {
      setError('All gallery images must be PNG or JPEG.');
      return;
    }
    setGallery(validFiles);
    setGalleryPreviews(validFiles.map(f => URL.createObjectURL(f)));
  };

  // Mixed logic
  const handleFloorChange = (idx, field, value) => {
    setFloors(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));
  };
  const handleUnitChange = (floorIdx, unitIdx, field, value) => {
    setFloors(prev => prev.map((f, i) =>
      i === floorIdx
        ? { ...f, units: f.units.map((u, j) => j === unitIdx ? { ...u, [field]: value } : u) }
        : f
    ));
  };
  const handleAddFloor = () => {
    setFloors(prev => [...prev, { name: '', units: [{ type: '', count: '', rent: '' }] }]);
  };
  const handleRemoveFloor = (idx) => {
    setFloors(prev => prev.filter((_, i) => i !== idx));
  };
  const handleAddUnit = (floorIdx) => {
    setFloors(prev => prev.map((f, i) =>
      i === floorIdx ? { ...f, units: [...f.units, { type: '', count: '', rent: '' }] } : f
    ));
  };
  const handleRemoveUnit = (floorIdx, unitIdx) => {
    setFloors(prev => prev.map((f, i) =>
      i === floorIdx ? { ...f, units: f.units.filter((_, j) => j !== unitIdx) } : f
    ));
  };
  // Map unit type to code
  const typeCodeMap = {
    'Bedsitter': 'B',
    'Studio': 'S',
    'Single Room': 'SR',
    'Double Room': 'DR',
    '1 Bedroom': '1B',
    '2 Bedroom': '2B',
    '3 Bedroom': '3B',
    'Condominium': 'C',
    'Loft': 'L',
    'Other': 'O',
  };
  // Generate labels like GB1, G1B1, FB1, F1B1, 2FB1, 2F1B1, etc.
  const generateUnitLabel = (floorName, type, idx) => {
    let floorCode = '';
    if (floorName.toLowerCase().startsWith('ground')) floorCode = 'G';
    else if (floorName.toLowerCase().startsWith('first')) floorCode = 'F';
    else {
      const match = floorName.match(/(\d+)/);
      if (match) floorCode = `${match[1]}F`;
      else floorCode = floorName[0].toUpperCase();
    }
    const typeCode = typeCodeMap[type] || type[0].toUpperCase();
    return `${floorCode}${typeCode}${idx + 1}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    if (!name.trim() || !address.trim()) {
      setError('Property name and address are required.');
      setLoading(false);
      return;
    }
    // Build grouped-by-floor structure for backend
    let groupedUnits = [];
    if (isUniform === 'yes') {
      if (!uniformType || !uniformRent || !uniformFloors || uniformUnitsPerFloor.some(f => !f.count)) {
        setError('Please specify unit type, rent, number of floors, and units per floor.');
        setLoading(false);
        return;
      }
      groupedUnits = uniformUnitsPerFloor.map((floorObj, f) => {
        const floorName = floorObj.floor;
        const unitsOnThisFloor = Number(floorObj.count);
        const unitsArr = [];
        for (let i = 0; i < unitsOnThisFloor; i++) {
          unitsArr.push({
            label: generateUnitLabel(floorName, uniformType, i),
            type: uniformType,
            rent: Number(uniformRent),
            status: 'vacant',
            tenant: null
          });
        }
        return { floor: floorName, units: unitsArr };
      }).filter(floorObj => floorObj.units.length > 0);
    } else if (isUniform === 'no') {
      groupedUnits = floors.map(floor => {
        if (!floor.name) {
          setError('Each floor must have a name.');
          setLoading(false);
          return null;
        }
        const unitsArr = [];
        for (const unit of floor.units) {
          if (!unit.type || !unit.count || !unit.rent) {
            setError('Each unit must have a type, count, and rent.');
            setLoading(false);
            return null;
          }
          for (let i = 0; i < Number(unit.count); i++) {
            unitsArr.push({
              label: generateUnitLabel(floor.name, unit.type, i),
              type: unit.type,
              rent: Number(unit.rent),
              status: 'vacant',
              tenant: null
            });
          }
        }
        return { floor: floor.name, units: unitsArr };
      }).filter(floorObj => floorObj && floorObj.units.length > 0);
    } else {
      setError('Please select if the property is uniform or mixed.');
      setLoading(false);
      return;
    }
    if (groupedUnits.length === 0) {
      setError('Please specify at least one unit for the property.');
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('address', address);
      formData.append('description', description);
      formData.append('units', JSON.stringify(groupedUnits));
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
      setFloors([{ name: 'Ground', units: [{ type: '', count: '', rent: '' }] }]);
      setNumFloors(1);
      setIsUniform('');
      setUniformType('');
      setUniformRent('');
      setUniformFloors(1);
      setUniformUnitsPerFloor([{ floor: 'Ground', count: '' }]);
      if (onSuccess) onSuccess();
      if (onClose) onClose(); // Auto-close the form after success
    } catch (err) {
      setError(err.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-4xl w-full mx-auto flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto">
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
                setUniformType('');
                setUniformRent('');
                setUniformFloors(1);
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
                setFloors([{ name: 'Ground', units: [{ type: '', count: '', rent: '' }] }]);
              }}
              required
            />
            No (Mixed units)
          </label>
        </div>
      </div>
      {isUniform === 'yes' && (
        <div className="flex flex-col gap-2 border p-3 rounded bg-[#F8F8F8]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold mb-1">Unit Type</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={uniformType}
                onChange={e => setUniformType(e.target.value)}
                required
              >
                <option value="">Select type</option>
                {DEFAULT_UNIT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Rent per Unit</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={uniformRent}
                onChange={e => setUniformRent(e.target.value)}
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Number of Floors</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={uniformFloors}
                onChange={e => {
                  const val = Number(e.target.value);
                  setUniformFloors(val);
                  // Update per-floor units array
                  setUniformUnitsPerFloor(prev => {
                    const arr = [...prev];
                    if (val > arr.length) {
                      for (let i = arr.length; i < val; i++) {
                        arr.push({ floor: i === 0 ? 'Ground' : i === 1 ? 'First' : `${i}F`, count: '' });
                      }
                    } else if (val < arr.length) {
                      arr.length = val;
                    }
                    // Always update floor names
                    for (let i = 0; i < arr.length; i++) {
                      arr[i].floor = i === 0 ? 'Ground' : i === 1 ? 'First' : `${i}F`;
                    }
                    return arr;
                  });
                }}
                min={1}
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">Units Per Floor</label>
            <div className="flex flex-col gap-2">
              {uniformUnitsPerFloor.map((f, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="w-20 font-semibold">{f.floor}</span>
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-32"
                    value={f.count}
                    onChange={e => {
                      const val = e.target.value;
                      setUniformUnitsPerFloor(prev => prev.map((item, i) => i === idx ? { ...item, count: val } : item));
                    }}
                    min={1}
                    required
                  />
                  <span>units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {isUniform === 'no' && floors.map((floor, floorIdx) => (
        <div key={floorIdx} className="border p-3 rounded bg-[#F8F8F8] mb-2">
          <div className="flex gap-2 items-center mb-2">
            <label className="block text-sm font-semibold">Floor Name/Label</label>
            <input
              type="text"
              className="border rounded px-2 py-1"
              value={floor.name}
              onChange={e => handleFloorChange(floorIdx, 'name', e.target.value)}
              placeholder={floorIdx === 0 ? 'Ground' : `Floor ${floorIdx + 1}`}
              required
            />
            {floors.length > 1 && (
              <button type="button" className="ml-2 text-[#FF4F0F] font-bold text-lg" onClick={() => handleRemoveFloor(floorIdx)} aria-label="Remove floor">&times;</button>
            )}
          </div>
          {floor.units.map((unit, unitIdx) => (
            <div key={unitIdx} className="flex flex-wrap gap-2 items-end mb-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Unit Type</label>
                <select
                  className="border rounded px-2 py-1"
                  value={unit.type}
                  onChange={e => handleUnitChange(floorIdx, unitIdx, 'type', e.target.value)}
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
                  onChange={e => handleUnitChange(floorIdx, unitIdx, 'count', e.target.value)}
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
                  onChange={e => handleUnitChange(floorIdx, unitIdx, 'rent', e.target.value)}
                  min={0}
                  required
                />
              </div>
              {floor.units.length > 1 && (
                <button type="button" className="ml-2 text-[#FF4F0F] font-bold text-lg" onClick={() => handleRemoveUnit(floorIdx, unitIdx)} aria-label="Remove unit">&times;</button>
              )}
            </div>
          ))}
          <button type="button" className="bg-[#03A6A1] text-white px-3 py-1 rounded hover:bg-[#FFA673] transition font-semibold mt-2" onClick={() => handleAddUnit(floorIdx)}>
            + Add Another Unit
          </button>
        </div>
      ))}
      {isUniform === 'no' && (
        <button type="button" className="bg-[#FFA673] text-white px-3 py-1 rounded hover:bg-[#03A6A1] transition font-semibold mt-2" onClick={handleAddFloor}>
          + Add Another Floor
        </button>
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
      <div className="sticky bottom-0 left-0 bg-white pt-4 pb-2 z-20 flex justify-end">
        <button
          type="submit"
          className="bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Property'}
        </button>
      </div>
    </form>
  );
};

export default PropertyCreateForm;

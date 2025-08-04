import React, { useState, useEffect, useRef } from 'react';

// UniformUnitsAdder: quick add multiple units of the same type/rent
function UniformUnitsAdder({ onAdd }) {
  const [count, setCount] = useState('');
  const [type, setType] = useState('');
  const [rent, setRent] = useState('');
  return (
    <div className="flex gap-2 items-center mb-2">
      <input
        className="border rounded px-2 py-1 w-24"
        type="number"
        min={1}
        placeholder="Rooms"
        value={count}
        onChange={e => setCount(e.target.value)}
      />
      <select
        className="border rounded px-2 py-1 w-28"
        value={type}
        onChange={e => setType(e.target.value)}
      >
        <option value="">Type</option>
        <option value="Bedsitter">Bedsitter</option>
        <option value="Studio">Studio</option>
        <option value="1 Bedroom">1 Bedroom</option>
        <option value="2 Bedroom">2 Bedroom</option>
        <option value="3 Bedroom">3 Bedroom</option>
        <option value="4 Bedroom">4 Bedroom</option>
        <option value="Penthouse">Penthouse</option>
        <option value="Other">Other</option>
      </select>
      <input
        className="border rounded px-2 py-1 w-28"
        type="number"
        min={0}
        placeholder="Rent"
        value={rent}
        onChange={e => setRent(e.target.value)}
      />
      <button
        className="bg-[#03A6A1] text-white px-3 py-1 rounded-full font-bold hover:bg-[#FFA673] transition"
        disabled={!count || !type || !rent}
        onClick={() => {
          onAdd(Number(count), type, rent);
          setCount(''); setType(''); setRent('');
        }}
      >
        Add
      </button>
    </div>
  );
}

const defaultUnit = { type: '', rent: '', label: '', status: 'vacant' };

const EditPropertyModal = ({ open, onClose, property, onSuccess }) => {
  const [form, setForm] = useState(() => property ? {
    name: property.name || '',
    address: property.address || '',
    description: property.description || '',
    units: property.units ? JSON.parse(JSON.stringify(property.units)) : [],
  } : { name: '', address: '', description: '', units: [] });
  const [activeFloor, setActiveFloor] = useState(0);
  const [coverFile, setCoverFile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || '';
  const getImageUrl = (img) => {
    if (!img) return '';
    let url = img.replace(/\\/g, '/');
    if (url.startsWith('uploads/') || url.startsWith('server/uploads/')) {
      url = `${API_URL}/${url.replace('server/', '')}`;
    }
    return url;
  };
  // Always use getImageUrl for cover image
  const [coverPreview, setCoverPreview] = useState(property && property.profilePic ? getImageUrl(property.profilePic) : null);
  useEffect(() => {
    if (property && property.profilePic) {
      setCoverPreview(getImageUrl(property.profilePic));
    }
  }, [property]);
  // Use galleryThumbs for thumbnails, gallery for full images
  const [galleryThumbs, setGalleryThumbs] = useState(
    property && property.galleryThumbs
      ? property.galleryThumbs.map(getImageUrl)
      : []
  );
  const [galleryFull, setGalleryFull] = useState(
    property && property.gallery
      ? property.gallery.map(getImageUrl)
      : []
  );
  // Debug: log the URLs being used for images
  // Removed debug logs for gallery URLs
  // For new uploads, use previews
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryViewer, setGalleryViewer] = useState({ open: false, idx: 0 });
  const modalRef = useRef();

  // Prefill form when property changes
  useEffect(() => {
    if (!property) return;
    setForm({
      name: property.name || '',
      address: property.address || '',
      description: property.description || '',
      units: property.units ? JSON.parse(JSON.stringify(property.units)) : [],
    });
    setActiveFloor(0);
    setCoverFile(null);
    setCoverPreview(property.profilePic ? property.profilePic : null);
    setGalleryFiles([]);
    setGalleryPreviews(property.galleryThumbs ? property.galleryThumbs : []);
  }, [property]);

  // Modal close on click outside or Esc, with special handling for gallery viewer
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (galleryViewer.open) {
          setGalleryViewer({ open: false, idx: 0 });
        } else {
          onClose();
        }
      }
    };
    const handleClick = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose, galleryViewer.open]);

  if (!open || !property) return null;

  // Add a new floor
  const addFloor = () => {
    setForm(f => ({ ...f, units: [...f.units, { floor: '', units: [] }] }));
    setActiveFloor(form.units.length);
  };
  // Remove a floor
  const removeFloor = (idx) => {
    setForm(f => ({ ...f, units: f.units.filter((_, i) => i !== idx) }));
    setActiveFloor(0);
  };
  // Add a unit to a floor
  const addUnit = (floorIdx) => {
    setForm(f => {
      const units = [...f.units];
      units[floorIdx].units.push({ ...defaultUnit });
      return { ...f, units };
    });
  };
  // Remove a unit from a floor
  const removeUnit = (floorIdx, unitIdx) => {
    setForm(f => {
      const units = [...f.units];
      units[floorIdx].units = units[floorIdx].units.filter((_, i) => i !== unitIdx);
      return { ...f, units };
    });
  };
  // Update a unit field
  const updateUnit = (floorIdx, unitIdx, field, value) => {
    setForm(f => {
      const units = [...f.units];
      units[floorIdx].units[unitIdx][field] = value;
      return { ...f, units };
    });
  };
  // Update a floor label
  const updateFloorLabel = (floorIdx, value) => {
    setForm(f => {
      const units = [...f.units];
      units[floorIdx].floor = value;
      return { ...f, units };
    });
  };

  // Remove a gallery image preview
  const removeGalleryImage = (idx) => {
    setGalleryPreviews(previews => previews.filter((_, i) => i !== idx));
    setGalleryFiles(files => files.filter((_, i) => i !== idx));
  };

  // Save handler (sends data to backend)
  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('address', form.address);
    formData.append('description', form.description);
    formData.append('units', JSON.stringify(form.units));
    if (coverFile) {
      formData.append('profilePic', coverFile);
    }
    galleryFiles.forEach((file) => {
      formData.append('gallery', file);
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/properties/${property._id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include', // if you use cookies/auth
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) throw new Error('Failed to update property');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert('Error updating property: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Edit Property</h2>
        <div className="mb-4 flex flex-col gap-2">
          <input className="border rounded px-3 py-2 w-full" placeholder="Property Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <textarea className="border rounded px-3 py-2 w-full" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          {/* Cover image upload */}
          <div className="flex items-center gap-3 mt-2">
            <label htmlFor="cover-upload" className="bg-[#03A6A1] text-white rounded-full px-4 py-2 font-bold cursor-pointer hover:bg-[#FFA673] transition shadow">
              {coverPreview ? 'Change Cover Image' : 'Upload Cover Image'}
            </label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  setCoverFile(file);
                  setCoverPreview(URL.createObjectURL(file));
                }
              }}
            />
            {coverPreview && (
              <>
                <img
                  src={getImageUrl(coverPreview)}
                  alt="Cover Preview"
                  className="h-16 w-24 object-cover rounded-xl border border-[#FFA673]/40 cursor-pointer"
                  onClick={() => {
                    const coverUrl = getImageUrl(coverPreview);
                    let idx = galleryPreviews.findIndex(url => url === coverUrl);
                    let newGalleryPreviews = galleryPreviews;
                    if (idx === -1) {
                      newGalleryPreviews = [coverUrl, ...galleryPreviews];
                      setGalleryPreviews(newGalleryPreviews);
                      idx = 0;
                    }
                    setGalleryViewer({ open: true, idx });
                  }}
                  title="Click to view larger"
                />
              </>
            )}
          </div>
          {/* Gallery images upload */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <label htmlFor="gallery-upload" className="bg-[#FFA673] text-white rounded-full px-4 py-2 font-bold cursor-pointer hover:bg-[#03A6A1] transition shadow">
              + Add Gallery Images
            </label>
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files);
                setGalleryFiles(galleryFiles => [...galleryFiles, ...files]);
                setGalleryPreviews(galleryPreviews => [
                  ...galleryPreviews,
                  ...files.map(file => URL.createObjectURL(file))
                ]);
              }}
            />
            {/* Render new uploads if any, otherwise show existing images */}
            {galleryPreviews.length > 0
              ? galleryPreviews.map((img, idx) => (
                  <div key={idx} className="relative inline-block">
                    <img
                      src={img}
                      alt={`Gallery Preview ${idx + 1}`}
                      className="h-12 w-16 object-cover rounded border border-[#FFA673]/40"
                      onClick={() => setGalleryViewer({ open: true, idx })}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.alt = 'Image not found';
                        e.target.style.background = '#eee';
                        e.target.style.color = '#aaa';
                        e.target.style.display = 'flex';
                        e.target.style.alignItems = 'center';
                        e.target.style.justifyContent = 'center';
                        e.target.style.fontSize = '10px';
                        e.target.style.fontWeight = 'bold';
                        e.target.style.content = 'Image not found';
                        console.error('Failed to load image:', img);
                      }}
                    />
                    <button
                      className="absolute -top-2 -right-2 bg-[#FF4F0F] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                      onClick={e => { e.stopPropagation(); removeGalleryImage(idx); }}
                      title="Remove Image"
                    >
                      &times;
                    </button>
                  </div>
                ))
              : (galleryThumbs.length > 0
                ? galleryThumbs.map((img, idx) => (
                    <div key={idx} className="relative inline-block">
                      <img
                        src={img}
                        alt={`Gallery Thumb ${idx + 1}`}
                        className="h-12 w-16 object-cover rounded border border-[#FFA673]/40"
                        onClick={() => setGalleryViewer({ open: true, idx })}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.alt = 'Image not found';
                          e.target.style.background = '#eee';
                          e.target.style.color = '#aaa';
                          e.target.style.display = 'flex';
                          e.target.style.alignItems = 'center';
                          e.target.style.justifyContent = 'center';
                          e.target.style.fontSize = '10px';
                          e.target.style.fontWeight = 'bold';
                          e.target.style.content = 'Image not found';
                          console.error('Failed to load image:', img);
                        }}
                      />
                    </div>
                  ))
                : galleryFull.map((img, idx) => (
                    <div key={idx} className="relative inline-block">
                      <img
                        src={img}
                        alt={`Gallery Image ${idx + 1}`}
                        className="h-12 w-16 object-cover rounded border border-[#FFA673]/40"
                        onClick={() => setGalleryViewer({ open: true, idx })}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.alt = 'Image not found';
                          e.target.style.background = '#eee';
                          e.target.style.color = '#aaa';
                          e.target.style.display = 'flex';
                          e.target.style.alignItems = 'center';
                          e.target.style.justifyContent = 'center';
                          e.target.style.fontSize = '10px';
                          e.target.style.fontWeight = 'bold';
                          e.target.style.content = 'Image not found';
                          console.error('Failed to load image:', img);
                        }}
                      />
                    </div>
                  ))
              )
            }
          </div>
        </div>
        {/* Gallery viewer modal */}
        {galleryViewer.open && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={e => {
              // Only close if the overlay itself is clicked, not the image or controls
              if (e.target === e.currentTarget) setGalleryViewer({ open: false, idx: 0 });
            }}
          >
            <div className="relative">
              <button className="absolute top-2 right-2 text-white text-2xl font-bold z-10" onClick={() => setGalleryViewer({ open: false, idx: 0 })}>&times;</button>
              <button className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-2xl font-bold z-10" onClick={() => setGalleryViewer(v => ({ open: true, idx: (v.idx - 1 + galleryPreviews.length) % galleryPreviews.length }))}>&lt;</button>
              <img src={galleryPreviews[galleryViewer.idx]} alt={`Gallery View ${galleryViewer.idx + 1}`} className="h-64 w-96 object-contain rounded-xl border border-[#FFA673]/40 bg-white" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-2xl font-bold z-10" onClick={() => setGalleryViewer(v => ({ open: true, idx: (v.idx + 1) % galleryPreviews.length }))}>&gt;</button>
            </div>
          </div>
        )}
        <div className="mb-4">
          <div className="flex gap-2 mb-2 items-center">
            <span className="font-bold text-[#03A6A1]">Floors & Units</span>
            <button className="ml-auto bg-[#FFA673] text-white px-3 py-1 rounded-full font-bold hover:bg-[#03A6A1] transition" onClick={addFloor}>+ Add Floor</button>
          </div>
          <div className="flex gap-2 mb-2 flex-wrap">
            {form.units.map((floorObj, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded-full font-bold border ${activeFloor === idx ? 'bg-[#03A6A1] text-white' : 'bg-white text-[#03A6A1] border-[#03A6A1]'}`}
                onClick={() => setActiveFloor(idx)}
              >
                {floorObj.floor || `Floor ${idx + 1}`}
                <span className="ml-2 text-[#FF4F0F] cursor-pointer" onClick={e => { e.stopPropagation(); removeFloor(idx); }} title="Remove Floor">&times;</span>
              </button>
            ))}
          </div>
          {form.units[activeFloor] && (
            <div className="mb-2">
              <input
                className="border rounded px-3 py-2 w-full mb-2"
                placeholder="Floor Label (e.g., Ground, First, 2nd)"
                value={form.units[activeFloor].floor}
                onChange={e => updateFloorLabel(activeFloor, e.target.value)}
              />
              {/* Quick add uniform units */}
              <UniformUnitsAdder
                onAdd={(count, type, rent) => {
                  setForm(f => {
                    const units = [...f.units];
                    for (let i = 0; i < count; i++) {
                      units[activeFloor].units.push({ ...defaultUnit, type, rent });
                    }
                    return { ...f, units };
                  });
                }}
              />
              <div className="flex flex-col gap-2">
                {form.units[activeFloor].units.map((unit, uIdx) => (
                  <div key={uIdx} className="flex gap-2 items-center bg-[#FFF8F0] rounded p-2">
                    <select
                      className="border rounded px-2 py-1 w-28"
                      value={unit.type}
                      onChange={e => updateUnit(activeFloor, uIdx, 'type', e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option value="Bedsitter">Bedsitter</option>
                      <option value="Studio">Studio</option>
                      <option value="1 Bedroom">1 Bedroom</option>
                      <option value="2 Bedroom">2 Bedroom</option>
                      <option value="3 Bedroom">3 Bedroom</option>
                      <option value="4 Bedroom">4 Bedroom</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Other">Other</option>
                    </select>
                    <input className="border rounded px-2 py-1 w-20" placeholder="Rent" type="number" value={unit.rent} onChange={e => updateUnit(activeFloor, uIdx, 'rent', e.target.value)} />
                    {/* Label is autogenerated, display only if present */}
                    {unit.label && (
                      <span className="bg-[#03A6A1]/10 text-[#03A6A1] px-2 py-1 rounded font-semibold text-xs">{unit.label}</span>
                    )}
                    <select className="border rounded px-2 py-1 w-24" value={unit.status} onChange={e => updateUnit(activeFloor, uIdx, 'status', e.target.value)}>
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                    </select>
                    <button className="text-[#FF4F0F] hover:text-[#FFA673] text-lg font-bold px-2" onClick={() => removeUnit(activeFloor, uIdx)} title="Remove Unit">&times;</button>
                  </div>
                ))}
                <button className="bg-[#03A6A1] text-white px-3 py-1 rounded-full font-bold hover:bg-[#FFA673] transition mt-2 w-fit" onClick={() => addUnit(activeFloor)}>+ Add Unit</button>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button className="px-4 py-2 rounded-full border border-[#FFA673] text-[#FFA673] bg-white font-bold hover:bg-[#FFA673] hover:text-white transition" onClick={onClose}>Cancel</button>
          <button className="bg-[#03A6A1] text-white px-4 py-2 rounded-full font-bold hover:bg-[#FFA673] transition" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditPropertyModal;

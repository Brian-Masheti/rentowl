import React, { useEffect, useState } from 'react';
import LazyImage from '../common/LazyImage';
import { FaBuilding, FaEdit, FaTrash } from 'react-icons/fa';
import EditPropertyModal from './EditPropertyModal';
import DeactivatePropertyModal from './DeactivatePropertyModal';

const PropertyList = ({ refreshToken }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/properties`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch properties');
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [API_URL, refreshToken]);

  const getImageUrl = (img) => {
    let url = img.replace(/\\/g, '/');
    if (url.startsWith('uploads/') || url.startsWith('server/uploads/')) {
      url = `${API_URL}/${url.replace('server/', '')}`;
    }
    return url;
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateProperty, setDeactivateProperty] = useState(null);

  if (loading) return <div className="text-center py-10 text-[#03A6A1] font-bold">Loading properties...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (properties.length === 0) return <div className="text-gray-500">No properties found.</div>;

  return (
    <>
      <EditPropertyModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        property={editProperty}
        onSuccess={() => window.location.reload()}
      />
      <DeactivatePropertyModal
        open={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        property={deactivateProperty}
        onSuccess={() => window.location.reload()}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {properties.map((property) => {
        // Flatten all units from all floors
        const allUnits = (property.units || []).flatMap(floorObj => floorObj.units || []);
        // Group units by type and rent
        const grouped = {};
        allUnits.forEach((unit) => {
          const key = `${unit.type}-${unit.rent}`;
          if (!grouped[key]) grouped[key] = { ...unit, total: 0, occupied: 0 };
          grouped[key].total += 1;
          if (unit.status === 'occupied') grouped[key].occupied += 1;
        });
        return (
          <div key={property._id} className="flex flex-col rounded-2xl border border-[#FFA673]/40 bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden relative">
            {/* Colored header bar */}
            <div className="h-3 w-full bg-gradient-to-r from-[#03A6A1] via-[#FFA673] to-[#03A6A1]" />
            <div className="p-5 flex-1 flex flex-col justify-between">
              <h3 className="text-xl font-bold text-[#03A6A1] mb-1 truncate flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#FFA673]/20 text-[#FFA673] font-bold text-lg shadow-sm">
                  {property.name?.[0]}
                </span>
                {property.name}
                <span className="flex gap-2 ml-auto">
                  <button
                    title="Edit Property"
                    className="text-[#03A6A1] hover:text-[#FFA673] text-lg transition-colors duration-150"
                    onClick={() => {
                      setEditProperty(property);
                      setEditModalOpen(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    title="Deactivate Property"
                    className="text-[#FF4F0F] hover:text-[#FFA673] text-lg transition-colors duration-150"
                    onClick={() => {
                      setDeactivateProperty(property);
                      setDeactivateModalOpen(true);
                    }}
                  >
                    <FaTrash />
                  </button>
                </span>
              </h3>
              <div className="text-xs text-gray-700 mb-1 truncate flex items-center gap-2">
                <FaBuilding className="text-[#03A6A1]" /> {property.address}
              </div>
              {property.description && (
                <div className="text-xs text-gray-600 mb-2" style={{ whiteSpace: 'pre-line' }}>{property.description}</div>
              )}
              {(property.profilePicThumb || property.profilePic) && (
                <div className="flex justify-center my-2">
                  <LazyImage
                    src={getImageUrl(property.profilePicThumb || property.profilePic)}
                    alt={property.name}
                    className="h-32 w-48 object-cover rounded-xl border border-[#FFA673]/40 shadow"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2 mt-2">
                {Object.entries(grouped).map(([key, unit], idx) => {
                  const available = (unit.total || 0) - unit.occupied;
                  return (
                    <div key={key + '-' + idx} className="flex flex-col bg-gradient-to-r from-[#FFF8F0] to-[#FFE3BB] rounded p-3 mb-1 border border-[#FFA673]/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[#03A6A1] text-base">{unit.type}</span>
                        <span className="bg-[#FFA673] text-white px-3 py-1 rounded font-bold text-base shadow-sm">Kshs {unit.rent !== undefined && unit.rent !== null ? unit.rent.toLocaleString() : ''}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1 gap-2">
                        <span className="bg-[#03A6A1]/10 text-[#03A6A1] px-2 py-1 rounded font-semibold">Total: {unit.total}</span>
                        <span className="bg-gradient-to-r from-[#FFA673]/40 to-[#FF4F0F]/30 text-black px-2 py-1 rounded font-bold border border-[#FFA673]/30">Occupied: {unit.occupied}</span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">Available: {available}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(property.galleryThumbs && property.galleryThumbs.length > 0 ? property.galleryThumbs : property.gallery) && (property.galleryThumbs && property.galleryThumbs.length > 0 ? property.galleryThumbs : property.gallery).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(property.galleryThumbs && property.galleryThumbs.length > 0 ? property.galleryThumbs : property.gallery).slice(0, 3).map((img, idx) => (
                    <LazyImage
                      key={idx}
                      src={getImageUrl(img)}
                      alt={`Gallery ${idx + 1}`}
                      className="h-8 w-8 object-cover rounded border border-[#03A6A1] hover:scale-105 transition-transform duration-200"
                    />
                  ))}
                </div>              )}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
};

export default PropertyList;

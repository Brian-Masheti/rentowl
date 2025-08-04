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
              <div className="-mx-5 mb-4">
                {(() => {
                  const coverUrl = getImageUrl(property.profilePicThumb || property.profilePic);
                  return property.profilePicThumb || property.profilePic ? (
                    <img
                      src={coverUrl}
                      alt={property.name}
                      style={{ width: '100%', height: 180, objectFit: 'cover', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}
                    />
                  ) : (
                    <div className="w-full h-[180px] flex items-center justify-center rounded-t-2xl border border-[#FFA673]/40 bg-gradient-to-br from-[#FFF8F0] to-[#FFA673]/30 text-[#FFA673] text-3xl font-bold">
                      <FaBuilding className="opacity-40" />
                    </div>
                  );
                })()}
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {Object.entries(grouped).map(([key, unit], idx) => {
                  const available = (unit.total || 0) - unit.occupied;
                  return (
                    <div key={key + '-' + idx} className="flex flex-col bg-gradient-to-r from-[#FFF8F0] to-[#FFE3BB] rounded p-3 mb-1 border border-[#FFA673]/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[#03A6A1] text-base">{unit.type}</span>
                        <span className="bg-[#FFA673] text-white px-3 py-1 rounded font-bold text-base shadow-sm">Kshs {unit.rent !== undefined && unit.rent !== null ? unit.rent.toLocaleString() : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-[#03A6A1]/10 text-[#03A6A1] px-2 py-1 rounded font-semibold text-xs">Total: {unit.total}</span>
                        <span className="bg-[#03A6A1]/90 text-white px-2 py-1 rounded font-bold text-xs">Occupied: {unit.occupied}</span>
                        <span className="bg-[#FFA673]/90 text-white px-2 py-1 rounded font-bold text-xs">Vacant: {available}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden ml-2">
                          <div
                            className="h-2 bg-[#03A6A1] rounded-l"
                            style={{ width: `${unit.total ? (unit.occupied / unit.total) * 100 : 0}%` }}
                          />
                          <div
                            className="h-2 bg-[#FFA673] rounded-r"
                            style={{ width: `${unit.total ? (available / unit.total) * 100 : 0}%`, marginLeft: unit.total ? `${(unit.occupied / unit.total) * 100}%` : 0 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(property.galleryThumbs && property.galleryThumbs.length > 0 ? property.galleryThumbs : property.gallery) && (property.galleryThumbs && property.galleryThumbs.length > 0 ? property.galleryThumbs : property.gallery).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(() => {
                    const galleryArr = (property.galleryThumbs && property.galleryThumbs.length > 0 ? property.galleryThumbs : property.gallery).slice(0, 3);
                    // Removed gallery image debug logs
                    return galleryArr.map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(img)}
                        alt={`Gallery ${idx + 1}`}
                        style={{ height: 32, width: 32, objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #03A6A1', marginRight: 4 }}
                      />
                    ));
                  })()}
                </div>              
              )}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
};

export default PropertyList;

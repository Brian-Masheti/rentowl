import React, { useEffect, useState } from 'react';
import LazyImage from '../common/LazyImage';

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

  if (loading) return <div className="text-center py-10 text-[#03A6A1] font-bold">Loading properties...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (properties.length === 0) return <div className="text-gray-500">No properties found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {properties.map((property) => {
        // Group units by type and rent
        const grouped = {};
        (property.units || []).forEach((unit) => {
          const key = `${unit.type}-${unit.rent}`;
          if (!grouped[key]) grouped[key] = { ...unit, total: 0, occupied: 0 };
          grouped[key].total += unit.count || 0;
        });
        // Count occupied for each type/rent
        (property.units || []).forEach((unit) => {
          const key = `${unit.type}-${unit.rent}`;
          if (Array.isArray(property.tenants) && property.tenants.length > 0) {
            if (typeof property.tenants[0] === 'object' && property.tenants[0].unitType) {
              grouped[key].occupied += property.tenants.filter((t) => t.unitType && t.unitType.toLowerCase() === unit.type.toLowerCase()).length;
            } else {
              grouped[key].occupied += property.tenants.length;
            }
          }
        });
        return (
          <div key={property._id} className="flex flex-col rounded-2xl border border-[#FFA673]/40 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            {property.profilePic && (
              <LazyImage
                src={getImageUrl(property.profilePic)}
                alt={property.name}
                className="h-40 w-full object-cover rounded-t-2xl border-b border-[#FFA673]/40"
              />
            )}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <h3 className="text-lg font-bold text-[#03A6A1] mb-1 truncate">{property.name}</h3>
              <div className="text-xs text-gray-700 mb-2 truncate">{property.address}</div>
              <div className="flex flex-col gap-2 mb-2">
                {Object.entries(grouped).map(([key, unit], idx) => {
                  const available = (unit.total || 0) - unit.occupied;
                  return (
                    <div key={key + '-' + idx} className="flex flex-col bg-[#F8F8F8] rounded p-2 mb-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#03A6A1]">{unit.type}</span>
                        <span className="text-[#FFA673]">Kshs {unit.rent !== undefined && unit.rent !== null ? unit.rent.toLocaleString() : ''}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span>Total Units: {unit.total}</span>
                        <span>Occupied: {unit.occupied}</span>
                        <span>Available: {available}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {property.gallery && property.gallery.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {property.gallery.slice(0, 3).map((img, idx) => (
                    <LazyImage
                      key={idx}
                      src={getImageUrl((property.gallery && property.gallery[idx]) || img)}
                      alt={`Gallery ${idx + 1}`}
                      className="h-8 w-8 object-cover rounded border border-[#03A6A1] hover:scale-105 transition-transform duration-200"
                    />
                  ))}
                </div>
              )}
              {property.description && (
                <div className="text-xs text-gray-600 mt-2" style={{ whiteSpace: 'pre-line' }}>{property.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PropertyList;

import React, { useEffect, useState } from 'react';

interface PropertyUnit {
  type: string;
  count: number;
  rent: number;
}
interface Property {
  _id: string;
  name: string;
  address: string;
  units: PropertyUnit[];
  status: string;
  tenants: any[];
  description?: string;
  profilePic?: string;
  gallery?: string[];
}

interface PropertyListProps {
  refreshToken: number;
}

import PropertyEditForm from './PropertyEditForm';
import Toast from '../common/Toast';
import PropertySummary from './PropertySummary';
import LazyImage from '../common/LazyImage';

const PropertyList: React.FC<PropertyListProps> = ({ refreshToken }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState(0);
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
      } catch (err: any) {
        setError(err.message || 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [API_URL, refreshToken]);

  // Helper to get full image URL
  const getImageUrl = (img: string) => {
    let url = img.replace(/\\/g, '/'); // replace backslashes with slashes
    if (url.startsWith('uploads/') || url.startsWith('server/uploads/')) {
      url = `${API_URL}/${url.replace('server/', '')}`;
    }
    return url;
  };

  // Modal handlers
  const openModal = (images: string[], idx: number) => {
    setModalImages(images);
    setModalIndex(idx);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const prevImage = () => setModalIndex((i) => (i === 0 ? modalImages.length - 1 : i - 1));
  const nextImage = () => setModalIndex((i) => (i === modalImages.length - 1 ? 0 : i + 1));

  // Edit modal state (must be before any return)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; propertyId: string | null }>({ open: false, propertyId: null });
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; property: Property | null }>({ open: false, property: null });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage] = useState(6);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleEdit = (property: Property) => {
    setEditProperty(property);
    setEditModalOpen(true);
  };
  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditProperty(null);
  };
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditProperty(null);
    setToast({ message: 'Property updated successfully!', type: 'success' });
    setTimeout(() => window.location.reload(), 1200);
  };

  if (loading) return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="animate-pulse flex flex-col rounded-2xl border border-[#FFA673]/40 bg-gradient-to-br from-[#FFF8F0] via-[#FFE3BB]/80 to-[#FFF8F0] shadow-md p-0 overflow-hidden group" style={{ minHeight: 320 }}>
            <div className="h-2 w-full bg-gradient-to-r from-[#03A6A1] via-[#FFA673] to-[#03A6A1]" />
            <div className="p-4 flex-1 flex flex-col">
              <div className="h-40 w-full bg-gray-200 rounded-xl mb-2" />
              <div className="h-6 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-1/3 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-full bg-gray-200 rounded mb-2" />
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
  if (error) return <div className="text-red-600">{error}</div>;
  if (properties.length === 0) return <div className="text-gray-500">No properties found.</div>;

  // Calculate status for each property
  const propertiesWithCalculatedStatus = properties.map((p) => {
    const totalUnits = (p.units || []).reduce((sum, u) => sum + (u.count || 0), 0);
    const occupied = (p.tenants || []).length;
    let calculatedStatus = 'vacant';
    if (occupied === 0) {
      calculatedStatus = 'vacant';
    } else if (occupied === totalUnits) {
      calculatedStatus = 'occupied';
    } else if (occupied > 0 && occupied < totalUnits) {
      calculatedStatus = 'partially occupied';
    }
    return { ...p, calculatedStatus };
  });

  const statusOptions = Array.from(new Set(propertiesWithCalculatedStatus.map(p => p.calculatedStatus)));

  return (
    <>
      {/* Search, filter, and bulk actions bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Search by name or address..."
          className="border border-[#FFA673] rounded-full px-4 py-2 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-[#FFA673] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#03A6A1]"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
        <div className="flex-1" />
        {selectedIds.length > 0 && (
          <div className="flex gap-2 items-center bg-[#FFF8F0] border border-[#FFA673]/60 rounded-lg px-4 py-2 shadow">
            <span className="font-semibold text-[#03A6A1]">{selectedIds.length} selected</span>
            <button
              className="px-4 py-2 rounded bg-[#FF4F0F] text-white font-bold hover:bg-[#FFA673]"
              onClick={async () => {
                if (!window.confirm('Are you sure you want to delete the selected properties?')) return;
                try {
                  const token = localStorage.getItem('token');
                  await Promise.all(selectedIds.map(id =>
                    fetch(`${API_URL}/api/properties/${id}`, {
                      method: 'DELETE',
                      headers: { Authorization: token ? `Bearer ${token}` : '' },
                    })
                  ));
                  setSelectedIds([]);
                  setToast({ message: 'Selected properties deleted!', type: 'success' });
                  setTimeout(() => window.location.reload(), 1200);
                } catch (err) {
                  setToast({ message: 'Failed to delete selected properties.', type: 'error' });
                }
              }}
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={selectedIds.length > 0 && selectedIds.length === propertiesWithCalculatedStatus.filter(p =>
              (p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.address.toLowerCase().includes(search.toLowerCase())) &&
              (statusFilter === 'all' || p.calculatedStatus.toLowerCase() === statusFilter.toLowerCase())
            ).slice((page - 1) * perPage, page * perPage).length}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(propertiesWithCalculatedStatus
                  .filter(p =>
                    (p.name.toLowerCase().includes(search.toLowerCase()) ||
                      p.address.toLowerCase().includes(search.toLowerCase())) &&
                    (statusFilter === 'all' || p.calculatedStatus.toLowerCase() === statusFilter.toLowerCase())
                  )
                  .slice((page - 1) * perPage, page * perPage)
                  .map(p => p._id));
              } else {
                setSelectedIds([]);
              }
            }}
          />
          <span className="text-xs text-gray-600">Select All</span>
        </div>
        {propertiesWithCalculatedStatus
          .filter(p =>
            (p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.address.toLowerCase().includes(search.toLowerCase())) &&
            (statusFilter === 'all' || p.calculatedStatus.toLowerCase() === statusFilter.toLowerCase())
          )
          .slice((page - 1) * perPage, page * perPage)
          .map((property) => (
            <div key={property._id}>
              {/* Property Summary */}
              <div style={{ marginBottom: 8 }}>
                <PropertySummary
                  name={property.name}
                  status={property.status}
                  units={property.units}
                  tenants={property.tenants || []}
                />
              </div>
              <div
                className={`relative flex flex-col rounded-2xl border border-[#FFA673]/40 bg-gradient-to-br from-[#FFF8F0] via-[#FFE3BB]/80 to-[#FFF8F0] shadow-md hover:shadow-xl transition-shadow duration-300 p-0 overflow-hidden group cursor-pointer ${selectedIds.includes(property._id) ? 'ring-4 ring-[#FFA673]/60' : ''}`}
                style={{ minHeight: 320 }}
                onClick={e => {
                  // Prevent opening details modal when clicking edit/delete/checkbox
                  if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                  setDetailsModal({ open: true, property });
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(property._id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedIds([...selectedIds, property._id]);
                    } else {
                      setSelectedIds(selectedIds.filter(id => id !== property._id));
                    }
                  }}
                  className="absolute top-4 left-4 w-5 h-5 accent-[#FFA673] z-20"
                  onClick={e => e.stopPropagation()}
                />
                {/* Accent bar */}
                <div className="h-2 w-full bg-gradient-to-r from-[#03A6A1] via-[#FFA673] to-[#03A6A1]" />
                <div className="p-4 flex-1 flex flex-col">
                  {/* Edit/Delete buttons - responsive stack for mobile */}
                  <div
                    className="absolute flex flex-col items-end gap-2 z-20"
                    style={{ right: 12, bottom: 12 }}
                  >
                    <button
                      className="bg-[#FF4F0F] hover:bg-[#FFA673] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors duration-200 border-2 border-white mb-1"
                      onClick={e => { e.stopPropagation(); setDeleteModal({ open: true, propertyId: property._id }); }}
                      aria-label="Delete property"
                      type="button"
                      style={{ boxShadow: '0 2px 8px rgba(255,79,15,0.15)' }}
                    >
                      {/* Trash bin icon */}
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                        <rect x="6" y="9" width="12" height="9" rx="2" fill="#FF4F0F" />
                        <path d="M9 9V7a3 3 0 013-3v0a3 3 0 013 3v2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        <path d="M10 13v3M14 13v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      className="bg-[#03A6A1] hover:bg-[#FFA673] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors duration-200 border-2 border-white"
                      onClick={e => { e.stopPropagation(); handleEdit(property); }}
                      aria-label="Edit property"
                      type="button"
                      style={{ boxShadow: '0 2px 8px rgba(3,166,161,0.15)' }}
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V17h4" />
                      </svg>
                    </button>
                  </div>
                  {property.profilePic && (
                    <LazyImage
                      src={getImageUrl(property.profilePic)}
                      alt={property.name}
                      className="h-40 w-full object-cover rounded-xl mb-2 border border-[#FFA673]/40 group-hover:shadow-lg transition-shadow duration-300"
                    />
                  )}
                  <h3 className="text-xl font-extrabold text-[#03A6A1] mb-1 tracking-wide group-hover:text-[#FFA673] transition-colors duration-300">
                    {property.name}
                  </h3>
                  <div className="text-sm text-gray-700 mb-1 font-medium flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#03A6A1] mr-1" />
                    {property.address}
                  </div>
                  <div className="text-base text-[#FFA673] font-bold mb-1">
                    {property.units && property.units.length > 0 ? (
                      <div className="text-left">
                        Rents: <span className="text-[#03A6A1]">Kshs</span>
                        <ul className="ml-2 mt-1 text-[#03A6A1] text-sm">
                          {property.units.map((unit, idx) => (
                            <li key={idx}>
                              {unit.type.toLowerCase()}: {unit.rent.toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <span className="text-[#03A6A1]">No unit info</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mb-2" style={{ whiteSpace: 'pre-line' }}>{property.description || ''}</div>
                  {property.gallery && property.gallery.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {property.gallery.map((img, idx) => (
                        <LazyImage
                          key={idx}
                          src={getImageUrl((property.gallery && property.gallery[idx]) || img)}
                          alt={`Gallery ${idx + 1}`}
                          className="h-10 w-10 object-cover rounded cursor-pointer border border-[#03A6A1] hover:scale-105 transition-transform duration-200"
                          onClick={() => openModal(property.gallery!.map(getImageUrl), idx)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
      {/* Pagination controls */}
      <div className="flex justify-center mt-8 gap-2">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="px-4 py-2 font-bold text-[#03A6A1]">Page {page}</span>
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
          onClick={() => setPage(page + 1)}
          disabled={page * perPage >= propertiesWithCalculatedStatus.filter(p =>
            (p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.address.toLowerCase().includes(search.toLowerCase())) &&
            (statusFilter === 'all' || p.calculatedStatus.toLowerCase() === statusFilter.toLowerCase())
          ).length}
        >
          Next
        </button>
      </div>
      {/* Modal for gallery images */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-lg shadow-lg p-4 flex flex-col items-center"
            style={{ minWidth: 320, minHeight: 320 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-2xl text-[#03A6A1] hover:text-[#FFA673] font-bold focus:outline-none z-10"
              onClick={closeModal}
              aria-label="Close gallery"
              type="button"
            >
              &times;
            </button>
            <div className="relative w-full flex items-center justify-center">
              <button
                onClick={prevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 text-[#03A6A1] hover:bg-[#FFA673] rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow z-10"
                aria-label="Previous image"
                style={{ left: 0 }}
              >
                &#60;
              </button>
              <img
                src={modalImages[modalIndex]}
                alt={`Gallery ${modalIndex + 1}`}
                className="max-h-[60vh] max-w-[80vw] object-contain rounded mb-2"
              />
              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 text-[#03A6A1] hover:bg-[#FFA673] rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow z-10"
                aria-label="Next image"
                style={{ right: 0 }}
              >
                &#62;
              </button>
            </div>
            <div className="flex gap-4 mt-2">
              <span className="text-sm text-gray-700">{modalIndex + 1} / {modalImages.length}</span>
            </div>
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {deleteModal?.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteModal({ open: false, propertyId: null })}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-2xl text-[#03A6A1] hover:text-[#FFA673] font-bold focus:outline-none"
              onClick={() => setDeleteModal({ open: false, propertyId: null })}
              aria-label="Close delete modal"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4 text-[#FF4F0F]">Delete Property</h2>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this property? This action can be undone by an admin.</p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                onClick={() => setDeleteModal({ open: false, propertyId: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#FF4F0F] text-white font-bold hover:bg-[#FFA673]"
                onClick={async () => {
                  if (!deleteModal.propertyId) return;
                  try {
                    const token = localStorage.getItem('token');
                    await fetch(`${API_URL}/api/properties/${deleteModal.propertyId}`, {
                      method: 'DELETE',
                      headers: { Authorization: token ? `Bearer ${token}` : '' },
                    });
                    setDeleteModal({ open: false, propertyId: null });
                    setToast({ message: 'Property deleted!', type: 'success' });
                    setTimeout(() => window.location.reload(), 1200);
                  } catch (err) {
                    setToast({ message: 'Failed to delete property.', type: 'error' });
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Property details modal (not lazy loaded, instant) */}
      {detailsModal?.open && detailsModal.property && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDetailsModal({ open: false, property: null })}>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-2xl text-[#03A6A1] hover:text-[#FFA673] font-bold focus:outline-none"
              onClick={() => setDetailsModal({ open: false, property: null })}
              aria-label="Close details modal"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-[#03A6A1]">{detailsModal.property.name}</h2>
            {detailsModal.property.profilePic && (
              <LazyImage src={getImageUrl(detailsModal.property.profilePic)} alt="Profile" className="h-40 w-full object-cover rounded-xl mb-4 border border-[#FFA673]/40" />
            )}
            <div className="mb-2 text-gray-700 font-medium">{detailsModal.property.address}</div>
            <div className="mb-2 text-[#FFA673] font-bold">
              {detailsModal.property.units && detailsModal.property.units.length > 0 ? (
                <div className="text-left">
                  Rents: <span className="text-[#03A6A1]">Kshs</span>
                  <ul className="ml-2 mt-1 text-[#03A6A1] text-sm">
                    {detailsModal.property.units.map((unit: PropertyUnit, idx: number) => (
                      <li key={idx}>
                        {unit.type.toLowerCase()}: {unit.rent.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <span className="text-[#03A6A1]">No unit info</span>
              )}
            </div>
            <div className="mb-4 text-gray-600" style={{ whiteSpace: 'pre-line' }}>{detailsModal.property.description}</div>
            {detailsModal.property.gallery && detailsModal.property.gallery.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {detailsModal.property.gallery.map((img: string, idx: number) => (
                  <LazyImage key={idx} src={getImageUrl(img)} alt={`Gallery ${idx + 1}`} className="h-16 w-16 object-cover rounded shadow" />
                ))}
              </div>
            )}
            <div className="flex gap-4 justify-end mt-4">
              <button
                className="px-4 py-2 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673]"
                onClick={() => { setEditProperty(detailsModal.property); setEditModalOpen(true); setDetailsModal({ open: false, property: null }); }}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 rounded bg-[#FF4F0F] text-white font-bold hover:bg-[#FFA673]"
                onClick={() => { setDeleteModal({ open: true, propertyId: detailsModal.property._id }); setDetailsModal({ open: false, property: null }); }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for editing property */}
      {editModalOpen && editProperty && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={handleEditClose}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <PropertyEditForm property={editProperty} onSuccess={handleEditSuccess} onClose={handleEditClose} />
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyList;

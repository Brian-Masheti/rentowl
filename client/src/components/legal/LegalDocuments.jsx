import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Simple hook to detect if screen is small (mobile)
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

const LegalDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signDoc, setSignDoc] = useState(null);
  const [signature, setSignature] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('lease');
  const isMobile = useIsMobile();

  // Fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ search, type: filterType }).toString();
      const res = await fetch(`${API_URL}/api/legal-documents?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, [search, filterType]);

  // Upload document (landlord/super admin)
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('type', type);
      const res = await fetch(`${API_URL}/api/legal-documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFile(null); setName(''); setType('lease');
      fetchDocuments();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Sign document (tenant)
  const handleSign = async () => {
    if (!signDoc) return;
    setSigning(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/legal-documents/${signDoc._id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ signature, agreed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign failed');
      setShowSignModal(false);
      setSignature('');
      setAgreed(false);
      fetchDocuments();
    } catch (err) {
      alert(err.message);
    } finally {
      setSigning(false);
    }
  };

  // Download document
  const handleDownload = async (doc) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/legal-documents/download/${doc._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // TODO: Add delete logic, preview, and permissions-aware UI

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-[#03A6A1]">Legal Documents</h2>
      {/* Upload form (landlord/super admin only) */}
      {/* TODO: Show only for allowed roles */}
      <form onSubmit={handleUpload} className="flex flex-wrap gap-2 mb-6 items-end">
        <input type="text" placeholder="Document Name" className="border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
        <select className="border rounded px-3 py-2" value={type} onChange={e => setType(e.target.value)}>
          <option value="tenancy_agreement">Tenancy Agreement</option>
          <option value="lease_agreement">Lease Agreement</option>
          <option value="deposit_receipt">Deposit Receipt</option>
          <option value="move_in_checklist">Move-in Checklist</option>
          <option value="move_out_checklist">Move-out Checklist</option>
          <option value="id_document">ID Document</option>
          <option value="utility_registration">Utility Registration/Transfer</option>
          <option value="compliance_certificate">Compliance Certificate</option>
          <option value="eviction_notice">Eviction Notice</option>
          <option value="other_notice">Other Notice</option>
          <option value="insurance">Insurance</option>
          <option value="other">Other</option>
        </select>
        <input type="file" className="border rounded px-3 py-2" onChange={e => setFile(e.target.files[0])} required />
        <button type="submit" className="bg-[#03A6A1] text-white px-4 py-2 rounded font-bold hover:bg-[#FFA673] transition" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
        {uploadError && <div className="text-red-500 ml-2">{uploadError}</div>}
      </form>
      {/* Search/filter */}
      {isMobile ? (
        <div className="flex flex-col gap-2 mb-4">
          <input type="text" placeholder="Search document" className="border rounded px-3 py-2" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="border rounded px-3 py-2" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Document type</option>
            <option value="tenancy_agreement">Tenancy Agreement</option>
            <option value="lease_agreement">Lease Agreement</option>
            <option value="deposit_receipt">Deposit Receipt</option>
            <option value="move_in_checklist">Move-in Checklist</option>
            <option value="move_out_checklist">Move-out Checklist</option>
            <option value="id_document">ID Document</option>
            <option value="utility_registration">Utility Registration/Transfer</option>
            <option value="compliance_certificate">Compliance Certificate</option>
            <option value="eviction_notice">Eviction Notice</option>
            <option value="other_notice">Other Notice</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
        </div>
      ) : (
        <div className="flex gap-2 mb-4">
          <input type="text" placeholder="Search documents..." className="border rounded px-3 py-2" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="border rounded px-3 py-2" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="tenancy_agreement">Tenancy Agreement</option>
            <option value="lease_agreement">Lease Agreement</option>
            <option value="deposit_receipt">Deposit Receipt</option>
            <option value="move_in_checklist">Move-in Checklist</option>
            <option value="move_out_checklist">Move-out Checklist</option>
            <option value="id_document">ID Document</option>
            <option value="utility_registration">Utility Registration/Transfer</option>
            <option value="compliance_certificate">Compliance Certificate</option>
            <option value="eviction_notice">Eviction Notice</option>
            <option value="other_notice">Other Notice</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}
      {/* Document table/list */}
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : isMobile ? (
        <div className="flex flex-col gap-4">
          {documents.length === 0 ? (
            <div className="text-center p-4 text-gray-500">No documents found.</div>
          ) : (
            documents.map(doc => (
              <div key={doc._id} className="rounded-lg border border-[#FFA673]/40 shadow p-4 bg-[#FFF8F0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#03A6A1]">{doc.name}</span>
                  <span className="text-xs bg-[#03A6A1]/10 text-[#03A6A1] px-2 py-1 rounded capitalize">{doc.type.replace('_', ' ')}</span>
                </div>
                <div className="mb-1 text-sm"><span className="font-semibold">Property:</span> {doc.property?.name || '-'}</div>
                <div className="mb-1 text-sm"><span className="font-semibold">Tenant:</span> {doc.tenant ? `${doc.tenant.firstName} ${doc.tenant.lastName}` : '-'}</div>
                <div className="mb-1 text-sm"><span className="font-semibold">Status:</span> {doc.signedByTenant ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Signed</span>
                  : doc.tenant ? <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">Awaiting Signature</span>
                  : <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">N/A</span>}</div>
                <div className="flex gap-2 mt-2">
                  <button className="px-2 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition text-sm" onClick={() => handleDownload(doc)}>Download</button>
                  {doc.tenant && !doc.signedByTenant && doc.tenant._id === JSON.parse(localStorage.getItem('user') || '{}').id && (
                    <button className="px-2 py-1 rounded bg-[#FFA673] text-white font-bold hover:bg-[#03A6A1] transition text-sm" onClick={() => { setSignDoc(doc); setShowSignModal(true); }}>Sign</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <table className="min-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg">
          <thead>
            <tr className="bg-[#FFF8F0] text-[#03A6A1]">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Property</th>
              <th className="px-4 py-2 text-left">Tenant</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc._id} className="hover:bg-[#FFE3BB]/60">
                <td className="px-4 py-2">{doc.name}</td>
                <td className="px-4 py-2 capitalize">{doc.type}</td>
                <td className="px-4 py-2">{doc.property?.name || '-'}</td>
                <td className="px-4 py-2">{doc.tenant ? `${doc.tenant.firstName} ${doc.tenant.lastName}` : '-'}</td>
                <td className="px-4 py-2">
                  {doc.signedByTenant ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Signed</span>
                    : doc.tenant ? <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">Awaiting Signature</span>
                    : <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">N/A</span>}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="px-2 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition" onClick={() => handleDownload(doc)}>Download</button>
                  {doc.tenant && !doc.signedByTenant && doc.tenant._id === JSON.parse(localStorage.getItem('user') || '{}').id && (
                    <button className="px-2 py-1 rounded bg-[#FFA673] text-white font-bold hover:bg-[#03A6A1] transition" onClick={() => { setSignDoc(doc); setShowSignModal(true); }}>Sign</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Sign Agreement Modal */}
      {showSignModal && signDoc && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(255, 227, 187, 0.95)' }}>
          <div className="bg-[#FFE3BB] rounded-2xl p-6 w-full max-w-md shadow-lg relative border-2 border-[#03A6A1] flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowSignModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2 text-[#03A6A1]">Sign Agreement</h3>
            <p className="mb-2 text-[#23272F] text-center">Please review the agreement and sign below to accept the terms.</p>
            {/* TODO: Add document preview (PDF/image) */}
            <div className="flex items-center gap-2 my-3">
              <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label htmlFor="agree" className="text-sm">I have read and agree to the terms of this agreement.</label>
            </div>
            <input
              type="text"
              className="w-full border-2 border-[#03A6A1] rounded-full px-4 py-2 focus:ring-2 focus:ring-[#FFA673] focus:outline-none bg-[#FFF8F0] text-[#23272F] font-semibold mb-3"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              placeholder="Type your full name to sign"
              required
            />
            <button
              className="bg-[#03A6A1] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#FFA673] transition mt-2"
              onClick={handleSign}
              disabled={!agreed || !signature || signing}
            >
              {signing ? 'Signing...' : 'Sign Agreement'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalDocuments;

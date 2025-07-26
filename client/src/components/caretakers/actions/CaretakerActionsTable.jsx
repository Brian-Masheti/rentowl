import React from 'react';

const CaretakerActionsTable = ({ actions, loading, error, onActionClick }) => {
  if (loading) return <div>Loading caretaker actions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!actions.length) return <div className="text-gray-500">No caretaker actions found.</div>;

  // Responsive: Table for desktop, cards for mobile
  return (
    <>
      <div className="hidden md:block overflow-x-auto mt-4">
        <table className="min-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg">
          <thead>
            <tr className="bg-[#FFF8F0] text-[#03A6A1]">
              <th className="px-4 py-2 text-left">Caretaker</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Property</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {actions.map(action => (
              <tr key={action._id} className="hover:bg-[#FFE3BB]/60">
                <td className="px-4 py-2">{action.caretaker?.firstName} {action.caretaker?.lastName}</td>
                <td className="px-4 py-2 capitalize">{action.actionType.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2">{action.property?.name || '-'}</td>
                <td className="px-4 py-2">{new Date(action.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${action.status === 'completed' ? 'bg-green-100 text-green-700' : action.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{action.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-2">
                  <button
                    className="px-2 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition"
                    onClick={() => onActionClick(action)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Cards for mobile */}
      <div className="md:hidden flex flex-col gap-4 mt-4">
        {actions.map(action => (
          <div key={action._id} className="rounded-xl border border-[#FFA673]/30 bg-white shadow p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="w-10 h-10 rounded-full bg-[#FFA673]/30 text-[#FFA673] font-bold flex items-center justify-center text-lg">
                {action.caretaker?.firstName?.[0]}{action.caretaker?.lastName?.[0]}
              </span>
              <div>
                <div className="font-bold text-[#03A6A1]">{action.caretaker?.firstName} {action.caretaker?.lastName}</div>
                <div className="text-gray-700 text-sm capitalize">{action.actionType.replace(/_/g, ' ')}</div>
                <div className="text-gray-700 text-sm">{action.property?.name || '-'}</div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${action.status === 'completed' ? 'bg-green-100 text-green-700' : action.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{action.status.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">{new Date(action.createdAt).toLocaleString()}</div>
            <button
              className="px-2 py-1 rounded bg-[#03A6A1] text-white font-bold hover:bg-[#FFA673] transition self-end"
              onClick={() => onActionClick(action)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default CaretakerActionsTable;

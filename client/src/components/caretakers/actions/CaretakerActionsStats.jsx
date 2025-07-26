import React from 'react';

const CaretakerActionsStats = ({ actions }) => {
  let mostActiveCaretaker = '-';
  let mostCommonAction = '-';
  let total = actions?.length || 0;

  if (actions && actions.length) {
    const caretakerCounts = {};
    const actionTypeCounts = {};
    actions.forEach(a => {
      const name = a.caretaker ? `${a.caretaker.firstName} ${a.caretaker.lastName}` : 'Unknown';
      caretakerCounts[name] = (caretakerCounts[name] || 0) + 1;
      actionTypeCounts[a.actionType] = (actionTypeCounts[a.actionType] || 0) + 1;
    });
    mostActiveCaretaker = Object.entries(caretakerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    mostCommonAction = Object.entries(actionTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0].replace(/_/g, ' ') || '-';
  }

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="bg-[#03A6A1]/10 text-[#03A6A1] rounded-lg px-4 py-2 font-bold">
        Total Actions: {total}
      </div>
      <div className="bg-[#FFA673]/10 text-[#FFA673] rounded-lg px-4 py-2 font-bold">
        Most Active Caretaker: {mostActiveCaretaker}
      </div>
      <div className="bg-[#03A6A1]/10 text-[#03A6A1] rounded-lg px-4 py-2 font-bold">
        Most Common Action: {mostCommonAction}
      </div>
    </div>
  );
};

export default CaretakerActionsStats;

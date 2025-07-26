import React from 'react';

const FinancialMobileFilters = ({
  dateRange,
  onDateRangeChange,
  propertyOptions,
  selectedProperty,
  onPropertyChange,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-full mb-4 md:hidden px-2">
      <div className="flex flex-col gap-2 w-full">
        <label className="font-semibold text-base text-gray-700 mb-1">From</label>
        <input
          type="date"
          value={dateRange.start || ''}
          onChange={e => onDateRangeChange({ start: e.target.value, end: dateRange.end })}
          className="border rounded px-4 py-3 text-lg"
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label className="font-semibold text-base text-gray-700 mb-1">To</label>
        <input
          type="date"
          value={dateRange.end || ''}
          onChange={e => onDateRangeChange({ start: dateRange.start, end: e.target.value })}
          className="border rounded px-4 py-3 text-lg"
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label className="font-semibold text-base text-gray-700 mb-1">Property</label>
        <select
          value={selectedProperty || ''}
          onChange={e => onPropertyChange(e.target.value)}
          className="border rounded px-4 py-3 text-lg"
        >
          <option value="">All Properties</option>
          {propertyOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FinancialMobileFilters;

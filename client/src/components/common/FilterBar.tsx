import React from 'react';

interface FilterBarProps {
  dateRange?: { start: string; end: string };
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  propertyOptions?: { value: string; label: string }[];
  selectedProperty?: string;
  onPropertyChange?: (value: string) => void;
  unitTypeOptions?: { value: string; label: string }[];
  selectedUnitType?: string;
  onUnitTypeChange?: (value: string) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  dateRange,
  onDateRangeChange,
  propertyOptions,
  selectedProperty,
  onPropertyChange,
  unitTypeOptions,
  selectedUnitType,
  onUnitTypeChange,
  className,
}) => {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 items-stretch sm:items-center mb-4 ${className || ''}`}>
      {onDateRangeChange && (
        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm text-gray-700">From</label>
          <input
            type="date"
            value={dateRange?.start || ''}
            onChange={e => onDateRangeChange({ start: e.target.value, end: dateRange?.end || '' })}
            className="border rounded px-2 py-1"
          />
          <label className="font-semibold text-sm text-gray-700">To</label>
          <input
            type="date"
            value={dateRange?.end || ''}
            onChange={e => onDateRangeChange({ start: dateRange?.start || '', end: e.target.value })}
            className="border rounded px-2 py-1"
          />
        </div>
      )}
      {propertyOptions && onPropertyChange && (
        <select
          value={selectedProperty || ''}
          onChange={e => onPropertyChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Properties</option>
          {propertyOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
      {unitTypeOptions && onUnitTypeChange && (
        <select
          value={selectedUnitType || ''}
          onChange={e => onUnitTypeChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Unit Types</option>
          {unitTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default FilterBar;

import React from 'react';

const DateRangeFilter = ({ label, value = { from: null, to: null }, onChange, placeholder = "Select date range" }) => {
  const handleFromChange = (e) => {
    const fromDate = e.target.value || null;
    onChange({ ...value, from: fromDate });
  };

  const handleToChange = (e) => {
    const toDate = e.target.value || null;
    onChange({ ...value, to: toDate });
  };

  // Validate date range
  const isDateRangeValid = () => {
    if (!value.from || !value.to) return true; // Allow partial dates
    return value.from <= value.to;
  };

  const getDateRangeError = () => {
    if (!isDateRangeValid()) {
      return "From date must be before to date";
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">From</label>
          <input
            type="date"
            value={value?.from || ''}
            onChange={handleFromChange}
            placeholder="Start date"
            max={value?.to || undefined}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">To</label>
          <input
            type="date"
            value={value?.to || ''}
            onChange={handleToChange}
            placeholder="End date"
            min={value?.from || undefined}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>
      </div>
      {getDateRangeError() && (
        <div className="text-red-400 text-xs mt-1">
          {getDateRangeError()}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;

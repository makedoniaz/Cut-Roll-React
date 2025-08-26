import React from 'react';

const DateFilter = ({ label, value, onChange, placeholder = "Select date" }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <input
        type="date"
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

export default DateFilter;

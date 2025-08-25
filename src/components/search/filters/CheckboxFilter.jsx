import React from 'react';

const CheckboxFilter = ({ label, value, onChange, options, type = 'complex' }) => {
  // Handle simple checkbox (single checkbox, checked = true, unchecked = false)
  if (type === 'simpleCheckbox') {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm text-gray-300">Show only {label.toLowerCase().replace(' only', '')} users</span>
        </label>
      </div>
    );
  }

  // Handle complex checkbox (multiple options, one can be selected)
  const handleCheckboxChange = (optionValue) => {
    if (value === null) {
      // If no value is set, initialize with the selected option
      onChange(optionValue);
    } else if (value === optionValue) {
      // If the same option is clicked, deselect it (set to null)
      onChange(null);
    } else {
      // If a different option is clicked, select it
      onChange(optionValue);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value === option.value}
              onChange={() => handleCheckboxChange(option.value)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxFilter;

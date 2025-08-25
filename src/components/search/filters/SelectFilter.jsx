import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

const SelectFilter = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const selectRect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: selectRect.bottom + 4, // 4px gap below
        left: selectRect.left,
        width: selectRect.width
      });
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  // Render dropdown using portal to escape stacking context constraints
  const renderDropdown = () => {
    if (!isOpen) return null;

    return createPortal(
      <div
        className="fixed z-[9999] bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}
      >
        <button
          type="button"
          onClick={() => handleSelect('')}
          className="w-full px-3 py-2 text-left hover:bg-gray-700 text-gray-400 border-b border-gray-700"
        >
          {placeholder}
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={`w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors ${
              value === option.value ? 'bg-gray-700 text-green-400' : 'text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>,
      document.body
    );
  };

  return (
    <div className="flex flex-col space-y-1" ref={selectRef}>
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-green-500 text-white text-left flex justify-between items-center"
        >
          <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {renderDropdown()}
      </div>
    </div>
  );
};

export default SelectFilter;
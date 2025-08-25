import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

const SelectFilter = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the select container and the dropdown
      const isOutsideSelect = selectRef.current && !selectRef.current.contains(event.target);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      
      if (isOutsideSelect && isOutsideDropdown) {
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
    console.log('SelectFilter: handleSelect called with:', optionValue);
    console.log('SelectFilter: onChange function type:', typeof onChange);
    console.log('SelectFilter: onChange function:', onChange);
    console.log('SelectFilter: calling onChange with:', optionValue);
    console.log('SelectFilter: current value before onChange:', value);
    
    if (typeof onChange === 'function') {
      onChange(optionValue);
      console.log('SelectFilter: onChange called successfully');
    } else {
      console.error('SelectFilter: onChange is not a function!', onChange);
    }
    
    console.log('SelectFilter: onChange called, closing dropdown');
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => {
    // Simple equality check - handle null specially
    if (value === null) {
      return opt.value === null;
    }
    return opt.value === value;
  });

  console.log('SelectFilter: selectedOption:', selectedOption, 'value:', value, 'options:', options);

  // Render dropdown using portal to escape stacking context constraints
  const renderDropdown = () => {
    console.log('SelectFilter: renderDropdown called, isOpen:', isOpen);
    if (!isOpen) {
      console.log('SelectFilter: Dropdown is closed, returning null');
      return null;
    }

    console.log('SelectFilter: Rendering dropdown with position:', dropdownPosition);
    return createPortal(
      <div
        ref={dropdownRef}
        className="fixed z-[9999] bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}
      >
        <button
          type="button"
          onClick={() => {
            console.log('SelectFilter: Clear option clicked');
            handleSelect(null);
          }}
          className="w-full px-3 py-2 text-left hover:bg-gray-700 text-gray-400 border-b border-gray-700"
        >
          {placeholder}
        </button>
        {options.map((option) => (
          <button
            key={option.value !== null ? option.value : `null-${option.label}`}
            type="button"
            onClick={() => {
              console.log('SelectFilter: Option clicked:', option.label, 'value:', option.value);
              handleSelect(option.value);
            }}
            className={`w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center justify-between ${
              (option.value === null && value === null) || option.value === value ? 'bg-gray-700 text-green-400' : 'text-white'
            }`}
          >
            <span>{option.label}</span>
            {(option.value === null && value === null) || option.value === value ? (
              <Check className="w-4 h-4" />
            ) : null}
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
          onClick={() => {
            console.log('SelectFilter: dropdown toggle clicked, current value:', value);
            setIsOpen(!isOpen);
          }}
          className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-green-500 text-white text-left flex justify-between items-center"
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
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const MultiSelectFilter = ({ label, value, onChange, options }) => {
  const multiselectRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (multiselectRef.current && !multiselectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col space-y-1 relative" ref={multiselectRef}>
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-green-500 text-white text-left flex justify-between items-center"
        >
          <span>
            {value.length === 0 
              ? `Select ${label.toLowerCase()}...` 
              : `${value.length} selected`
            }
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="mr-2 accent-green-500"
                />
                <span className="text-white">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectFilter;
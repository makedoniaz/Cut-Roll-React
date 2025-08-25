import { useEffect, useState, useRef } from 'react';

const RangeFilter = ({ label, value, onChange, min, max, step = 1, labelFormatter, defaultValue }) => {
  const [isDragging, setIsDragging] = useState(null);
  const [tempValue, setTempValue] = useState(value);
  const sliderRef = useRef(null);

  // Debug logging
  console.log('RangeFilter props:', { label, value, min, max, step, labelFormatter, defaultValue });
  console.log('Current tempValue:', tempValue);

  // Helper function to format values
  const formatValue = (val) => {
    if (labelFormatter && typeof labelFormatter === 'function') {
      return labelFormatter(val);
    }
    return val;
  };

  // Helper function to format input values for display
  const formatInputValue = (val) => {
    if (labelFormatter && typeof labelFormatter === 'function') {
      // For dates, show YYYY-MM-DD format in inputs
      if (typeof val === 'number' && val > 1000000000000) { // Likely a timestamp
        return new Date(val).toISOString().split('T')[0];
      }
    }
    // Always return a value, never undefined or empty string
    return val !== undefined && val !== null ? val.toString() : '';
  };

  // Helper function to parse input values
  const parseInputValue = (inputVal) => {
    if (labelFormatter && typeof labelFormatter === 'function') {
      // For dates, parse YYYY-MM-DD format back to timestamp
      if (typeof inputVal === 'string' && inputVal.includes('-')) {
        const date = new Date(inputVal);
        return date.getTime();
      }
    }
    return parseInt(inputVal) || min;
  };

  // Sync tempValue with incoming value prop
  useEffect(() => {
    if (!isDragging) {
      // Use provided value or fall back to defaultValue
      const newValue = value || defaultValue;
      console.log('Setting tempValue to:', newValue);
      setTempValue(newValue);
    }
  }, [value, defaultValue, isDragging]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !sliderRef.current) return;
      
      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newValue = min + percentage * (max - min);
      const roundedValue = Math.round(newValue / step) * step;
      
      let newTempValue;
      if (isDragging === 'min') {
        newTempValue = [Math.min(roundedValue, tempValue[1]), tempValue[1]];
      } else if (isDragging === 'max') {
        newTempValue = [tempValue[0], Math.max(roundedValue, tempValue[0])];
      }
      
      setTempValue(newTempValue);
      onChange(newTempValue);
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, step, tempValue, onChange]);

  const handleMouseDown = (thumb, e) => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  // Use tempValue for positioning during drag, otherwise use value
  const displayValue = isDragging ? tempValue : (value || defaultValue || [min, max]);
  
  // Safety check to ensure we have valid values
  if (!displayValue || !Array.isArray(displayValue) || displayValue.length !== 2) {
    console.warn('Invalid displayValue:', displayValue, 'falling back to [min, max]');
    return <div>Error: Invalid range values</div>;
  }
  
  const minPercent = ((displayValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((displayValue[1] - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium text-gray-300">
        {label}: {formatValue(displayValue[0])} - {formatValue(displayValue[1])}
      </label>
      <div className="relative h-6 flex items-center" ref={sliderRef}>
        {/* Track */}
        <div className="w-full h-2 bg-gray-700 rounded-full relative">
          {/* Active range */}
          <div 
            className="absolute h-2 bg-green-500 rounded-full transition-none"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`
            }}
          />
          
          {/* Min thumb */}
          <div
            className={`absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full cursor-pointer transform -translate-y-1/2 -translate-x-1/2 top-1/2 z-10 transition-none ${
              isDragging === 'min' ? 'scale-110 shadow-lg' : 'hover:scale-105'
            }`}
            style={{ left: `${minPercent}%` }}
            onMouseDown={(e) => handleMouseDown('min', e)}
          />
          
          {/* Max thumb */}
          <div
            className={`absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full cursor-pointer transform -translate-y-1/2 -translate-x-1/2 top-1/2 z-10 transition-none ${
              isDragging === 'max' ? 'scale-110 shadow-lg' : 'hover:scale-105'
            }`}
            style={{ left: `${maxPercent}%` }}
            onMouseDown={(e) => handleMouseDown('max', e)}
          />
        </div>
      </div>
      
      {/* Input fields for precise control */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={formatInputValue(displayValue[0])}
          onChange={(e) => {
            const newValue = [Math.max(min, Math.min(parseInputValue(e.target.value) || min, displayValue[1])), displayValue[1]];
            setTempValue(newValue);
            onChange(newValue);
          }}
          className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-green-500 text-white"
          placeholder="Min value"
        />
        <input
          type="text"
          value={formatInputValue(displayValue[1])}
          onChange={(e) => {
            const newValue = [displayValue[0], Math.min(max, Math.max(parseInputValue(e.target.value) || max, displayValue[0]))];
            setTempValue(newValue);
            onChange(newValue);
          }}
          className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-green-500 text-white"
          placeholder="Max value"
        />
      </div>
    </div>
  );
};

export default RangeFilter;
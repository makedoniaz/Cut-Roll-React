import { useEffect, useState, useRef } from 'react';

const RangeFilter = ({ label, value, onChange, min, max, step = 1 }) => {
  const [isDragging, setIsDragging] = useState(null);
  const [tempValue, setTempValue] = useState(value);
  const sliderRef = useRef(null);

  // Sync tempValue with incoming value prop
  useEffect(() => {
    if (!isDragging) {
      setTempValue(value);
    }
  }, [value, isDragging]);

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
  const displayValue = isDragging ? tempValue : value;
  const minPercent = ((displayValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((displayValue[1] - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium text-gray-300">
        {label}: {displayValue[0]} - {displayValue[1]}
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
          type="number"
          min={min}
          max={displayValue[1]}
          step={step}
          value={displayValue[0]}
          onChange={(e) => {
            const newValue = [Math.max(min, Math.min(parseInt(e.target.value) || min, displayValue[1])), displayValue[1]];
            setTempValue(newValue);
            onChange(newValue);
          }}
          className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-green-500 text-white"
        />
        <input
          type="number"
          min={displayValue[0]}
          max={max}
          step={step}
          value={displayValue[1]}
          onChange={(e) => {
            const newValue = [displayValue[0], Math.min(max, Math.max(parseInt(e.target.value) || max, displayValue[0]))];
            setTempValue(newValue);
            onChange(newValue);
          }}
          className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-green-500 text-white"
        />
      </div>
    </div>
  );
};

export default RangeFilter;
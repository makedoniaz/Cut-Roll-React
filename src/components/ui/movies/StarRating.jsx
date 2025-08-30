import React, { useState, useRef } from 'react';
import './StarRating.css';

const StarRating = ({ rating, onRate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const sliderRef = useRef(null);
  const instanceId = useRef('sr-' + Math.random().toString(36).slice(2));

  // Handle slider input for real-time updates
  const handleSliderInput = (e) => {
    const value = parseFloat(e.target.value);
    // Update the local state immediately for real-time star updates
    setHoverRating(value);
    onRate(value);
  };

  // Handle slider value change (when sliding ends)
  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setHoverRating(0); // Reset hover rating
    onRate(value);
  };

  // Handle mouse/touch events for better interaction
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);

  // Render individual star using a single SVG with a per-star gradient
  const renderStar = (starIndex, currentRating) => {
    // Fill ratio for this star (0..1)
    const fillRatioRaw = currentRating - (starIndex - 1);
    const fillRatio = Math.max(0, Math.min(1, fillRatioRaw));
    const percent = Math.round(fillRatio * 100);
    const gradId = `${instanceId.current}-g-${starIndex}`;

    return (
      <svg
        key={starIndex}
        className="w-8 h-8 transition-colors duration-200"
        viewBox="0 0 24 24"
        role="img"
        aria-label={`Star ${starIndex} fill ${percent}%`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset={`${percent}%`} stopColor="#10b981" />
            <stop offset={`${percent}%`} stopColor="#4b5563" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={`url(#${gradId})`}
        />
      </svg>
    );
  };

  // Render all 10 stars
  const renderStars = (currentRating) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(renderStar(i, currentRating));
    }
    return stars;
  };

  // Calculate the active rating (either hover or actual rating)
  const activeRating = hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Star Display */}
      <div className="flex gap-1 items-center">
        {renderStars(activeRating)}
      </div>
      
      {/* Rating Value Display */}
      <div className="text-2xl font-bold text-white">
        {activeRating > 0 ? `${activeRating.toFixed(1)}/10` : '0.0/10'}
      </div>
      
      {/* Slider Input */}
      <div className="w-full max-w-md">
        <div className="relative">
          <input
            ref={sliderRef}
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={rating}
            onChange={handleSliderChange}
            onInput={handleSliderInput}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setHoverRating(rating)}
            onMouseLeave={() => setHoverRating(0)}
            className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer custom-slider"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(rating / 10) * 100}%, #4b5563 ${(rating / 10) * 100}%, #4b5563 100%)`
            }}
          />
        </div>
        
        {/* Slider Labels */}
        <div className="flex justify-between text-sm text-gray-400 mt-3">
          <span>0</span>
          <span>2.5</span>
          <span>5.0</span>
          <span>7.5</span>
          <span>10</span>
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-1">
          {[0, 2.5, 5, 7.5, 10].map((step) => (
            <div 
              key={step}
              className={`w-1 h-1 rounded-full ${
                rating >= step ? 'bg-green-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-sm text-gray-400 text-center max-w-xs">
        Drag the slider to set your rating. Half-star ratings (like 1.5, 2.5) are supported.
      </div>
    </div>
  );
};

export default StarRating;
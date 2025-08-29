import { useState } from 'react'

const StarRating = ({ rating, onRate }) => {
  const [hover, setHover] = useState(0);
  
  const handleStarClick = (starValue, isHalfStar = false) => {
    const finalRating = isHalfStar ? starValue - 0.5 : starValue;
    onRate(finalRating);
  };
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
        const isHalfStarHover = hover === star - 0.5;
        const isFullStarHover = hover >= star;
        const isHalfStarActive = rating >= star - 0.5 && rating < star;
        const isFullStarActive = rating >= star;
        
        return (
          <div key={star} className="relative">
            {/* Half Star Button */}
            <button
              className="absolute inset-0 w-2 h-4 transition-colors"
              onClick={() => handleStarClick(star, true)}
              onMouseEnter={() => setHover(star - 0.5)}
              onMouseLeave={() => setHover(0)}
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            >
              <svg 
                className={`w-4 h-4 ${
                  isHalfStarHover || isHalfStarActive ? 'text-green-500' : 'text-gray-600'
                }`} 
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            
            {/* Full Star Button */}
            <button
              className="absolute inset-0 w-2 h-4 transition-colors"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{ clipPath: 'inset(0 0 0 50%)' }}
            >
              <svg 
                className={`w-4 h-4 ${
                  isFullStarHover || isFullStarActive ? 'text-green-500' : 'text-gray-600'
                }`} 
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            
            {/* Background Star (always visible) */}
            <svg 
              className="w-4 h-4 text-gray-600" 
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
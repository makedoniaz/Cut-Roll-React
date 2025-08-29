import { useState } from 'react'

const StarRating = ({ rating, onRate }) => {
  const [hover, setHover] = useState(0);
  
  const handleStarClick = (starValue) => {
    onRate(starValue);
  };
  
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
        const isActive = rating >= star;
        const isHovered = hover >= star;
        
        return (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-colors duration-200 focus:outline-none"
          >
            <svg 
              className={`w-8 h-8 ${
                isActive || isHovered ? 'text-green-500 fill-current' : 'text-gray-600'
              }`} 
              viewBox="0 0 24 24"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
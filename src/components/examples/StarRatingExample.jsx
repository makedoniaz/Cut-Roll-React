import React, { useState } from 'react';
import StarRating from '../ui/movies/StarRating';

const StarRatingExample = () => {
  const [rating, setRating] = useState(0);

  const handleRatingChange = (newRating) => {
    console.log('Rating changed to:', newRating);
    setRating(newRating);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          New Star Rating System Demo
        </h1>
        
        <div className="space-y-8">
          {/* Current Rating Display */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-4">Current Rating</h2>
            <div className="text-4xl font-bold text-yellow-400">
              {rating > 0 ? `${rating.toFixed(1)}/10` : '0.0/10'}
            </div>
          </div>

          {/* Star Rating Component */}
          <div className="flex justify-center">
            <StarRating 
              rating={rating} 
              onRate={handleRatingChange}
            />
          </div>

          {/* Instructions */}
          <div className="text-center text-gray-400 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-2">How to Use</h3>
            <ul className="text-sm space-y-1">
              <li>• Drag the slider to set your rating from 0 to 10</li>
              <li>• Half-star ratings (like 1.5, 2.5) are supported</li>
              <li>• The stars above will update in real-time as you slide</li>
              <li>• The rating value is displayed below the stars</li>
            </ul>
          </div>

          {/* Test Values */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Test Values</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {[0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    rating === value
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-gray-600 text-white hover:bg-gray-500'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarRatingExample;

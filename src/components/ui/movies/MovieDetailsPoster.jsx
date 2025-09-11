import React from 'react';

const MovieDetailsPoster = ({ title, posterUrl }) => {
  return (
    <div className="relative">
      {/* Movie Poster */}
      <div className="w-full aspect-[2/3] rounded-lg shadow-2xl relative overflow-hidden">
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback placeholder when no image or image fails to load */}
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 ${posterUrl ? 'hidden' : 'flex'}`}>
          <div className="text-center">
            <div className="bg-yellow-400 text-black px-8 py-16 rounded">
              <div className="text-6xl font-bold mb-2">🎬</div>
              <div className="text-xl font-bold">MOVIE</div>
            </div>
            <div className="text-3xl font-bold text-white mt-4 drop-shadow-lg">
              {title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPoster;
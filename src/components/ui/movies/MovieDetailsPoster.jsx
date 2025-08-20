import React from 'react';

const MovieDetailsPoster = ({ title, views, lists, likes, posterUrl }) => {
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
      

      
      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-white">
        <div className="flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{views || '0'}</span>
        </div>
        <div className="flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{lists || '0'}</span>
        </div>
        <div className="flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{likes || '0'}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPoster;
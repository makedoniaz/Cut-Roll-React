import React from 'react';

const MovieDetailsPoster = ({ title, views, lists, likes }) => {
  return (
    <div className="relative group">
      {/* Replace this with your actual image */}
      <div className="w-full aspect-[2/3] bg-gradient-to-b from-blue-400 to-green-400 rounded-lg shadow-2xl relative overflow-hidden">
        {/* Placeholder for poster - replace with actual image */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="text-center">
            <div className="bg-yellow-400 text-black px-8 py-16 rounded">
              <div className="text-6xl font-bold mb-2">18</div>
              <div className="text-xl font-bold">GILMORE</div>
            </div>
            <div className="text-3xl font-bold text-white mt-4 drop-shadow-lg">
              Happy Gilmore 2
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <button className="bg-white text-black px-6 py-3 rounded-full font-semibold flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Trailer
        </button>
      </div>
      
      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-white">
        <div className="flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{views}</span>
        </div>
        <div className="flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{lists}</span>
        </div>
        <div className="flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{likes}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPoster;
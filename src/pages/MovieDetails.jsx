import StarRating from '../components/ui/movies/StarRating';
import ActionButton from '../components/ui/buttons/ActionButton';
import CastGrid from '../components/ui/movies/CastGrid';
import RatingDistribution from '../components/ui/movies/RatingDistribution';
import StreamingService from '../components/ui/movies/StreamingService';
import TabNav from '../components/ui/common/TabNav';
import MovieDetailsPoster from '../components/ui/movies/MovieDetailsPoster';

import { useState } from 'react'

const MovieDetails = () => {
  const [userRating, setUserRating] = useState(0);
  const [activeTab, setActiveTab] = useState('CAST');
  const [showAllCast, setShowAllCast] = useState(false);
  
  const cast = [
    'Adam Sandler', 'Julie Bowen', 'Christopher McDonald',
    'Benny Safdie', 'Ben Stiller', 'Bad Bunny', 'John Daly',
    'Dennis Dugan', 'Haley Joel Osment', 'Lavell Crawford',
    'Jackie Sandler', 'Sadie Sandler', 'Sunny Sandler',
    'Maxwell Jacob Friedman', 'Philip Schneider', 'Ethan Cutkosky',
    'Conor Sherry', 'Steve Buscemi', 'Kevin Nealon', 'Kym Whitley',
    'John Farley', 'Eric André', 'Martin Herlihy', 'Margaret Qualley',
    'Verne Lundquist', 'Post Malone', 'Jack Giarraputo',
    'Keegan Bradley', 'Fred Couples'
  ];
  
  const displayedCast = showAllCast ? cast : cast.slice(0, 18);
  
  return (
    <div className="min-h-screen from-gray-900 via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Poster + Streaming (3 cols) */}
          <div className="lg:col-span-3">
            <div className="sticky top-8 space-y-4">
              {/* Movie Poster */}
              <MovieDetailsPoster 
                title="Happy Gilmore 2"
                views="426K"
                lists="44K"
                likes="92K"
              />
              
              {/* Where to Watch - Attached to Poster */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">WHERE TO WATCH</h3>
                <div className="space-y-2">
                  <StreamingService service="Netflix AZ" type="PLAY" />
                  <StreamingService service="Netflix US" type="PLAY" />
                  <StreamingService service="Netflix Standalone US" type="PLAY" />
                </div>
                <button className="w-full mt-3 text-cyan-500 text-sm hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span>Go PRO to customize this list</span>
                  <span className="bg-green-500 text-black text-xs px-2 py-1 rounded font-bold">PRO</span>
                </button>
                <button className="w-full mt-3 text-cyan-500 text-sm hover:text-cyan-400 transition-colors">
                  All services... →
                </button>
              </div>
            </div>
          </div>
          
          {/* Center Column - Movie Info + Tabs (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title and Year */}
            <div>
              <h1 className="text-5xl font-bold mb-2">Happy Gilmore 2</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="text-2xl">2025</span>
                <span>Directed by Kyle Newacheck</span>
              </div>
            </div>
            
            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-green-500 font-semibold mb-3">HAPPY GILMORE RETURNS!</h2>
              <p className="text-gray-300 leading-relaxed">
                Happy Gilmore isn't done with golf — not by a long shot. Since his retirement after his first Tour Championship win, Gilmore returns to finance his daughter's ballet classes.
              </p>
            </div>
            
            
            {/* Tabs Section - Now in Center Column */}
            <div className="space-y-6 mt-8">
              <TabNav 
                tabs={['CAST', 'CREW', 'DETAILS', 'GENRES', 'RELEASES']}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              {/* Tab Content */}
              {activeTab === 'CAST' && (
                <div className="space-y-4">
                  <CastGrid cast={displayedCast} />
                  {!showAllCast && cast.length > 18 && (
                    <button 
                      onClick={() => setShowAllCast(true)}
                      className="text-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                      Show All...
                    </button>
                  )}
                </div>
              )}
              
              {activeTab === 'DETAILS' && (
                <div className="space-y-6">
                  <div className="space-y-4 text-gray-300">
                    <div className="flex gap-4">
                      <span className="text-gray-500">Runtime:</span>
                      <span>118 mins</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-gray-500">More at:</span>
                      <div className="flex gap-2">
                        <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold">IMDb</span>
                        <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">TMDB</span>
                      </div>
                    </div>
                  </div>
                  {/* Rating Distribution */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-4">RATING DISTRIBUTION</h4>
                    <RatingDistribution />
                  </div>
                </div>
              )}
              
              {activeTab === 'GENRES' && (
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-700 px-4 py-2 rounded-full">Comedy</span>
                  <span className="bg-gray-700 px-4 py-2 rounded-full">Sports</span>
                </div>
              )}
              
              {activeTab === 'CREW' && (
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                  <div>
                    <span className="text-gray-500">Director:</span> Kyle Newacheck
                  </div>
                  <div>
                    <span className="text-gray-500">Producer:</span> Adam Sandler
                  </div>
                  <div>
                    <span className="text-gray-500">Writer:</span> Tim Herlihy
                  </div>
                  <div>
                    <span className="text-gray-500">Cinematography:</span> Bill Pope
                  </div>
                  <div>
                    <span className="text-gray-500">Music:</span> Rupert Gregson-Williams
                  </div>
                  <div>
                    <span className="text-gray-500">Editor:</span> Tom Costain
                  </div>
                </div>
              )}
              
              {activeTab === 'RELEASES' && (
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span>USA</span>
                    <span>2025</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span>Netflix (Worldwide)</span>
                    <span>2025</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Actions & Rating (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Action Buttons - Horizontal Layout */}
            <div className="flex flex-wrap gap-2">
              <ActionButton icon="eye" label="Watch" />
              <ActionButton icon="heart" label="Like" />
              <ActionButton icon="list" label="Watchlist" />
            </div>
            
            {/* User Rating */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Rate</h3>
              <StarRating rating={userRating} onRate={setUserRating} />
              <div className="mt-4 space-y-2">
                <button className="text-cyan-500 text-sm hover:text-cyan-400 transition-colors">
                  Show your activity
                </button>
                <button className="text-cyan-500 text-sm hover:text-cyan-400 transition-colors block">
                  Review or log...
                </button>
              </div>
              <button className="mt-4 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors text-sm">
                Add to lists...
              </button>
              <button className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm">
                Go <span className="bg-black text-cyan-500 px-1 rounded text-xs">PATRON</span> to change images
              </button>
              <button className="mt-3 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors text-sm">
                Share
              </button>
            </div>
            
            {/* Ratings Summary */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">RATINGS</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-green-500">2.8</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} className={`w-4 h-4 ${star <= 3 ? 'text-green-500' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-400">187 FANS</div>
              <div className="text-xs text-gray-500 mt-1">Rate this movie to join!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
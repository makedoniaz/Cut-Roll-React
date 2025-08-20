import StarRating from '../components/ui/movies/StarRating';
import ActionButton from '../components/ui/buttons/ActionButton';
import CastGrid from '../components/ui/movies/CastGrid';
import RatingDistribution from '../components/ui/movies/RatingDistribution';

import TabNav from '../components/ui/common/TabNav';
import MovieDetailsPoster from '../components/ui/movies/MovieDetailsPoster';
import MovieReviews from "../components/ui/reviews/MovieReviews"
import { MovieService } from '../services/movieService';

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState(0);
  const [activeTab, setActiveTab] = useState('CAST');
  const [showAllCast, setShowAllCast] = useState(false);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch movie data
  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const movieData = await MovieService.getMovieById(id);
        setMovie(movieData);
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen from-gray-900 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-800 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-800 rounded"></div>
              </div>
              <div className="lg:col-span-6">
                <div className="h-32 bg-gray-800 rounded mb-6"></div>
                <div className="h-24 bg-gray-800 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-32 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen from-gray-900 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Movie</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/movies')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Back to Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No movie data
  if (!movie) {
    return (
      <div className="min-h-screen from-gray-900 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400 mb-4">Movie Not Found</h1>
            <button 
              onClick={() => navigate('/movies')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Back to Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  const getPosterUrl = (images) => {
    const poster = images?.find(img => img.type === 'poster');
    if (poster?.filePath) {
      return `https://image.tmdb.org/t/p/w500${poster.filePath}`;
    }
    return '/poster-placeholder.png';
  };

  const getDirector = () => {
    const director = movie.crew?.find(member => member.job === 'Director');
    return director?.person?.name || 'Unknown Director';
  };

  const getWriter = () => {
    const writer = movie.crew?.find(member => member.job === 'Writer');
    return writer?.person?.name || 'Unknown Writer';
  };

  const getReleaseYear = () => {
    if (!movie.releaseDate) return 'TBA';
    return new Date(movie.releaseDate).getFullYear();
  };

  const getGenres = () => {
    return movie.movieGenres?.map(g => g.genre?.name || 'Unknown Genre') || [];
  };

  const getCastNames = () => {
    return movie.cast?.map(member => member.person?.name || member.character || 'Unknown') || [];
  };

  const getCrewMembers = () => {
    const crewMap = {};
    movie.crew?.forEach(member => {
      if (!crewMap[member.job]) {
        crewMap[member.job] = [];
      }
      crewMap[member.job].push(member.person?.name || 'Unknown');
    });
    return crewMap;
  };

  const getProductionCountries = () => {
    return movie.productionCountries?.map(country => country.country?.name || country.countryCode || country.countryCode) || [];
  };

  const getSpokenLanguages = () => {
    return movie.spokenLanguages?.map(lang => lang.language?.name || lang.languageCode || lang.languageCode) || [];
  };

  const getProductionCompanies = () => {
    return movie.productionCompanies?.map(company => company.company?.name || company.companyId || 'Unknown Company') || [];
  };

  const getKeywords = () => {
    return movie.keywords?.map(keyword => keyword.keyword?.name || keyword.keywordId || 'Unknown Keyword') || [];
  };

  const getVideos = () => {
    return movie.videos || [];
  };

  const getImages = () => {
    return movie.images || [];
  };



  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayedCast = showAllCast ? getCastNames() : getCastNames().slice(0, 18);
  const crewMembers = getCrewMembers();
  const genres = getGenres();
  const productionCountries = getProductionCountries();
  const spokenLanguages = getSpokenLanguages();
  const productionCompanies = getProductionCompanies();
  const keywords = getKeywords();
  const videos = getVideos();
  const images = getImages();

  
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
                title={movie.title}
                views={movie.views}
                lists={movie.lists}
                likes={movie.likes}
                posterUrl={getPosterUrl(movie.images)}
              />
              
              
            </div>
          </div>
          
          {/* Center Column - Movie Info + Tabs (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title and Year */}
            <div>
              <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="text-2xl">{getReleaseYear()}</span>
                <span>Directed by {getDirector()}</span>
              </div>
            </div>
            
            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-green-500 font-semibold mb-3">
                {movie.tagline ? movie.tagline.toUpperCase() : 'MOVIE OVERVIEW'}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {movie.overview || 'No overview available for this movie.'}
              </p>
            </div>
            
            
            {/* Tabs Section - Now in Center Column */}
            <div className="space-y-6 mt-12 mb-12">
                             <TabNav 
                 tabs={['CAST', 'CREW', 'DETAILS', 'GENRES', 'VIDEOS', 'PHOTOS']}
                 activeTab={activeTab}
                 onTabChange={setActiveTab}
               />
              
              {/* Tab Content */}
              {activeTab === 'CAST' && (
                <div className="space-y-4">
                  <CastGrid cast={displayedCast} />
                  {!showAllCast && getCastNames().length > 18 && (
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
                      {movie.runtime !== undefined && movie.runtime !== null && movie.runtime > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Runtime:</span>
                          <span>{movie.runtime} mins</span>
                        </div>
                      )}
                      {movie.budget !== undefined && movie.budget !== null && movie.budget > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-mono">{formatCurrency(movie.budget)}</span>
                        </div>
                      )}
                      {movie.revenue !== undefined && movie.revenue !== null && movie.revenue > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Revenue:</span>
                          <span className="font-mono">{formatCurrency(movie.revenue)}</span>
                        </div>
                      )}
                      {movie.homepage && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Homepage:</span>
                          <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400">
                            Visit Website
                          </a>
                        </div>
                      )}
                      {movie.imdbId && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">IMDb:</span>
                          <a href={`https://www.imdb.com/title/${movie.imdbId}`} target="_blank" rel="noopener noreferrer" className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold hover:bg-yellow-500">
                            View on IMDb
                          </a>
                        </div>
                      )}
                      {productionCountries && productionCountries.length > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Production Countries:</span>
                          <span>{productionCountries.join(', ')}</span>
                        </div>
                      )}
                      {spokenLanguages && spokenLanguages.length > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Spoken Languages:</span>
                          <span>{spokenLanguages.join(', ')}</span>
                        </div>
                      )}
                      {productionCompanies && productionCompanies.length > 0 && (
                        <div className="flex gap-4">
                          <span className="text-gray-500">Production Companies:</span>
                          <div className="flex flex-wrap gap-2">
                            {productionCompanies.map((company, index) => (
                              <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs">
                                {company}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Release Information */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-400 mb-4">RELEASE INFORMATION</h4>
                      <div className="space-y-2 text-gray-300">
                        {movie.releaseDate ? (
                          <div className="flex justify-between py-2 border-b border-gray-700">
                            <span>Worldwide Release:</span>
                            <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between py-2 border-b border-gray-700">
                            <span>Worldwide Release:</span>
                            <span>TBA</span>
                          </div>
                        )}
                        {productionCountries && productionCountries.length > 0 && productionCountries.map((country, index) => (
                          <div key={index} className="flex justify-between py-2 border-b border-gray-700">
                            <span>{country} Release:</span>
                            <span>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'TBA'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-400 mb-4">KEYWORDS</h4>
                      {keywords && keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, index) => (
                            <span key={index} className="bg-blue-600 text-white px-3 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors cursor-pointer">
                              {keyword.keyword?.name || keyword.keywordId || keyword || 'Unknown Keyword'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <div className="text-2xl mb-2">🏷️</div>
                          <p>No keywords available for this movie</p>
                        </div>
                      )}
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
                   {genres && genres.length > 0 ? (
                     genres.map((genre, index) => (
                       <span key={index} className="bg-gray-700 px-4 py-2 rounded-full">{genre}</span>
                     ))
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <div className="text-4xl mb-2">🎭</div>
                       <p>No genres available for this movie</p>
                     </div>
                   )}
                 </div>
               )}
              
                             {activeTab === 'CREW' && (
                 <div className="grid grid-cols-2 gap-4 text-gray-300">
                   {crewMembers && Object.keys(crewMembers).length > 0 ? (
                     Object.entries(crewMembers).map(([job, names]) => (
                       <div key={job}>
                         <span className="text-gray-500">{job}:</span> {names.join(', ')}
                       </div>
                     ))
                   ) : (
                     <div className="col-span-2 text-gray-500 text-center py-4">
                       No crew information available
                     </div>
                   )}
                 </div>
               )}
              
                             

                             {/* VIDEOS Tab */}
               {activeTab === 'VIDEOS' && (
                 <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-gray-300 mb-4">Movie Videos</h3>
                   {videos && videos.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {videos.map((video, index) => (
                         <div key={index} className="bg-gray-800 rounded-lg p-4">
                           {video.key && video.site === 'YouTube' ? (
                             <a 
                               href={`https://www.youtube.com/watch?v=${video.key}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="block aspect-video bg-gray-700 rounded mb-3 flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer"
                             >
                               <div className="text-center">
                                 <div className="text-4xl mb-2">▶️</div>
                                 <div className="text-sm text-gray-400">Click to Watch</div>
                               </div>
                             </a>
                           ) : (
                             <div className="aspect-video bg-gray-700 rounded mb-3 flex items-center justify-center">
                               <div className="text-center">
                                 <div className="text-4xl mb-2">🎬</div>
                                 <div className="text-sm text-gray-400">{video.name || 'Video'}</div>
                               </div>
                             </div>
                           )}
                           <h4 className="font-semibold text-gray-200 mb-2">{video.name || 'Untitled Video'}</h4>
                           <p className="text-sm text-gray-400 mb-2">{video.type || 'Unknown Type'}</p>
                           {video.site && (
                             <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                               {video.site}
                             </span>
                           )}
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <div className="text-4xl mb-2">📹</div>
                       <p>No videos available for this movie</p>
                     </div>
                   )}
                 </div>
               )}

                             {/* PHOTOS Tab */}
               {activeTab === 'PHOTOS' && (
                 <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-gray-300 mb-4">Movie Photos</h3>
                   {images && images.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                       {images.map((image, index) => (
                         <div key={index} className="group cursor-pointer">
                           <div className="aspect-[4/3] bg-gray-700 rounded-lg overflow-hidden">
                             {image.filePath ? (
                               <a
                                 href={`https://image.tmdb.org/t/p/original${image.filePath}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="block w-full h-full"
                               >
                                 <img
                                   src={`https://image.tmdb.org/t/p/w500${image.filePath}`}
                                   alt={image.type || 'Movie image'}
                                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                   onError={(e) => {
                                     e.target.style.display = 'none';
                                     e.target.nextSibling.style.display = 'flex';
                                   }}
                                 />
                               </a>
                             ) : null}
                             <div className="hidden w-full h-full bg-gray-600 items-center justify-center group-hover:flex">
                               <div className="text-center">
                                 <div className="text-2xl mb-1">🖼️</div>
                                 <div className="text-xs text-gray-400">{image.type || 'Image'}</div>
                               </div>
                             </div>
                           </div>
                           <div className="mt-2 text-center">
                             <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                               {image.type || 'Unknown'}
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <div className="text-4xl mb-2">📸</div>
                       <p>No photos available for this movie</p>
                     </div>
                   )}
                 </div>
               )}

                             


            </div>
            
            <MovieReviews heading={"RECENT REVIEWS"} />
            <MovieReviews heading={"POPULAR REVIEWS"} />
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
                <span className="text-3xl font-bold text-green-500">
                  {movie.voteAverage !== undefined && movie.voteAverage !== null && movie.voteAverage > 0 ? movie.voteAverage.toFixed(1) : 'N/A'}
                </span>
                {movie.voteAverage !== undefined && movie.voteAverage !== null && movie.voteAverage > 0 && (
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} className={`w-4 h-4 ${star <= Math.round(movie.voteAverage / 2) ? 'text-green-500' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
              </div>
                             <div className="text-sm text-gray-400">
                 {movie.rating !== undefined && movie.rating !== null && movie.rating > 0 ? `${movie.rating} RATINGS` : 'NO RATINGS YET'}
               </div>
              <div className="text-xs text-gray-500 mt-1">Rate this movie to join!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
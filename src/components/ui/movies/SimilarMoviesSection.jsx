import { useState } from 'react';
import { RecommendationsService } from '../../../services/recommendationsService';
import SimilarMovieCard from './SimilarMovieCard';
import DropdownSectionHeading from '../common/DropdownSectionHeading';

const SimilarMoviesSection = ({ movieId }) => {
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchSimilarMovies = async () => {
    if (!movieId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await RecommendationsService.getSimilarMovies({
        movieId: movieId,
        limit: 12,
        excludeMovieIds: [movieId]
      });
      
      setSimilarMovies(response || []);
      setHasLoaded(true);
    } catch (err) {
      console.error('Error fetching similar movies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (expanded) => {
    setIsExpanded(expanded);
    
    // Only fetch data when expanding for the first time
    if (expanded && !hasLoaded) {
      await fetchSimilarMovies();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-4 gap-3">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-700 rounded-md h-48 w-full"></div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">⚠️</div>
          <p className="text-gray-400">Failed to load similar movies</p>
        </div>
      );
    }

    if (!similarMovies || similarMovies.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">🎬</div>
          <p className="text-gray-400">No similar movies found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 gap-3">
        {similarMovies.map((movie, index) => (
          <SimilarMovieCard key={movie.movieId || index} movie={movie} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <DropdownSectionHeading 
        heading="SIMILAR MOVIES" 
        onToggle={handleToggle}
        isExpanded={isExpanded}
        loading={loading}
      />
      {isExpanded && renderContent()}
    </div>
  );
};

export default SimilarMoviesSection;

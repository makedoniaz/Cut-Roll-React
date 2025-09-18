import { useState, useEffect } from 'react';
import { RecommendationsService } from '../../../services/recommendationsService';
import SimilarMovieCard from './SimilarMovieCard';
import SectionHeading from '../common/SectionHeading';

const SimilarMoviesSection = ({ movieId }) => {
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!movieId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await RecommendationsService.getSimilarMovies({
          movieId: movieId,
          limit: 12,
          excludeMovieIds: []
        });
        
        setSimilarMovies(response || []);
      } catch (err) {
        console.error('Error fetching similar movies:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarMovies();
  }, [movieId]);

  if (loading) {
    return (
      <div>
        <SectionHeading heading="SIMILAR MOVIES" showMore={false} />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-700 rounded-md h-48 w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <SectionHeading heading="SIMILAR MOVIES" showMore={false} />
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">⚠️</div>
          <p className="text-gray-400">Failed to load similar movies</p>
        </div>
      </div>
    );
  }

  if (!similarMovies || similarMovies.length === 0) {
    return (
      <div>
        <SectionHeading heading="SIMILAR MOVIES" showMore={false} />
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">🎬</div>
          <p className="text-gray-400">No similar movies found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeading heading="SIMILAR MOVIES" showMore={false} />
      <div className="grid grid-cols-4 gap-3">
        {similarMovies.map((movie, index) => (
          <SimilarMovieCard key={movie.movieId || index} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default SimilarMoviesSection;

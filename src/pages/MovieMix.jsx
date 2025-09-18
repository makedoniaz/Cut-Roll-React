import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MovieGrid from "../components/ui/movies/MovieGrid";
import MovieMixCard from '../components/ui/movies/MovieMixCard';
import { useAuthStore } from '../stores/authStore';

const MovieMix = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mixData, setMixData] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            navigate('/login');
            return;
        }

        // Get mix data from location state
        const { mixData: passedMixData, recommendations } = location.state || {};
        
        if (!passedMixData || !recommendations) {
            setError('No mix data available');
            setLoading(false);
            return;
        }

        setMixData(passedMixData);
        
        // Debug logging
        console.log('Raw recommendations:', recommendations);
        console.log('First movie posterPath:', recommendations[0]?.posterPath);
        
        // Transform recommendations to match expected movie format
        const transformedMovies = recommendations.map(item => {
            // Clean up posterPath - remove quotes if present
            let cleanPosterPath = item.posterPath;
            if (typeof cleanPosterPath === 'string') {
                cleanPosterPath = cleanPosterPath.replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes
            }
            
            return {
                id: item.movieId,
                title: item.title,
                year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'TBA',
                poster: cleanPosterPath ? { filePath: cleanPosterPath } : null,
                rating: item.voteAverage || 0,
                overview: item.overview,
                similarityScore: item.similarityScore,
                recommendationReason: item.recommendationReason,
                matchingGenres: item.matchingGenres,
                matchingKeywords: item.matchingKeywords
            };
        });

        console.log('Transformed movies:', transformedMovies);
        console.log('First transformed movie poster:', transformedMovies[0]?.poster);
        console.log('First movie poster filePath:', transformedMovies[0]?.poster?.filePath);
        console.log('Expected TMDB URL:', transformedMovies[0]?.poster?.filePath ? `https://image.tmdb.org/t/p/w500${transformedMovies[0].poster.filePath}` : 'No poster');

        setMovies(transformedMovies);
        setLoading(false);
    }, [location.state, isAuthenticated, user?.id, navigate]);

    if (error) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">{error}</div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-white text-xl">Loading mix...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Go Back"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-bold text-white">Movie Mix</h1>
                    </div>
                </div>

                {/* Mix Description */}
                <div className="mb-8">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                                <span className="text-lg font-semibold text-white">Mix Created</span>
                            </div>
                        </div>
                        
                        <p className="text-lg text-gray-300 mb-2">
                            This mix combines the preferences of{' '}
                            <button
                                onClick={() => navigate(`/profile/${mixData?.user1Name}`)}
                                className="font-semibold text-white hover:text-green-400 transition-colors"
                            >
                                {mixData?.user1Name}
                            </button>
                            {' '}and{' '}
                            <button
                                onClick={() => navigate(`/profile/${mixData?.user2Name}`)}
                                className="font-semibold text-white hover:text-green-400 transition-colors"
                            >
                                {mixData?.user2Name}
                            </button>
                        </p>
                        
                        <p className="text-gray-400">
                            Based on your shared interests and preferences, we've found {movies.length} movies that both of you might enjoy.
                        </p>
                    </div>
                </div>

                {/* Movies Grid */}
                {movies.length > 0 ? (
                    <div className="mb-10">
                        <MovieGrid 
                            heading={`Recommended Movies (${movies.length})`}
                            rows={Math.ceil(movies.length / 6)} 
                            itemsPerRow={6} 
                            movies={movies} 
                            CardComponent={MovieMixCard}
                            showMore={false}
                        />
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🎬</div>
                        <h2 className="text-2xl font-semibold text-gray-300 mb-2">No recommendations found</h2>
                        <p className="text-gray-500">We couldn't find movies that match both users' preferences.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieMix;

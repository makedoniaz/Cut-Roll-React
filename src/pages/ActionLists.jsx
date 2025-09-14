import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MovieGrid from "../components/ui/movies/MovieGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import { WatchService } from '../services/watchService';
import { MovieLikeService } from '../services/movieLikeService';
import { WatchedService } from '../services/watchedService';
import { useAuthStore } from '../stores/authStore';

const ActionLists = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 24; // Show more movies on the dedicated page

    // Configuration for different list types
    const listConfig = {
        'want-to-watch': {
            title: 'Want to Watch',
            description: 'Movies you want to watch',
            fetchFunction: WatchService.getWantToWatchByUser,
            emptyMessage: 'No movies in your watchlist yet',
            emptySubMessage: 'Add movies to your watchlist to see them here!',
            emptyIcon: '📋'
        },
        'recently-watched': {
            title: 'Recently Watched',
            description: 'Movies you have recently watched',
            fetchFunction: WatchedService.getWatchedByUser,
            emptyMessage: 'No watched movies yet',
            emptySubMessage: 'Watch some movies to see them here!',
            emptyIcon: '👁️'
        },
        'recently-liked': {
            title: 'Recently Liked',
            description: 'Movies you have recently liked',
            fetchFunction: MovieLikeService.getLikedByUser,
            emptyMessage: 'No liked movies yet',
            emptySubMessage: 'Like some movies to see them here!',
            emptyIcon: '💚'
        }
    };

    const config = listConfig[type];

    useEffect(() => {
        if (!config) {
            setError('Invalid list type');
            setLoading(false);
            return;
        }

        if (!isAuthenticated || !user?.id) {
            navigate('/login');
            return;
        }

        fetchMovies();
    }, [type, isAuthenticated, user?.id, page]);

    const fetchMovies = async () => {
        if (!config) return;

        try {
            if (page === 0) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            const response = await config.fetchFunction({
                userId: user.id,
                page: page,
                pageSize: pageSize
            });

            // Handle different possible response formats
            let fetchedMovies = [];
            if (response && typeof response === 'object') {
                if (Array.isArray(response)) {
                    fetchedMovies = response;
                } else if (response.movies && Array.isArray(response.movies)) {
                    fetchedMovies = response.movies;
                } else if (response.data && Array.isArray(response.data)) {
                    fetchedMovies = response.data;
                }
            }

            // Transform the response to match the expected movie format
            const transformedMovies = fetchedMovies.map(item => {
                // Handle different item structures
                const movie = item.movie || item;
                
                return {
                    id: movie.movieId || movie.id,
                    title: movie.title,
                    year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA',
                    poster: movie.poster || null,
                    rating: 0 // API doesn't provide rating in this response
                };
            });

            if (page === 0) {
                setMovies(transformedMovies);
            } else {
                setMovies(prev => [...prev, ...transformedMovies]);
            }

            setHasMore(transformedMovies.length === pageSize);
        } catch (error) {
            console.error(`Error fetching ${config.title} movies:`, error);
            setError(`Failed to fetch ${config.title.toLowerCase()} movies`);
        } finally {
            if (page === 0) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">Invalid list type</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">{error}</div>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setError(null);
                                setPage(0);
                                fetchMovies();
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">{config.title}</h1>
            </div>

            {/* List Description */}
            <div className="mb-8">
                <p className="text-lg text-gray-300 max-w-4xl leading-relaxed">
                    {config.description}
                </p>
            </div>

            {/* Movies Grid */}
            {loading && page === 0 ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-white text-xl">Loading movies...</div>
                </div>
            ) : movies.length > 0 ? (
                <div className="mb-10">
                    <MovieGrid 
                        heading={`${config.title} (${movies.length})`}
                        rows={Math.ceil(movies.length / 6)} 
                        itemsPerRow={6} 
                        movies={movies} 
                        CardComponent={SmallMovieCard}
                        showMore={false}
                    />
                    
                    {/* Load More Button */}
                    {hasMore && (
                        <div className="text-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loadingMore ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </div>
                                ) : (
                                    'Load More'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">{config.emptyIcon}</div>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-2">{config.emptyMessage}</h2>
                    <p className="text-gray-500">{config.emptySubMessage}</p>
                </div>
            )}
        </div>
    );
};

export default ActionLists;
